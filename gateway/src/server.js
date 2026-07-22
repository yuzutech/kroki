import express from 'express'
import pg from 'pg'
import crypto from 'node:crypto'
import http from 'node:http'
import { WebSocketServer } from 'ws'
import * as Y from 'yjs'

const { Pool } = pg
const app = express()
const port = Number(process.env.PORT || 8080)
const core = process.env.KROKI_URL || 'http://code-to-uml-core:8000'
const publicUrl = process.env.PUBLIC_URL || 'http://localhost:8000'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const secureCookies = process.env.COOKIE_SECURE === 'true'
const guestLimit = Number(process.env.GUEST_RATE_LIMIT || 20)
const userLimit = Number(process.env.USER_RATE_LIMIT || 120)
const buckets = new Map()
const collaborativeDocs = new Map()

app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))
app.use(express.text({ type: ['text/plain', 'application/xml'], limit: '2mb' }))
app.use('/assets', express.static(new URL('../public', import.meta.url).pathname, { immutable:true, maxAge:'1h' }))

const sha = value => crypto.createHash('sha256').update(value).digest('hex')
const random = (prefix = '', bytes = 32) => prefix + crypto.randomBytes(bytes).toString('base64url')
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(v => { const i=v.indexOf('='); return [v.slice(0,i).trim(), decodeURIComponent(v.slice(i+1))] }))
const jsonError = (res, status, message) => res.status(status).json({ error: message })

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`
}
function passwordValid(password, stored) {
  const [salt, expected] = stored.split(':')
  const actual = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(actual, Buffer.from(expected, 'hex'))
}

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY, email text UNIQUE NOT NULL, display_name text NOT NULL,
      password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name text NOT NULL, key_prefix text NOT NULL, secret_hash text UNIQUE NOT NULL,
      last_used_at timestamptz, expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS device_codes (
      device_hash text PRIMARY KEY, user_code text UNIQUE NOT NULL, user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'pending', expires_at timestamptz NOT NULL, interval_seconds int NOT NULL DEFAULT 5
    );
    CREATE TABLE IF NOT EXISTS diagrams (
      id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name text NOT NULL, engine text NOT NULL, source text NOT NULL, options jsonb NOT NULL DEFAULT '{}',
      is_public boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS diagram_versions (
      id bigserial PRIMARY KEY, diagram_id uuid NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
      source text NOT NULL, options jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS share_links (
      id uuid PRIMARY KEY, diagram_id uuid NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
      created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash text UNIQUE NOT NULL,
      permission text NOT NULL CHECK(permission IN ('view','edit')), expires_at timestamptz,
      revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS share_links_diagram_idx ON share_links(diagram_id);
    CREATE TABLE IF NOT EXISTS render_cache (
      cache_key text PRIMARY KEY, content_type text NOT NULL, body bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS diagrams_user_idx ON diagrams(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS render_cache_expiry_idx ON render_cache(expires_at);
  `)
}

async function identify(req) {
  const auth = req.headers.authorization || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (bearer?.startsWith('ctu_')) {
    const q = await pool.query(`UPDATE api_keys k SET last_used_at=now() FROM users u WHERE k.secret_hash=$1 AND (k.expires_at IS NULL OR k.expires_at>now()) AND u.id=k.user_id RETURNING u.id,u.email,u.display_name`, [sha(bearer)])
    if (q.rows[0]) return { ...q.rows[0], method: 'api_key' }
  }
  const token = cookies(req).ctu_session || (bearer?.startsWith('ctu_access_') ? bearer : null)
  if (token) {
    const q = await pool.query(`SELECT u.id,u.email,u.display_name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()`, [sha(token)])
    if (q.rows[0]) return { ...q.rows[0], method: bearer ? 'access_token' : 'session' }
  }
  return null
}
app.use(async (req, _res, next) => { try { req.identity = await identify(req); next() } catch (e) { next(e) } })
const requireUser = (req, res, next) => req.identity ? next() : jsonError(res, 401, 'Authentication required')

async function newSession(userId, res, asToken = false) {
  const token = random(asToken ? 'ctu_access_' : 'ctu_session_')
  await pool.query(`INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 days')`, [sha(token), userId])
  if (!asToken) res.cookie('ctu_session', token, { httpOnly: true, sameSite: 'lax', secure: secureCookies, maxAge: 30*86400*1000, path: '/' })
  return token
}

app.post('/api/auth/register', async (req,res,next) => { try {
  const email=String(req.body.email||'').trim().toLowerCase(), password=String(req.body.password||''), name=String(req.body.name||'').trim()
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length<10 || !name) return jsonError(res,400,'Name, valid email, and password of at least 10 characters are required')
  const id=crypto.randomUUID(); await pool.query(`INSERT INTO users(id,email,display_name,password_hash) VALUES($1,$2,$3,$4)`,[id,email,name,passwordHash(password)])
  await newSession(id,res); res.status(201).json({id,email,display_name:name})
} catch(e) { if(e.code==='23505') return jsonError(res,409,'Email already registered'); next(e) } })
app.post('/api/auth/login', async (req,res,next) => { try {
  const q=await pool.query(`SELECT * FROM users WHERE email=$1`,[String(req.body.email||'').trim().toLowerCase()]); const u=q.rows[0]
  if(!u || !passwordValid(String(req.body.password||''),u.password_hash)) return jsonError(res,401,'Invalid email or password')
  await newSession(u.id,res); res.json({id:u.id,email:u.email,display_name:u.display_name})
} catch(e){next(e)} })
app.post('/api/auth/logout', async(req,res,next)=>{ try { const token=cookies(req).ctu_session; if(token) await pool.query(`DELETE FROM sessions WHERE token_hash=$1`,[sha(token)]); res.clearCookie('ctu_session',{path:'/'}); res.status(204).end() }catch(e){next(e)} })
app.get('/api/auth/me', requireUser, async(req,res)=>res.json(req.identity))

app.post('/api/auth/device/start', async(req,res,next)=>{ try {
  const device=random('ctu_device_'), userCode=crypto.randomBytes(4).toString('hex').toUpperCase()
  await pool.query(`INSERT INTO device_codes(device_hash,user_code,expires_at) VALUES($1,$2,now()+interval '10 minutes')`,[sha(device),userCode])
  res.status(201).json({device_code:device,user_code:userCode,verification_uri:`${publicUrl}/activate`,verification_uri_complete:`${publicUrl}/activate?code=${userCode}`,expires_in:600,interval:5})
}catch(e){next(e)} })
app.post('/api/auth/device/approve', requireUser, async(req,res,next)=>{ try {
  const q=await pool.query(`UPDATE device_codes SET status='approved',user_id=$1 WHERE user_code=$2 AND status='pending' AND expires_at>now() RETURNING user_code`,[req.identity.id,String(req.body.user_code||'').toUpperCase()])
  q.rows[0]?res.json({approved:true}):jsonError(res,404,'Device code is invalid or expired')
}catch(e){next(e)} })
app.post('/api/auth/device/token', async(req,res,next)=>{ try {
  const q=await pool.query(`SELECT * FROM device_codes WHERE device_hash=$1`,[sha(String(req.body.device_code||''))]); const d=q.rows[0]
  if(!d || new Date(d.expires_at)<new Date()) return jsonError(res,400,'expired_token')
  if(d.status!=='approved') return jsonError(res,428,'authorization_pending')
  const token=await newSession(d.user_id,res,true); await pool.query(`DELETE FROM device_codes WHERE device_hash=$1`,[d.device_hash]); res.json({access_token:token,token_type:'Bearer',expires_in:2592000})
}catch(e){next(e)} })

app.get('/activate', (req,res)=>res.type('html').send(`<!doctype html><meta charset="utf-8"><title>Connect Code To UML</title><style>body{font:16px system-ui;background:#080d18;color:#edf4ff;display:grid;place-items:center;height:100vh;margin:0}.c{width:360px;background:#111b2d;padding:28px;border:1px solid #26344d;border-radius:14px}input,button{width:100%;padding:12px;margin-top:10px;box-sizing:border-box}button{background:#5366df;color:white;border:0;border-radius:7px}</style><form class="c" id="f"><h2>Connect your extension</h2><p>Approve the code shown by VS Code.</p><input id="code" value="${String(req.query.code||'').replace(/[^A-F0-9]/g,'')}" placeholder="Device code" required><button>Approve device</button><p id="m"></p></form><script>f.onsubmit=async e=>{e.preventDefault();let r=await fetch('/api/auth/device/approve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user_code:code.value})});m.textContent=r.ok?'Device connected. You may close this tab.':(r.status===401?'Please log in on the playground first.':'Invalid or expired code.')}</script>`))

app.get('/api/keys',requireUser,async(req,res,next)=>{try{const q=await pool.query(`SELECT id,name,key_prefix,last_used_at,expires_at,created_at FROM api_keys WHERE user_id=$1 ORDER BY created_at DESC`,[req.identity.id]);res.json(q.rows)}catch(e){next(e)}})
app.post('/api/keys',requireUser,async(req,res,next)=>{const client=await pool.connect();try{const secret=random('ctu_',32),id=crypto.randomUUID(),name=String(req.body.name||'API key').slice(0,80);await client.query('BEGIN');await client.query(`DELETE FROM api_keys WHERE user_id=$1`,[req.identity.id]);await client.query(`INSERT INTO api_keys(id,user_id,name,key_prefix,secret_hash) VALUES($1,$2,$3,$4,$5)`,[id,req.identity.id,name,secret.slice(0,12),sha(secret)]);await client.query('COMMIT');res.status(201).json({id,name,key:secret,replaced_previous_keys:true,warning:'Copy this key now. It will not be shown again.'})}catch(e){await client.query('ROLLBACK');next(e)}finally{client.release()}})
app.delete('/api/keys/:id',requireUser,async(req,res,next)=>{try{await pool.query(`DELETE FROM api_keys WHERE id=$1 AND user_id=$2`,[req.params.id,req.identity.id]);res.status(204).end()}catch(e){next(e)}})

app.get('/api/diagrams',requireUser,async(req,res,next)=>{try{const q=await pool.query(`SELECT id,name,engine,options,is_public,created_at,updated_at FROM diagrams WHERE user_id=$1 ORDER BY updated_at DESC`,[req.identity.id]);res.json(q.rows)}catch(e){next(e)}})
app.post('/api/diagrams',requireUser,async(req,res,next)=>{try{const id=crypto.randomUUID(),{name,engine,source,options={},is_public=false}=req.body;if(!name||!engine||!source)return jsonError(res,400,'name, engine and source are required');await pool.query('BEGIN');await pool.query(`INSERT INTO diagrams(id,user_id,name,engine,source,options,is_public) VALUES($1,$2,$3,$4,$5,$6,$7)`,[id,req.identity.id,name,engine,source,options,is_public]);await pool.query(`INSERT INTO diagram_versions(diagram_id,source,options) VALUES($1,$2,$3)`,[id,source,options]);await pool.query('COMMIT');res.status(201).json({id,name,engine})}catch(e){await pool.query('ROLLBACK');next(e)}})
app.get('/api/diagrams/:id',requireUser,async(req,res,next)=>{try{const q=await pool.query(`SELECT * FROM diagrams WHERE id=$1 AND user_id=$2`,[req.params.id,req.identity.id]);q.rows[0]?res.json(q.rows[0]):jsonError(res,404,'Diagram not found')}catch(e){next(e)}})
app.put('/api/diagrams/:id',requireUser,async(req,res,next)=>{try{const {name,engine,source,options={},is_public=false}=req.body;const q=await pool.query(`UPDATE diagrams SET name=$1,engine=$2,source=$3,options=$4,is_public=$5,updated_at=now() WHERE id=$6 AND user_id=$7 RETURNING id`,[name,engine,source,options,is_public,req.params.id,req.identity.id]);if(!q.rows[0])return jsonError(res,404,'Diagram not found');await pool.query(`INSERT INTO diagram_versions(diagram_id,source,options) VALUES($1,$2,$3)`,[req.params.id,source,options]);res.json({id:req.params.id})}catch(e){next(e)}})

app.post('/api/diagrams/:id/share',requireUser,async(req,res,next)=>{try{
  const permission=req.body.permission==='view'?'view':'edit'
  const owned=await pool.query(`SELECT id FROM diagrams WHERE id=$1 AND user_id=$2`,[req.params.id,req.identity.id]);if(!owned.rows[0])return jsonError(res,404,'Diagram not found')
  const token=random('ctu_share_',32),id=crypto.randomUUID(),days=Math.min(365,Math.max(1,Number(req.body.expires_in_days||30)))
  await pool.query(`INSERT INTO share_links(id,diagram_id,created_by,token_hash,permission,expires_at) VALUES($1,$2,$3,$4,$5,now()+($6 || ' days')::interval)`,[id,req.params.id,req.identity.id,sha(token),permission,String(days)])
  res.status(201).json({id,permission,url:`${publicUrl}/?share=${encodeURIComponent(token)}`,expires_in_days:days})
}catch(e){next(e)}})
app.get('/api/diagrams/:id/shares',requireUser,async(req,res,next)=>{try{const q=await pool.query(`SELECT s.id,s.permission,s.expires_at,s.created_at FROM share_links s JOIN diagrams d ON d.id=s.diagram_id WHERE d.id=$1 AND d.user_id=$2 AND s.revoked_at IS NULL ORDER BY s.created_at DESC`,[req.params.id,req.identity.id]);res.json(q.rows)}catch(e){next(e)}})
app.delete('/api/diagrams/:diagramId/shares/:shareId',requireUser,async(req,res,next)=>{try{await pool.query(`UPDATE share_links s SET revoked_at=now() FROM diagrams d WHERE s.id=$1 AND s.diagram_id=d.id AND d.id=$2 AND d.user_id=$3`,[req.params.shareId,req.params.diagramId,req.identity.id]);res.status(204).end()}catch(e){next(e)}})
app.get('/api/shared/:token',async(req,res,next)=>{try{const q=await pool.query(`SELECT d.id,d.name,d.engine,d.options,s.permission,s.expires_at FROM share_links s JOIN diagrams d ON d.id=s.diagram_id WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND (s.expires_at IS NULL OR s.expires_at>now())`,[sha(req.params.token)]);q.rows[0]?res.json(q.rows[0]):jsonError(res,404,'Share link is invalid or expired')}catch(e){next(e)}})

function rateLimit(req,res,next){const key=req.identity?.id||req.ip,limit=req.identity?userLimit:guestLimit,minute=Math.floor(Date.now()/60000),id=`${key}:${minute}`,count=(buckets.get(id)||0)+1;buckets.set(id,count);res.set('X-RateLimit-Limit',String(limit));res.set('X-RateLimit-Remaining',String(Math.max(0,limit-count)));if(count>limit)return jsonError(res,429,'Rate limit exceeded');next()}
const renderPath=/^\/(plantuml|c4plantuml|mermaid|graphviz|dot|d2|structurizr|blockdiag|seqdiag|actdiag|nwdiag|packetdiag|rackdiag|bpmn|dbml|diagramsnet|ditaa|erd|excalidraw|goat|nomnoml|pikchr|svgbob|symbolator|umlet|vega|vegalite|wavedrom|bytefield|wireviz|tikz)\/(svg|png|pdf|jpeg|txt)$/
app.post(renderPath,rateLimit,async(req,res,next)=>{try{
  const source=typeof req.body==='string'?req.body:JSON.stringify(req.body), options=Object.fromEntries(Object.entries(req.headers).filter(([k])=>k.startsWith('kroki-diagram-options-'))), cacheKey=sha(`${req.path}\0${JSON.stringify(options)}\0${source}`)
  const hit=await pool.query(`SELECT content_type,body FROM render_cache WHERE cache_key=$1 AND expires_at>now()`,[cacheKey]);if(hit.rows[0]){res.set({'Content-Type':hit.rows[0].content_type,'X-Cache':'HIT','ETag':`"${cacheKey}"`});return res.send(hit.rows[0].body)}
  const headers={'content-type':req.headers['content-type']||'text/plain','accept':req.headers.accept||'*/*',...options};const upstream=await fetch(core+req.originalUrl,{method:'POST',headers,body:source});const body=Buffer.from(await upstream.arrayBuffer()),ct=upstream.headers.get('content-type')||'application/octet-stream'
  if(upstream.ok)await pool.query(`INSERT INTO render_cache(cache_key,content_type,body,expires_at) VALUES($1,$2,$3,now()+interval '24 hours') ON CONFLICT(cache_key) DO UPDATE SET body=EXCLUDED.body,expires_at=EXCLUDED.expires_at`,[cacheKey,ct,body])
  res.status(upstream.status).set({'Content-Type':ct,'X-Cache':'MISS','ETag':`"${cacheKey}"`}).send(body)
}catch(e){next(e)}})

app.use(async(req,res,next)=>{try{const upstream=await fetch(core+req.originalUrl,{method:req.method,headers:{accept:req.headers.accept||'*/*'}});res.status(upstream.status);upstream.headers.forEach((v,k)=>res.set(k,v));res.send(Buffer.from(await upstream.arrayBuffer()))}catch(e){next(e)}})
app.use((err,_req,res,_next)=>{console.error(err);jsonError(res,500,'Internal server error')})

await migrate()
const server=http.createServer(app)
const wss=new WebSocketServer({noServer:true,maxPayload:1024*1024})

const encode=bytes=>Buffer.from(bytes).toString('base64')
const decode=value=>new Uint8Array(Buffer.from(value,'base64'))
async function authorizeCollaboration(req,diagramId,shareToken){
  const identity=await identify(req)
  if(identity){const q=await pool.query(`SELECT id,name,engine,source,user_id FROM diagrams WHERE id=$1`,[diagramId]);if(q.rows[0]&&q.rows[0].user_id===identity.id)return{diagram:q.rows[0],permission:'owner',identity}}
  if(shareToken){const q=await pool.query(`SELECT d.id,d.name,d.engine,d.source,d.user_id,s.permission FROM share_links s JOIN diagrams d ON d.id=s.diagram_id WHERE d.id=$1 AND s.token_hash=$2 AND s.revoked_at IS NULL AND (s.expires_at IS NULL OR s.expires_at>now())`,[diagramId,sha(shareToken)]);if(q.rows[0])return{diagram:q.rows[0],permission:q.rows[0].permission,identity:null}}
  return null
}
async function getCollaborativeDoc(diagram){
  if(collaborativeDocs.has(diagram.id))return collaborativeDocs.get(diagram.id)
  const doc=new Y.Doc(),text=doc.getText('source');text.insert(0,diagram.source||'')
  const room={doc,text,clients:new Set(),diagram,persistTimer:null,evictionTimer:null}
  doc.on('update',(update,origin)=>{
    for(const client of room.clients)if(client!==origin&&client.readyState===1)client.send(JSON.stringify({type:'update',update:encode(update)}))
    clearTimeout(room.persistTimer);room.persistTimer=setTimeout(async()=>{try{const source=text.toString();await pool.query(`UPDATE diagrams SET source=$1,updated_at=now() WHERE id=$2`,[source,diagram.id]);await pool.query(`INSERT INTO diagram_versions(diagram_id,source,options) VALUES($1,$2,'{}')`,[diagram.id,source])}catch(error){console.error('collaboration persistence failed',error)}},1200)
  })
  collaborativeDocs.set(diagram.id,room);return room
}
function broadcastPresence(room){const users=[...room.clients].map(client=>({id:client.clientId,name:client.displayName,permission:client.permission}));const payload=JSON.stringify({type:'presence',users});for(const client of room.clients)if(client.readyState===1)client.send(payload)}

server.on('upgrade',async(req,socket,head)=>{try{
  const url=new URL(req.url,publicUrl),match=url.pathname.match(/^\/ws\/diagrams\/([0-9a-f-]{36})$/i);if(!match){socket.destroy();return}
  const access=await authorizeCollaboration(req,match[1],url.searchParams.get('share'));if(!access){socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>{ws.access=access;wss.emit('connection',ws,req)})
}catch(error){console.error(error);socket.destroy()}})

wss.on('connection',async ws=>{
  const {diagram,permission,identity}=ws.access,room=await getCollaborativeDoc(diagram)
  clearTimeout(room.evictionTimer);room.clients.add(ws);ws.permission=permission;ws.clientId=crypto.randomUUID();ws.displayName=identity?.display_name||`Guest ${ws.clientId.slice(0,4)}`
  ws.send(JSON.stringify({type:'sync',update:encode(Y.encodeStateAsUpdate(room.doc)),metadata:{id:diagram.id,name:diagram.name,engine:diagram.engine,permission}}));broadcastPresence(room)
  ws.on('message',data=>{try{const message=JSON.parse(data.toString());if(message.type==='update'&&permission!=='view'&&typeof message.update==='string')Y.applyUpdate(room.doc,decode(message.update),ws)}catch(error){console.error('invalid collaboration message',error)}})
  ws.on('close',()=>{room.clients.delete(ws);broadcastPresence(room);if(room.clients.size===0)room.evictionTimer=setTimeout(()=>{if(room.clients.size===0){room.doc.destroy();collaborativeDocs.delete(diagram.id)}},60000)})
})

server.listen(port,'0.0.0.0',()=>console.log(`Code To UML gateway listening on ${port}`))
