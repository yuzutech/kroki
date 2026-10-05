import{a as P}from"./chunk-V3KJR4XU.mjs";import{a as j}from"./chunk-Y5O5OPKC.mjs";import"./chunk-3T2MNPEU.mjs";import"./chunk-MLQVGYRW.mjs";import"./chunk-QX7LGXZU.mjs";import"./chunk-22SYA5HA.mjs";import"./chunk-YZG4BXY6.mjs";import"./chunk-NRRTYJAG.mjs";import"./chunk-CVBX6EWK.mjs";import"./chunk-RXM7Z7NK.mjs";import"./chunk-HI3EPXIC.mjs";import"./chunk-5NYYYZGL.mjs";import"./chunk-H7BX327W.mjs";import"./chunk-LIEGGFIX.mjs";import"./chunk-LLWYPJEZ.mjs";import"./chunk-2FTYKNOQ.mjs";import"./chunk-36VM3LGA.mjs";import"./chunk-44AU3KAP.mjs";import{a as V}from"./chunk-S4TE5DX6.mjs";import{o as R}from"./chunk-QADHU5CF.mjs";import"./chunk-ZZ52EIBP.mjs";import{P as w,T as S,U as M,V as O,W as T,X as G,Y as L,Z as k,h as v,j as A,u as C}from"./chunk-FE53TMRB.mjs";import{b as $}from"./chunk-L2B47AAZ.mjs";import{a as n}from"./chunk-QVIEFLGF.mjs";var f={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},D=32,I={axes:[],curves:[],options:f},g=structuredClone(I),W=A.radar,H=n(()=>R({...W,...C().radar}),"getConfig"),E=n(()=>g.axes,"getAxes"),U=n(()=>g.curves,"getCurves"),N=n(()=>g.options,"getOptions"),X=n(e=>{g.axes=e.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),K=n(e=>{g.curves=e.map(t=>({name:t.name,label:t.label??t.name,entries:Y(t.entries)}))},"setCurves"),Y=n(e=>{if(e[0].axis==null)return e.map(r=>r.value);let t=E();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(r=>{let a=e.find(o=>o.axis?.$refText===r.name);if(a===void 0)throw new Error("Missing entry for axis "+r.label);return a.value})},"computeCurveEntries"),Z=n(e=>{let t=e.reduce((r,a)=>(r[a.name]=a,r),{});g.options={showLegend:t.showLegend?.value??f.showLegend,ticks:t.ticks?.value??f.ticks,max:t.max?.value??f.max,min:t.min?.value??f.min,graticule:t.graticule?.value??f.graticule},g.options.ticks>D&&($.warn(`Radar diagram ticks (${g.options.ticks}) exceeds maximum allowed (${D}). Using ${D} instead.`),g.options.ticks=D)},"setOptions"),J=n(()=>{S(),g=structuredClone(I)},"clear"),x={getAxes:E,getCurves:U,getOptions:N,setAxes:X,setCurves:K,setOptions:Z,getConfig:H,clear:J,setAccTitle:M,getAccTitle:O,setDiagramTitle:L,getDiagramTitle:k,getAccDescription:G,setAccDescription:T};var Q=n(e=>{P(e,x);let{axes:t,curves:r,options:a}=e;x.setAxes(t),x.setCurves(r),x.setOptions(a)},"populate"),F={parse:n(async e=>{let t=await j("radar",e);$.debug(t),Q(t)},"parse")};var tt=n((e,t,r,a)=>{let o=a.db,c=o.getAxes(),m=o.getCurves(),i=o.getOptions(),s=o.getConfig(),l=o.getDiagramTitle(),p=V(t),d=rt(p,s),u=i.max??Math.max(...m.map(b=>Math.max(...b.entries))),h=i.min,y=Math.min(s.width,s.height)/2;et(d,c,y,i.ticks,i.graticule),at(d,c,y,s),ot(d,c,m,h,u,i.graticule,s),st(d,m,i.showLegend,s),d.append("text").attr("class","radarTitle").text(l).attr("x",0).attr("y",-s.height/2-s.marginTop)},"draw"),rt=n((e,t)=>{let r=t.width+t.marginLeft+t.marginRight,a=t.height+t.marginTop+t.marginBottom,o={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return w(e,a,r,t.useMaxWidth??!0),e.attr("viewBox",`0 0 ${r} ${a}`).attr("overflow","visible"),e.append("g").attr("transform",`translate(${o.x}, ${o.y})`)},"drawFrame"),et=n((e,t,r,a,o)=>{if(o==="circle")for(let c=0;c<a;c++){let m=r*(c+1)/a;e.append("circle").attr("r",m).attr("class","radarGraticule")}else if(o==="polygon"){let c=t.length;for(let m=0;m<a;m++){let i=r*(m+1)/a,s=t.map((l,p)=>{let d=2*p*Math.PI/c-Math.PI/2,u=i*Math.cos(d),h=i*Math.sin(d);return`${u},${h}`}).join(" ");e.append("polygon").attr("points",s).attr("class","radarGraticule")}}},"drawGraticule"),at=n((e,t,r,a)=>{let o=t.length;for(let c=0;c<o;c++){let m=t[c].label,i=2*c*Math.PI/o-Math.PI/2,s=Math.cos(i),l=Math.sin(i);e.append("line").attr("x1",0).attr("y1",0).attr("x2",r*a.axisScaleFactor*s).attr("y2",r*a.axisScaleFactor*l).attr("class","radarAxisLine");let p=s>.01?"start":s<-.01?"end":"middle",d=l>.01?"hanging":l<-.01?"auto":"central",u=4;e.append("text").text(m).attr("x",r*a.axisLabelFactor*s+u*s).attr("y",r*a.axisLabelFactor*l+u*l).attr("text-anchor",p).attr("dominant-baseline",d).attr("class","radarAxisLabel")}},"drawAxes");function ot(e,t,r,a,o,c,m){let i=t.length,s=Math.min(m.width,m.height)/2;r.forEach((l,p)=>{if(l.entries.length!==i)return;let d=l.entries.map((u,h)=>{let y=2*Math.PI*h/i-Math.PI/2,b=nt(u,a,o,s),z=b*Math.cos(y),q=b*Math.sin(y);return{x:z,y:q}});c==="circle"?e.append("path").attr("d",it(d,m.curveTension)).attr("class",`radarCurve-${p}`):c==="polygon"&&e.append("polygon").attr("points",d.map(u=>`${u.x},${u.y}`).join(" ")).attr("class",`radarCurve-${p}`)})}n(ot,"drawCurves");function nt(e,t,r,a){let o=Math.min(Math.max(e,t),r);return a*(o-t)/(r-t)}n(nt,"relativeRadius");function it(e,t){let r=e.length,a=`M${e[0].x},${e[0].y}`;for(let o=0;o<r;o++){let c=e[(o-1+r)%r],m=e[o],i=e[(o+1)%r],s=e[(o+2)%r],l={x:m.x+(i.x-c.x)*t,y:m.y+(i.y-c.y)*t},p={x:i.x-(s.x-m.x)*t,y:i.y-(s.y-m.y)*t};a+=` C${l.x},${l.y} ${p.x},${p.y} ${i.x},${i.y}`}return`${a} Z`}n(it,"closedRoundCurve");function st(e,t,r,a){if(!r)return;let o=(a.width/2+a.marginRight)*3/4,c=-(a.height/2+a.marginTop)*3/4,m=20;t.forEach((i,s)=>{let l=e.append("g").attr("transform",`translate(${o}, ${c+s*m})`);l.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${s}`),l.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(i.label)})}n(st,"drawLegend");var B={draw:tt};var ct=n((e,t)=>{let r="";for(let a=0;a<e.THEME_COLOR_LIMIT;a++){let o=e[`cScale${a}`];r+=`
		.radarCurve-${a} {
			color: ${o};
			fill: ${o};
			fill-opacity: ${t.curveOpacity};
			stroke: ${o};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${a} {
			fill: ${o};
			fill-opacity: ${t.curveOpacity};
			stroke: ${o};
		}
		`}return r},"genIndexStyles"),mt=n(e=>{let t=v(),r=C(),a=R(t,r.themeVariables),o=R(a.radar,e);return{themeVariables:a,radarOptions:o}},"buildRadarStyleOptions"),_=n(({radar:e}={})=>{let{themeVariables:t,radarOptions:r}=mt(e);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${r.axisColor};
		stroke-width: ${r.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${r.axisLabelFontSize}px;
		color: ${r.axisColor};
	}
	.radarGraticule {
		fill: ${r.graticuleColor};
		fill-opacity: ${r.graticuleOpacity};
		stroke: ${r.graticuleColor};
		stroke-width: ${r.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${r.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${ct(t,r)}
	`},"styles");var Vt={parser:F,db:x,renderer:B,styles:_};export{Vt as diagram};
