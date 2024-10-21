import { aK as I, aL as qe, aM as O, ah as y, ag as Te, aN as Xe, aO as Qe, aP as We, aQ as Ee, aR as G, ae as X, aS as Je, aT as Oe, aU as ze, aV as C, aW as R, an as $e, a8 as me, aX as Ve, aY as Z, aZ as ke, a_ as en, a$ as L, am as nn, b0 as rn, af as tn, b1 as re, b2 as sn, b3 as an, al as un, ak as we, ai as fn, b4 as B, ac as on, b5 as dn, ao as M, z as te, b6 as ie } from "./mermaid-1fcb8b31.js";
var hn = "[object Symbol]";
function Q(e) {
  return typeof e == "symbol" || I(e) && qe(e) == hn;
}
function ve(e, n) {
  for (var r = -1, t = e == null ? 0 : e.length, i = Array(t); ++r < t; )
    i[r] = n(e[r], r, e);
  return i;
}
var ln = 1 / 0, se = O ? O.prototype : void 0, ae = se ? se.toString : void 0;
function Pe(e) {
  if (typeof e == "string")
    return e;
  if (y(e))
    return ve(e, Pe) + "";
  if (Q(e))
    return ae ? ae.call(e) : "";
  var n = e + "";
  return n == "0" && 1 / e == -ln ? "-0" : n;
}
function gn() {
}
function Le(e, n) {
  for (var r = -1, t = e == null ? 0 : e.length; ++r < t && n(e[r], r, e) !== !1; )
    ;
  return e;
}
function cn(e, n, r, t) {
  for (var i = e.length, s = r + (t ? 1 : -1); t ? s-- : ++s < i; )
    if (n(e[s], s, e))
      return s;
  return -1;
}
function _n(e) {
  return e !== e;
}
function pn(e, n, r) {
  for (var t = r - 1, i = e.length; ++t < i; )
    if (e[t] === n)
      return t;
  return -1;
}
function bn(e, n, r) {
  return n === n ? pn(e, n, r) : cn(e, _n, r);
}
function yn(e, n) {
  var r = e == null ? 0 : e.length;
  return !!r && bn(e, n, 0) > -1;
}
function T(e) {
  return Te(e) ? Xe(e) : Qe(e);
}
var An = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Tn = /^\w*$/;
function W(e, n) {
  if (y(e))
    return !1;
  var r = typeof e;
  return r == "number" || r == "symbol" || r == "boolean" || e == null || Q(e) ? !0 : Tn.test(e) || !An.test(e) || n != null && e in Object(n);
}
var En = 500;
function On(e) {
  var n = We(e, function(t) {
    return r.size === En && r.clear(), t;
  }), r = n.cache;
  return n;
}
var $n = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, mn = /\\(\\)?/g, wn = On(function(e) {
  var n = [];
  return e.charCodeAt(0) === 46 && n.push(""), e.replace($n, function(r, t, i, s) {
    n.push(i ? s.replace(mn, "$1") : t || r);
  }), n;
});
const vn = wn;
function Pn(e) {
  return e == null ? "" : Pe(e);
}
function Ie(e, n) {
  return y(e) ? e : W(e, n) ? [e] : vn(Pn(e));
}
var Ln = 1 / 0;
function U(e) {
  if (typeof e == "string" || Q(e))
    return e;
  var n = e + "";
  return n == "0" && 1 / e == -Ln ? "-0" : n;
}
function Ce(e, n) {
  n = Ie(n, e);
  for (var r = 0, t = n.length; e != null && r < t; )
    e = e[U(n[r++])];
  return r && r == t ? e : void 0;
}
function In(e, n, r) {
  var t = e == null ? void 0 : Ce(e, n);
  return t === void 0 ? r : t;
}
function J(e, n) {
  for (var r = -1, t = n.length, i = e.length; ++r < t; )
    e[i + r] = n[r];
  return e;
}
var ue = O ? O.isConcatSpreadable : void 0;
function Cn(e) {
  return y(e) || Ee(e) || !!(ue && e && e[ue]);
}
function Se(e, n, r, t, i) {
  var s = -1, a = e.length;
  for (r || (r = Cn), i || (i = []); ++s < a; ) {
    var u = e[s];
    n > 0 && r(u) ? n > 1 ? Se(u, n - 1, r, t, i) : J(i, u) : t || (i[i.length] = u);
  }
  return i;
}
function Sn(e, n, r, t) {
  var i = -1, s = e == null ? 0 : e.length;
  for (t && s && (r = e[++i]); ++i < s; )
    r = n(r, e[i], i, e);
  return r;
}
function Nn(e, n) {
  return e && G(n, T(n), e);
}
function Fn(e, n) {
  return e && G(n, X(n), e);
}
function Ne(e, n) {
  for (var r = -1, t = e == null ? 0 : e.length, i = 0, s = []; ++r < t; ) {
    var a = e[r];
    n(a, r, e) && (s[i++] = a);
  }
  return s;
}
function Fe() {
  return [];
}
var Mn = Object.prototype, xn = Mn.propertyIsEnumerable, fe = Object.getOwnPropertySymbols, Dn = fe ? function(e) {
  return e == null ? [] : (e = Object(e), Ne(fe(e), function(n) {
    return xn.call(e, n);
  }));
} : Fe;
const z = Dn;
function Rn(e, n) {
  return G(e, z(e), n);
}
var Gn = Object.getOwnPropertySymbols, Un = Gn ? function(e) {
  for (var n = []; e; )
    J(n, z(e)), e = Je(e);
  return n;
} : Fe;
const Me = Un;
function Bn(e, n) {
  return G(e, Me(e), n);
}
function xe(e, n, r) {
  var t = n(e);
  return y(e) ? t : J(t, r(e));
}
function q(e) {
  return xe(e, T, z);
}
function jn(e) {
  return xe(e, X, Me);
}
var Kn = Object.prototype, Hn = Kn.hasOwnProperty;
function Yn(e) {
  var n = e.length, r = new e.constructor(n);
  return n && typeof e[0] == "string" && Hn.call(e, "index") && (r.index = e.index, r.input = e.input), r;
}
function Zn(e, n) {
  var r = n ? Oe(e.buffer) : e.buffer;
  return new e.constructor(r, e.byteOffset, e.byteLength);
}
var qn = /\w*$/;
function Xn(e) {
  var n = new e.constructor(e.source, qn.exec(e));
  return n.lastIndex = e.lastIndex, n;
}
var oe = O ? O.prototype : void 0, de = oe ? oe.valueOf : void 0;
function Qn(e) {
  return de ? Object(de.call(e)) : {};
}
var Wn = "[object Boolean]", Jn = "[object Date]", zn = "[object Map]", Vn = "[object Number]", kn = "[object RegExp]", er = "[object Set]", nr = "[object String]", rr = "[object Symbol]", tr = "[object ArrayBuffer]", ir = "[object DataView]", sr = "[object Float32Array]", ar = "[object Float64Array]", ur = "[object Int8Array]", fr = "[object Int16Array]", or = "[object Int32Array]", dr = "[object Uint8Array]", hr = "[object Uint8ClampedArray]", lr = "[object Uint16Array]", gr = "[object Uint32Array]";
function cr(e, n, r) {
  var t = e.constructor;
  switch (n) {
    case tr:
      return Oe(e);
    case Wn:
    case Jn:
      return new t(+e);
    case ir:
      return Zn(e, r);
    case sr:
    case ar:
    case ur:
    case fr:
    case or:
    case dr:
    case hr:
    case lr:
    case gr:
      return ze(e, r);
    case zn:
      return new t();
    case Vn:
    case nr:
      return new t(e);
    case kn:
      return Xn(e);
    case er:
      return new t();
    case rr:
      return Qn(e);
  }
}
var _r = "[object Map]";
function pr(e) {
  return I(e) && C(e) == _r;
}
var he = R && R.isMap, br = he ? $e(he) : pr;
const yr = br;
var Ar = "[object Set]";
function Tr(e) {
  return I(e) && C(e) == Ar;
}
var le = R && R.isSet, Er = le ? $e(le) : Tr;
const Or = Er;
var $r = 1, mr = 2, wr = 4, De = "[object Arguments]", vr = "[object Array]", Pr = "[object Boolean]", Lr = "[object Date]", Ir = "[object Error]", Re = "[object Function]", Cr = "[object GeneratorFunction]", Sr = "[object Map]", Nr = "[object Number]", Ge = "[object Object]", Fr = "[object RegExp]", Mr = "[object Set]", xr = "[object String]", Dr = "[object Symbol]", Rr = "[object WeakMap]", Gr = "[object ArrayBuffer]", Ur = "[object DataView]", Br = "[object Float32Array]", jr = "[object Float64Array]", Kr = "[object Int8Array]", Hr = "[object Int16Array]", Yr = "[object Int32Array]", Zr = "[object Uint8Array]", qr = "[object Uint8ClampedArray]", Xr = "[object Uint16Array]", Qr = "[object Uint32Array]", h = {};
h[De] = h[vr] = h[Gr] = h[Ur] = h[Pr] = h[Lr] = h[Br] = h[jr] = h[Kr] = h[Hr] = h[Yr] = h[Sr] = h[Nr] = h[Ge] = h[Fr] = h[Mr] = h[xr] = h[Dr] = h[Zr] = h[qr] = h[Xr] = h[Qr] = !0;
h[Ir] = h[Re] = h[Rr] = !1;
function j(e, n, r, t, i, s) {
  var a, u = n & $r, f = n & mr, g = n & wr;
  if (r && (a = i ? r(e, t, i, s) : r(e)), a !== void 0)
    return a;
  if (!me(e))
    return e;
  var l = y(e);
  if (l) {
    if (a = Yn(e), !u)
      return Ve(e, a);
  } else {
    var o = C(e), d = o == Re || o == Cr;
    if (Z(e))
      return ke(e, u);
    if (o == Ge || o == De || d && !i) {
      if (a = f || d ? {} : en(e), !u)
        return f ? Bn(e, Fn(a, e)) : Rn(e, Nn(a, e));
    } else {
      if (!h[o])
        return i ? e : {};
      a = cr(e, o, u);
    }
  }
  s || (s = new L());
  var A = s.get(e);
  if (A)
    return A;
  s.set(e, a), Or(e) ? e.forEach(function(c) {
    a.add(j(c, n, r, c, e, s));
  }) : yr(e) && e.forEach(function(c, _) {
    a.set(_, j(c, n, r, _, e, s));
  });
  var p = g ? f ? jn : q : f ? X : T, b = l ? void 0 : p(e);
  return Le(b || e, function(c, _) {
    b && (_ = c, c = e[_]), nn(a, _, j(c, n, r, _, e, s));
  }), a;
}
var Wr = "__lodash_hash_undefined__";
function Jr(e) {
  return this.__data__.set(e, Wr), this;
}
function zr(e) {
  return this.__data__.has(e);
}
function S(e) {
  var n = -1, r = e == null ? 0 : e.length;
  for (this.__data__ = new rn(); ++n < r; )
    this.add(e[n]);
}
S.prototype.add = S.prototype.push = Jr;
S.prototype.has = zr;
function Vr(e, n) {
  for (var r = -1, t = e == null ? 0 : e.length; ++r < t; )
    if (n(e[r], r, e))
      return !0;
  return !1;
}
function Ue(e, n) {
  return e.has(n);
}
var kr = 1, et = 2;
function Be(e, n, r, t, i, s) {
  var a = r & kr, u = e.length, f = n.length;
  if (u != f && !(a && f > u))
    return !1;
  var g = s.get(e), l = s.get(n);
  if (g && l)
    return g == n && l == e;
  var o = -1, d = !0, A = r & et ? new S() : void 0;
  for (s.set(e, n), s.set(n, e); ++o < u; ) {
    var p = e[o], b = n[o];
    if (t)
      var c = a ? t(b, p, o, n, e, s) : t(p, b, o, e, n, s);
    if (c !== void 0) {
      if (c)
        continue;
      d = !1;
      break;
    }
    if (A) {
      if (!Vr(n, function(_, $) {
        if (!Ue(A, $) && (p === _ || i(p, _, r, t, s)))
          return A.push($);
      })) {
        d = !1;
        break;
      }
    } else if (!(p === b || i(p, b, r, t, s))) {
      d = !1;
      break;
    }
  }
  return s.delete(e), s.delete(n), d;
}
function nt(e) {
  var n = -1, r = Array(e.size);
  return e.forEach(function(t, i) {
    r[++n] = [i, t];
  }), r;
}
function V(e) {
  var n = -1, r = Array(e.size);
  return e.forEach(function(t) {
    r[++n] = t;
  }), r;
}
var rt = 1, tt = 2, it = "[object Boolean]", st = "[object Date]", at = "[object Error]", ut = "[object Map]", ft = "[object Number]", ot = "[object RegExp]", dt = "[object Set]", ht = "[object String]", lt = "[object Symbol]", gt = "[object ArrayBuffer]", ct = "[object DataView]", ge = O ? O.prototype : void 0, K = ge ? ge.valueOf : void 0;
function _t(e, n, r, t, i, s, a) {
  switch (r) {
    case ct:
      if (e.byteLength != n.byteLength || e.byteOffset != n.byteOffset)
        return !1;
      e = e.buffer, n = n.buffer;
    case gt:
      return !(e.byteLength != n.byteLength || !s(new re(e), new re(n)));
    case it:
    case st:
    case ft:
      return tn(+e, +n);
    case at:
      return e.name == n.name && e.message == n.message;
    case ot:
    case ht:
      return e == n + "";
    case ut:
      var u = nt;
    case dt:
      var f = t & rt;
      if (u || (u = V), e.size != n.size && !f)
        return !1;
      var g = a.get(e);
      if (g)
        return g == n;
      t |= tt, a.set(e, n);
      var l = Be(u(e), u(n), t, i, s, a);
      return a.delete(e), l;
    case lt:
      if (K)
        return K.call(e) == K.call(n);
  }
  return !1;
}
var pt = 1, bt = Object.prototype, yt = bt.hasOwnProperty;
function At(e, n, r, t, i, s) {
  var a = r & pt, u = q(e), f = u.length, g = q(n), l = g.length;
  if (f != l && !a)
    return !1;
  for (var o = f; o--; ) {
    var d = u[o];
    if (!(a ? d in n : yt.call(n, d)))
      return !1;
  }
  var A = s.get(e), p = s.get(n);
  if (A && p)
    return A == n && p == e;
  var b = !0;
  s.set(e, n), s.set(n, e);
  for (var c = a; ++o < f; ) {
    d = u[o];
    var _ = e[d], $ = n[d];
    if (t)
      var ne = a ? t($, _, d, n, e, s) : t(_, $, d, e, n, s);
    if (!(ne === void 0 ? _ === $ || i(_, $, r, t, s) : ne)) {
      b = !1;
      break;
    }
    c || (c = d == "constructor");
  }
  if (b && !c) {
    var N = e.constructor, F = n.constructor;
    N != F && "constructor" in e && "constructor" in n && !(typeof N == "function" && N instanceof N && typeof F == "function" && F instanceof F) && (b = !1);
  }
  return s.delete(e), s.delete(n), b;
}
var Tt = 1, ce = "[object Arguments]", _e = "[object Array]", x = "[object Object]", Et = Object.prototype, pe = Et.hasOwnProperty;
function Ot(e, n, r, t, i, s) {
  var a = y(e), u = y(n), f = a ? _e : C(e), g = u ? _e : C(n);
  f = f == ce ? x : f, g = g == ce ? x : g;
  var l = f == x, o = g == x, d = f == g;
  if (d && Z(e)) {
    if (!Z(n))
      return !1;
    a = !0, l = !1;
  }
  if (d && !l)
    return s || (s = new L()), a || sn(e) ? Be(e, n, r, t, i, s) : _t(e, n, f, r, t, i, s);
  if (!(r & Tt)) {
    var A = l && pe.call(e, "__wrapped__"), p = o && pe.call(n, "__wrapped__");
    if (A || p) {
      var b = A ? e.value() : e, c = p ? n.value() : n;
      return s || (s = new L()), i(b, c, r, t, s);
    }
  }
  return d ? (s || (s = new L()), At(e, n, r, t, i, s)) : !1;
}
function k(e, n, r, t, i) {
  return e === n ? !0 : e == null || n == null || !I(e) && !I(n) ? e !== e && n !== n : Ot(e, n, r, t, k, i);
}
var $t = 1, mt = 2;
function wt(e, n, r, t) {
  var i = r.length, s = i, a = !t;
  if (e == null)
    return !s;
  for (e = Object(e); i--; ) {
    var u = r[i];
    if (a && u[2] ? u[1] !== e[u[0]] : !(u[0] in e))
      return !1;
  }
  for (; ++i < s; ) {
    u = r[i];
    var f = u[0], g = e[f], l = u[1];
    if (a && u[2]) {
      if (g === void 0 && !(f in e))
        return !1;
    } else {
      var o = new L();
      if (t)
        var d = t(g, l, f, e, n, o);
      if (!(d === void 0 ? k(l, g, $t | mt, t, o) : d))
        return !1;
    }
  }
  return !0;
}
function je(e) {
  return e === e && !me(e);
}
function vt(e) {
  for (var n = T(e), r = n.length; r--; ) {
    var t = n[r], i = e[t];
    n[r] = [t, i, je(i)];
  }
  return n;
}
function Ke(e, n) {
  return function(r) {
    return r == null ? !1 : r[e] === n && (n !== void 0 || e in Object(r));
  };
}
function Pt(e) {
  var n = vt(e);
  return n.length == 1 && n[0][2] ? Ke(n[0][0], n[0][1]) : function(r) {
    return r === e || wt(r, e, n);
  };
}
function Lt(e, n) {
  return e != null && n in Object(e);
}
function He(e, n, r) {
  n = Ie(n, e);
  for (var t = -1, i = n.length, s = !1; ++t < i; ) {
    var a = U(n[t]);
    if (!(s = e != null && r(e, a)))
      break;
    e = e[a];
  }
  return s || ++t != i ? s : (i = e == null ? 0 : e.length, !!i && an(i) && un(a, i) && (y(e) || Ee(e)));
}
function It(e, n) {
  return e != null && He(e, n, Lt);
}
var Ct = 1, St = 2;
function Nt(e, n) {
  return W(e) && je(n) ? Ke(U(e), n) : function(r) {
    var t = In(r, e);
    return t === void 0 && t === n ? It(r, e) : k(n, t, Ct | St);
  };
}
function Ft(e) {
  return function(n) {
    return n == null ? void 0 : n[e];
  };
}
function Mt(e) {
  return function(n) {
    return Ce(n, e);
  };
}
function xt(e) {
  return W(e) ? Ft(U(e)) : Mt(e);
}
function Ye(e) {
  return typeof e == "function" ? e : e == null ? we : typeof e == "object" ? y(e) ? Nt(e[0], e[1]) : Pt(e) : xt(e);
}
function Dt(e, n) {
  return e && fn(e, n, T);
}
function Rt(e, n) {
  return function(r, t) {
    if (r == null)
      return r;
    if (!Te(r))
      return e(r, t);
    for (var i = r.length, s = n ? i : -1, a = Object(r); (n ? s-- : ++s < i) && t(a[s], s, a) !== !1; )
      ;
    return r;
  };
}
var Gt = Rt(Dt);
const ee = Gt;
function Ut(e, n, r) {
  for (var t = -1, i = e == null ? 0 : e.length; ++t < i; )
    if (r(n, e[t]))
      return !0;
  return !1;
}
function Bt(e) {
  return typeof e == "function" ? e : we;
}
function m(e, n) {
  var r = y(e) ? Le : ee;
  return r(e, Bt(n));
}
function jt(e, n) {
  var r = [];
  return ee(e, function(t, i, s) {
    n(t, i, s) && r.push(t);
  }), r;
}
function D(e, n) {
  var r = y(e) ? Ne : jt;
  return r(e, Ye(n));
}
var Kt = Object.prototype, Ht = Kt.hasOwnProperty;
function Yt(e, n) {
  return e != null && Ht.call(e, n);
}
function E(e, n) {
  return e != null && He(e, n, Yt);
}
function Zt(e, n) {
  return ve(n, function(r) {
    return e[r];
  });
}
function H(e) {
  return e == null ? [] : Zt(e, T(e));
}
function v(e) {
  return e === void 0;
}
function qt(e, n, r, t, i) {
  return i(e, function(s, a, u) {
    r = t ? (t = !1, s) : n(r, s, a, u);
  }), r;
}
function Xt(e, n, r) {
  var t = y(e) ? Sn : qt, i = arguments.length < 3;
  return t(e, Ye(n), r, i, ee);
}
var Qt = 1 / 0, Wt = B && 1 / V(new B([, -0]))[1] == Qt ? function(e) {
  return new B(e);
} : gn;
const Jt = Wt;
var zt = 200;
function Vt(e, n, r) {
  var t = -1, i = yn, s = e.length, a = !0, u = [], f = u;
  if (r)
    a = !1, i = Ut;
  else if (s >= zt) {
    var g = n ? null : Jt(e);
    if (g)
      return V(g);
    a = !1, i = Ue, f = new S();
  } else
    f = n ? [] : u;
  e:
    for (; ++t < s; ) {
      var l = e[t], o = n ? n(l) : l;
      if (l = r || l !== 0 ? l : 0, a && o === o) {
        for (var d = f.length; d--; )
          if (f[d] === o)
            continue e;
        n && f.push(o), u.push(l);
      } else
        i(f, o, r) || (f !== u && f.push(o), u.push(l));
    }
  return u;
}
var kt = on(function(e) {
  return Vt(Se(e, 1, dn, !0));
});
const ei = kt;
var ni = "\0", w = "\0", be = "";
class Ze {
  constructor(n = {}) {
    this._isDirected = E(n, "directed") ? n.directed : !0, this._isMultigraph = E(n, "multigraph") ? n.multigraph : !1, this._isCompound = E(n, "compound") ? n.compound : !1, this._label = void 0, this._defaultNodeLabelFn = M(void 0), this._defaultEdgeLabelFn = M(void 0), this._nodes = {}, this._isCompound && (this._parent = {}, this._children = {}, this._children[w] = {}), this._in = {}, this._preds = {}, this._out = {}, this._sucs = {}, this._edgeObjs = {}, this._edgeLabels = {};
  }
  /* === Graph functions ========= */
  isDirected() {
    return this._isDirected;
  }
  isMultigraph() {
    return this._isMultigraph;
  }
  isCompound() {
    return this._isCompound;
  }
  setGraph(n) {
    return this._label = n, this;
  }
  graph() {
    return this._label;
  }
  /* === Node functions ========== */
  setDefaultNodeLabel(n) {
    return te(n) || (n = M(n)), this._defaultNodeLabelFn = n, this;
  }
  nodeCount() {
    return this._nodeCount;
  }
  nodes() {
    return T(this._nodes);
  }
  sources() {
    var n = this;
    return D(this.nodes(), function(r) {
      return ie(n._in[r]);
    });
  }
  sinks() {
    var n = this;
    return D(this.nodes(), function(r) {
      return ie(n._out[r]);
    });
  }
  setNodes(n, r) {
    var t = arguments, i = this;
    return m(n, function(s) {
      t.length > 1 ? i.setNode(s, r) : i.setNode(s);
    }), this;
  }
  setNode(n, r) {
    return E(this._nodes, n) ? (arguments.length > 1 && (this._nodes[n] = r), this) : (this._nodes[n] = arguments.length > 1 ? r : this._defaultNodeLabelFn(n), this._isCompound && (this._parent[n] = w, this._children[n] = {}, this._children[w][n] = !0), this._in[n] = {}, this._preds[n] = {}, this._out[n] = {}, this._sucs[n] = {}, ++this._nodeCount, this);
  }
  node(n) {
    return this._nodes[n];
  }
  hasNode(n) {
    return E(this._nodes, n);
  }
  removeNode(n) {
    var r = this;
    if (E(this._nodes, n)) {
      var t = function(i) {
        r.removeEdge(r._edgeObjs[i]);
      };
      delete this._nodes[n], this._isCompound && (this._removeFromParentsChildList(n), delete this._parent[n], m(this.children(n), function(i) {
        r.setParent(i);
      }), delete this._children[n]), m(T(this._in[n]), t), delete this._in[n], delete this._preds[n], m(T(this._out[n]), t), delete this._out[n], delete this._sucs[n], --this._nodeCount;
    }
    return this;
  }
  setParent(n, r) {
    if (!this._isCompound)
      throw new Error("Cannot set parent in a non-compound graph");
    if (v(r))
      r = w;
    else {
      r += "";
      for (var t = r; !v(t); t = this.parent(t))
        if (t === n)
          throw new Error("Setting " + r + " as parent of " + n + " would create a cycle");
      this.setNode(r);
    }
    return this.setNode(n), this._removeFromParentsChildList(n), this._parent[n] = r, this._children[r][n] = !0, this;
  }
  _removeFromParentsChildList(n) {
    delete this._children[this._parent[n]][n];
  }
  parent(n) {
    if (this._isCompound) {
      var r = this._parent[n];
      if (r !== w)
        return r;
    }
  }
  children(n) {
    if (v(n) && (n = w), this._isCompound) {
      var r = this._children[n];
      if (r)
        return T(r);
    } else {
      if (n === w)
        return this.nodes();
      if (this.hasNode(n))
        return [];
    }
  }
  predecessors(n) {
    var r = this._preds[n];
    if (r)
      return T(r);
  }
  successors(n) {
    var r = this._sucs[n];
    if (r)
      return T(r);
  }
  neighbors(n) {
    var r = this.predecessors(n);
    if (r)
      return ei(r, this.successors(n));
  }
  isLeaf(n) {
    var r;
    return this.isDirected() ? r = this.successors(n) : r = this.neighbors(n), r.length === 0;
  }
  filterNodes(n) {
    var r = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });
    r.setGraph(this.graph());
    var t = this;
    m(this._nodes, function(a, u) {
      n(u) && r.setNode(u, a);
    }), m(this._edgeObjs, function(a) {
      r.hasNode(a.v) && r.hasNode(a.w) && r.setEdge(a, t.edge(a));
    });
    var i = {};
    function s(a) {
      var u = t.parent(a);
      return u === void 0 || r.hasNode(u) ? (i[a] = u, u) : u in i ? i[u] : s(u);
    }
    return this._isCompound && m(r.nodes(), function(a) {
      r.setParent(a, s(a));
    }), r;
  }
  /* === Edge functions ========== */
  setDefaultEdgeLabel(n) {
    return te(n) || (n = M(n)), this._defaultEdgeLabelFn = n, this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return H(this._edgeObjs);
  }
  setPath(n, r) {
    var t = this, i = arguments;
    return Xt(n, function(s, a) {
      return i.length > 1 ? t.setEdge(s, a, r) : t.setEdge(s, a), a;
    }), this;
  }
  /*
   * setEdge(v, w, [value, [name]])
   * setEdge({ v, w, [name] }, [value])
   */
  setEdge() {
    var n, r, t, i, s = !1, a = arguments[0];
    typeof a == "object" && a !== null && "v" in a ? (n = a.v, r = a.w, t = a.name, arguments.length === 2 && (i = arguments[1], s = !0)) : (n = a, r = arguments[1], t = arguments[3], arguments.length > 2 && (i = arguments[2], s = !0)), n = "" + n, r = "" + r, v(t) || (t = "" + t);
    var u = P(this._isDirected, n, r, t);
    if (E(this._edgeLabels, u))
      return s && (this._edgeLabels[u] = i), this;
    if (!v(t) && !this._isMultigraph)
      throw new Error("Cannot set a named edge when isMultigraph = false");
    this.setNode(n), this.setNode(r), this._edgeLabels[u] = s ? i : this._defaultEdgeLabelFn(n, r, t);
    var f = ri(this._isDirected, n, r, t);
    return n = f.v, r = f.w, Object.freeze(f), this._edgeObjs[u] = f, ye(this._preds[r], n), ye(this._sucs[n], r), this._in[r][u] = f, this._out[n][u] = f, this._edgeCount++, this;
  }
  edge(n, r, t) {
    var i = arguments.length === 1 ? Y(this._isDirected, arguments[0]) : P(this._isDirected, n, r, t);
    return this._edgeLabels[i];
  }
  hasEdge(n, r, t) {
    var i = arguments.length === 1 ? Y(this._isDirected, arguments[0]) : P(this._isDirected, n, r, t);
    return E(this._edgeLabels, i);
  }
  removeEdge(n, r, t) {
    var i = arguments.length === 1 ? Y(this._isDirected, arguments[0]) : P(this._isDirected, n, r, t), s = this._edgeObjs[i];
    return s && (n = s.v, r = s.w, delete this._edgeLabels[i], delete this._edgeObjs[i], Ae(this._preds[r], n), Ae(this._sucs[n], r), delete this._in[r][i], delete this._out[n][i], this._edgeCount--), this;
  }
  inEdges(n, r) {
    var t = this._in[n];
    if (t) {
      var i = H(t);
      return r ? D(i, function(s) {
        return s.v === r;
      }) : i;
    }
  }
  outEdges(n, r) {
    var t = this._out[n];
    if (t) {
      var i = H(t);
      return r ? D(i, function(s) {
        return s.w === r;
      }) : i;
    }
  }
  nodeEdges(n, r) {
    var t = this.inEdges(n, r);
    if (t)
      return t.concat(this.outEdges(n, r));
  }
}
Ze.prototype._nodeCount = 0;
Ze.prototype._edgeCount = 0;
function ye(e, n) {
  e[n] ? e[n]++ : e[n] = 1;
}
function Ae(e, n) {
  --e[n] || delete e[n];
}
function P(e, n, r, t) {
  var i = "" + n, s = "" + r;
  if (!e && i > s) {
    var a = i;
    i = s, s = a;
  }
  return i + be + s + be + (v(t) ? ni : t);
}
function ri(e, n, r, t) {
  var i = "" + n, s = "" + r;
  if (!e && i > s) {
    var a = i;
    i = s, s = a;
  }
  var u = { v: i, w: s };
  return t && (u.name = t), u;
}
function Y(e, n) {
  return P(e, n.v, n.w, n.name);
}
export {
  Ze as G,
  Q as a,
  Se as b,
  j as c,
  Ye as d,
  cn as e,
  m as f,
  ee as g,
  E as h,
  v as i,
  ve as j,
  T as k,
  Bt as l,
  Dt as m,
  Ie as n,
  Ce as o,
  It as p,
  Pn as q,
  D as r,
  Xt as s,
  U as t,
  H as v
};
