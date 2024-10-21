import { a as F, b as xn, c as zn, d as L, k as Un, e as Hn, g as jn, j as P, l as En, m as kn, n as yn, t as Jn, o as Nn, p as Kn, q as Zn, f as s, G as x, h as w, i as g, r as M, v as y, s as V } from "./graph-71d8872f.js";
import { a8 as A, a9 as Qn, aa as ne, ab as ee, ac as Ln, ad as B, ae as _n, af as re, ag as Cn, ah as J, ai as te, aj as ie, ak as K, al as ae, am as In, an as oe, ao as ue, ap as H } from "./mermaid-1fcb8b31.js";
var de = /\s/;
function fe(n) {
  for (var e = n.length; e-- && de.test(n.charAt(e)); )
    ;
  return e;
}
var se = /^\s+/;
function ce(n) {
  return n && n.slice(0, fe(n) + 1).replace(se, "");
}
var un = 0 / 0, he = /^[-+]0x[0-9a-f]+$/i, le = /^0b[01]+$/i, ve = /^0o[0-7]+$/i, pe = parseInt;
function we(n) {
  if (typeof n == "number")
    return n;
  if (F(n))
    return un;
  if (A(n)) {
    var e = typeof n.valueOf == "function" ? n.valueOf() : n;
    n = A(e) ? e + "" : e;
  }
  if (typeof n != "string")
    return n === 0 ? n : +n;
  n = ce(n);
  var r = le.test(n);
  return r || ve.test(n) ? pe(n.slice(2), r ? 2 : 8) : he.test(n) ? un : +n;
}
var dn = 1 / 0, me = 17976931348623157e292;
function S(n) {
  if (!n)
    return n === 0 ? n : 0;
  if (n = we(n), n === dn || n === -dn) {
    var e = n < 0 ? -1 : 1;
    return e * me;
  }
  return n === n ? n : 0;
}
function be(n) {
  var e = S(n), r = e % 1;
  return e === e ? r ? e - r : e : 0;
}
function _(n) {
  var e = n == null ? 0 : n.length;
  return e ? xn(n, 1) : [];
}
function ge(n) {
  return Qn(ne(n, void 0, _), n + "");
}
var xe = 1, Ee = 4;
function ke(n) {
  return zn(n, xe | Ee);
}
var ye = function() {
  return ee.Date.now();
};
const fn = ye;
var Rn = Object.prototype, Ne = Rn.hasOwnProperty, Le = Ln(function(n, e) {
  n = Object(n);
  var r = -1, t = e.length, i = t > 2 ? e[2] : void 0;
  for (i && B(e[0], e[1], i) && (t = 1); ++r < t; )
    for (var o = e[r], a = _n(o), u = -1, d = a.length; ++u < d; ) {
      var f = a[u], c = n[f];
      (c === void 0 || re(c, Rn[f]) && !Ne.call(n, f)) && (n[f] = o[f]);
    }
  return n;
});
const _e = Le;
function $(n) {
  var e = n == null ? 0 : n.length;
  return e ? n[e - 1] : void 0;
}
function Ce(n) {
  return function(e, r, t) {
    var i = Object(e);
    if (!Cn(e)) {
      var o = L(r);
      e = Un(e), r = function(u) {
        return o(i[u], u, i);
      };
    }
    var a = n(e, r, t);
    return a > -1 ? i[o ? e[a] : a] : void 0;
  };
}
var Ie = Math.max;
function Re(n, e, r) {
  var t = n == null ? 0 : n.length;
  if (!t)
    return -1;
  var i = r == null ? 0 : be(r);
  return i < 0 && (i = Ie(t + i, 0)), Hn(n, L(e), i);
}
var Te = Ce(Re);
const Z = Te;
function Tn(n, e) {
  var r = -1, t = Cn(n) ? Array(n.length) : [];
  return jn(n, function(i, o, a) {
    t[++r] = e(i, o, a);
  }), t;
}
function m(n, e) {
  var r = J(n) ? P : Tn;
  return r(n, L(e));
}
function Me(n, e) {
  return n == null ? n : te(n, En(e), _n);
}
function Oe(n, e) {
  return n && kn(n, En(e));
}
function Pe(n, e) {
  return n > e;
}
function Mn(n, e) {
  return n < e;
}
function Y(n, e) {
  var r = {};
  return e = L(e), kn(n, function(t, i, o) {
    ie(r, i, e(t, i, o));
  }), r;
}
function Q(n, e, r) {
  for (var t = -1, i = n.length; ++t < i; ) {
    var o = n[t], a = e(o);
    if (a != null && (u === void 0 ? a === a && !F(a) : r(a, u)))
      var u = a, d = o;
  }
  return d;
}
function E(n) {
  return n && n.length ? Q(n, K, Pe) : void 0;
}
function R(n) {
  return n && n.length ? Q(n, K, Mn) : void 0;
}
function nn(n, e) {
  return n && n.length ? Q(n, L(e), Mn) : void 0;
}
function Se(n, e, r, t) {
  if (!A(n))
    return n;
  e = yn(e, n);
  for (var i = -1, o = e.length, a = o - 1, u = n; u != null && ++i < o; ) {
    var d = Jn(e[i]), f = r;
    if (d === "__proto__" || d === "constructor" || d === "prototype")
      return n;
    if (i != a) {
      var c = u[d];
      f = t ? t(c, d, u) : void 0, f === void 0 && (f = A(c) ? c : ae(e[i + 1]) ? [] : {});
    }
    In(u, d, f), u = u[d];
  }
  return n;
}
function Fe(n, e, r) {
  for (var t = -1, i = e.length, o = {}; ++t < i; ) {
    var a = e[t], u = Nn(n, a);
    r(u, a) && Se(o, yn(a, n), u);
  }
  return o;
}
function Ae(n, e) {
  var r = n.length;
  for (n.sort(e); r--; )
    n[r] = n[r].value;
  return n;
}
function Be(n, e) {
  if (n !== e) {
    var r = n !== void 0, t = n === null, i = n === n, o = F(n), a = e !== void 0, u = e === null, d = e === e, f = F(e);
    if (!u && !f && !o && n > e || o && a && d && !u && !f || t && a && d || !r && d || !i)
      return 1;
    if (!t && !o && !f && n < e || f && r && i && !t && !o || u && r && i || !a && i || !d)
      return -1;
  }
  return 0;
}
function $e(n, e, r) {
  for (var t = -1, i = n.criteria, o = e.criteria, a = i.length, u = r.length; ++t < a; ) {
    var d = Be(i[t], o[t]);
    if (d) {
      if (t >= u)
        return d;
      var f = r[t];
      return d * (f == "desc" ? -1 : 1);
    }
  }
  return n.index - e.index;
}
function Ge(n, e, r) {
  e.length ? e = P(e, function(o) {
    return J(o) ? function(a) {
      return Nn(a, o.length === 1 ? o[0] : o);
    } : o;
  }) : e = [K];
  var t = -1;
  e = P(e, oe(L));
  var i = Tn(n, function(o, a, u) {
    var d = P(e, function(f) {
      return f(o);
    });
    return { criteria: d, index: ++t, value: o };
  });
  return Ae(i, function(o, a) {
    return $e(o, a, r);
  });
}
function Ve(n, e) {
  return Fe(n, e, function(r, t) {
    return Kn(n, t);
  });
}
var Ye = ge(function(n, e) {
  return n == null ? {} : Ve(n, e);
});
const G = Ye;
var De = Math.ceil, qe = Math.max;
function We(n, e, r, t) {
  for (var i = -1, o = qe(De((e - n) / (r || 1)), 0), a = Array(o); o--; )
    a[t ? o : ++i] = n, n += r;
  return a;
}
function Xe(n) {
  return function(e, r, t) {
    return t && typeof t != "number" && B(e, r, t) && (r = t = void 0), e = S(e), r === void 0 ? (r = e, e = 0) : r = S(r), t = t === void 0 ? e < r ? 1 : -1 : S(t), We(e, r, t, n);
  };
}
var ze = Xe();
const N = ze;
var Ue = Ln(function(n, e) {
  if (n == null)
    return [];
  var r = e.length;
  return r > 1 && B(n, e[0], e[1]) ? e = [] : r > 2 && B(e[0], e[1], e[2]) && (e = [e[0]]), Ge(n, xn(e, 1), []);
});
const O = Ue;
var He = 0;
function en(n) {
  var e = ++He;
  return Zn(n) + e;
}
function je(n, e, r) {
  for (var t = -1, i = n.length, o = e.length, a = {}; ++t < i; ) {
    var u = t < o ? e[t] : void 0;
    r(a, n[t], u);
  }
  return a;
}
function Je(n, e) {
  return je(n || [], e || [], In);
}
class Ke {
  constructor() {
    var e = {};
    e._next = e._prev = e, this._sentinel = e;
  }
  dequeue() {
    var e = this._sentinel, r = e._prev;
    if (r !== e)
      return sn(r), r;
  }
  enqueue(e) {
    var r = this._sentinel;
    e._prev && e._next && sn(e), e._next = r._next, r._next._prev = e, r._next = e, e._prev = r;
  }
  toString() {
    for (var e = [], r = this._sentinel, t = r._prev; t !== r; )
      e.push(JSON.stringify(t, Ze)), t = t._prev;
    return "[" + e.join(", ") + "]";
  }
}
function sn(n) {
  n._prev._next = n._next, n._next._prev = n._prev, delete n._next, delete n._prev;
}
function Ze(n, e) {
  if (n !== "_next" && n !== "_prev")
    return e;
}
var Qe = ue(1);
function nr(n, e) {
  if (n.nodeCount() <= 1)
    return [];
  var r = rr(n, e || Qe), t = er(r.graph, r.buckets, r.zeroIdx);
  return _(
    m(t, function(i) {
      return n.outEdges(i.v, i.w);
    })
  );
}
function er(n, e, r) {
  for (var t = [], i = e[e.length - 1], o = e[0], a; n.nodeCount(); ) {
    for (; a = o.dequeue(); )
      q(n, e, r, a);
    for (; a = i.dequeue(); )
      q(n, e, r, a);
    if (n.nodeCount()) {
      for (var u = e.length - 2; u > 0; --u)
        if (a = e[u].dequeue(), a) {
          t = t.concat(q(n, e, r, a, !0));
          break;
        }
    }
  }
  return t;
}
function q(n, e, r, t, i) {
  var o = i ? [] : void 0;
  return s(n.inEdges(t.v), function(a) {
    var u = n.edge(a), d = n.node(a.v);
    i && o.push({ v: a.v, w: a.w }), d.out -= u, j(e, r, d);
  }), s(n.outEdges(t.v), function(a) {
    var u = n.edge(a), d = a.w, f = n.node(d);
    f.in -= u, j(e, r, f);
  }), n.removeNode(t.v), o;
}
function rr(n, e) {
  var r = new x(), t = 0, i = 0;
  s(n.nodes(), function(u) {
    r.setNode(u, { v: u, in: 0, out: 0 });
  }), s(n.edges(), function(u) {
    var d = r.edge(u.v, u.w) || 0, f = e(u), c = d + f;
    r.setEdge(u.v, u.w, c), i = Math.max(i, r.node(u.v).out += f), t = Math.max(t, r.node(u.w).in += f);
  });
  var o = N(i + t + 3).map(function() {
    return new Ke();
  }), a = t + 1;
  return s(r.nodes(), function(u) {
    j(o, a, r.node(u));
  }), { graph: r, buckets: o, zeroIdx: a };
}
function j(n, e, r) {
  r.out ? r.in ? n[r.out - r.in + e].enqueue(r) : n[n.length - 1].enqueue(r) : n[0].enqueue(r);
}
function tr(n) {
  var e = n.graph().acyclicer === "greedy" ? nr(n, r(n)) : ir(n);
  s(e, function(t) {
    var i = n.edge(t);
    n.removeEdge(t), i.forwardName = t.name, i.reversed = !0, n.setEdge(t.w, t.v, i, en("rev"));
  });
  function r(t) {
    return function(i) {
      return t.edge(i).weight;
    };
  }
}
function ir(n) {
  var e = [], r = {}, t = {};
  function i(o) {
    w(t, o) || (t[o] = !0, r[o] = !0, s(n.outEdges(o), function(a) {
      w(r, a.w) ? e.push(a) : i(a.w);
    }), delete r[o]);
  }
  return s(n.nodes(), i), e;
}
function ar(n) {
  s(n.edges(), function(e) {
    var r = n.edge(e);
    if (r.reversed) {
      n.removeEdge(e);
      var t = r.forwardName;
      delete r.reversed, delete r.forwardName, n.setEdge(e.w, e.v, r, t);
    }
  });
}
function C(n, e, r, t) {
  var i;
  do
    i = en(t);
  while (n.hasNode(i));
  return r.dummy = e, n.setNode(i, r), i;
}
function or(n) {
  var e = new x().setGraph(n.graph());
  return s(n.nodes(), function(r) {
    e.setNode(r, n.node(r));
  }), s(n.edges(), function(r) {
    var t = e.edge(r.v, r.w) || { weight: 0, minlen: 1 }, i = n.edge(r);
    e.setEdge(r.v, r.w, {
      weight: t.weight + i.weight,
      minlen: Math.max(t.minlen, i.minlen)
    });
  }), e;
}
function On(n) {
  var e = new x({ multigraph: n.isMultigraph() }).setGraph(n.graph());
  return s(n.nodes(), function(r) {
    n.children(r).length || e.setNode(r, n.node(r));
  }), s(n.edges(), function(r) {
    e.setEdge(r, n.edge(r));
  }), e;
}
function cn(n, e) {
  var r = n.x, t = n.y, i = e.x - r, o = e.y - t, a = n.width / 2, u = n.height / 2;
  if (!i && !o)
    throw new Error("Not possible to find intersection inside of the rectangle");
  var d, f;
  return Math.abs(o) * a > Math.abs(i) * u ? (o < 0 && (u = -u), d = u * i / o, f = u) : (i < 0 && (a = -a), d = a, f = a * o / i), { x: r + d, y: t + f };
}
function D(n) {
  var e = m(N(Pn(n) + 1), function() {
    return [];
  });
  return s(n.nodes(), function(r) {
    var t = n.node(r), i = t.rank;
    g(i) || (e[i][t.order] = r);
  }), e;
}
function ur(n) {
  var e = R(
    m(n.nodes(), function(r) {
      return n.node(r).rank;
    })
  );
  s(n.nodes(), function(r) {
    var t = n.node(r);
    w(t, "rank") && (t.rank -= e);
  });
}
function dr(n) {
  var e = R(
    m(n.nodes(), function(o) {
      return n.node(o).rank;
    })
  ), r = [];
  s(n.nodes(), function(o) {
    var a = n.node(o).rank - e;
    r[a] || (r[a] = []), r[a].push(o);
  });
  var t = 0, i = n.graph().nodeRankFactor;
  s(r, function(o, a) {
    g(o) && a % i !== 0 ? --t : t && s(o, function(u) {
      n.node(u).rank += t;
    });
  });
}
function hn(n, e, r, t) {
  var i = {
    width: 0,
    height: 0
  };
  return arguments.length >= 4 && (i.rank = r, i.order = t), C(n, "border", i, e);
}
function Pn(n) {
  return E(
    m(n.nodes(), function(e) {
      var r = n.node(e).rank;
      if (!g(r))
        return r;
    })
  );
}
function fr(n, e) {
  var r = { lhs: [], rhs: [] };
  return s(n, function(t) {
    e(t) ? r.lhs.push(t) : r.rhs.push(t);
  }), r;
}
function sr(n, e) {
  var r = fn();
  try {
    return e();
  } finally {
    console.log(n + " time: " + (fn() - r) + "ms");
  }
}
function cr(n, e) {
  return e();
}
function hr(n) {
  function e(r) {
    var t = n.children(r), i = n.node(r);
    if (t.length && s(t, e), w(i, "minRank")) {
      i.borderLeft = [], i.borderRight = [];
      for (var o = i.minRank, a = i.maxRank + 1; o < a; ++o)
        ln(n, "borderLeft", "_bl", r, i, o), ln(n, "borderRight", "_br", r, i, o);
    }
  }
  s(n.children(), e);
}
function ln(n, e, r, t, i, o) {
  var a = { width: 0, height: 0, rank: o, borderType: e }, u = i[e][o - 1], d = C(n, "border", a, r);
  i[e][o] = d, n.setParent(d, t), u && n.setEdge(u, d, { weight: 1 });
}
function lr(n) {
  var e = n.graph().rankdir.toLowerCase();
  (e === "lr" || e === "rl") && Sn(n);
}
function vr(n) {
  var e = n.graph().rankdir.toLowerCase();
  (e === "bt" || e === "rl") && pr(n), (e === "lr" || e === "rl") && (wr(n), Sn(n));
}
function Sn(n) {
  s(n.nodes(), function(e) {
    vn(n.node(e));
  }), s(n.edges(), function(e) {
    vn(n.edge(e));
  });
}
function vn(n) {
  var e = n.width;
  n.width = n.height, n.height = e;
}
function pr(n) {
  s(n.nodes(), function(e) {
    W(n.node(e));
  }), s(n.edges(), function(e) {
    var r = n.edge(e);
    s(r.points, W), w(r, "y") && W(r);
  });
}
function W(n) {
  n.y = -n.y;
}
function wr(n) {
  s(n.nodes(), function(e) {
    X(n.node(e));
  }), s(n.edges(), function(e) {
    var r = n.edge(e);
    s(r.points, X), w(r, "x") && X(r);
  });
}
function X(n) {
  var e = n.x;
  n.x = n.y, n.y = e;
}
function mr(n) {
  n.graph().dummyChains = [], s(n.edges(), function(e) {
    br(n, e);
  });
}
function br(n, e) {
  var r = e.v, t = n.node(r).rank, i = e.w, o = n.node(i).rank, a = e.name, u = n.edge(e), d = u.labelRank;
  if (o !== t + 1) {
    n.removeEdge(e);
    var f, c, h;
    for (h = 0, ++t; t < o; ++h, ++t)
      u.points = [], c = {
        width: 0,
        height: 0,
        edgeLabel: u,
        edgeObj: e,
        rank: t
      }, f = C(n, "edge", c, "_d"), t === d && (c.width = u.width, c.height = u.height, c.dummy = "edge-label", c.labelpos = u.labelpos), n.setEdge(r, f, { weight: u.weight }, a), h === 0 && n.graph().dummyChains.push(f), r = f;
    n.setEdge(r, i, { weight: u.weight }, a);
  }
}
function gr(n) {
  s(n.graph().dummyChains, function(e) {
    var r = n.node(e), t = r.edgeLabel, i;
    for (n.setEdge(r.edgeObj, t); r.dummy; )
      i = n.successors(e)[0], n.removeNode(e), t.points.push({ x: r.x, y: r.y }), r.dummy === "edge-label" && (t.x = r.x, t.y = r.y, t.width = r.width, t.height = r.height), e = i, r = n.node(e);
  });
}
function rn(n) {
  var e = {};
  function r(t) {
    var i = n.node(t);
    if (w(e, t))
      return i.rank;
    e[t] = !0;
    var o = R(
      m(n.outEdges(t), function(a) {
        return r(a.w) - n.edge(a).minlen;
      })
    );
    return (o === Number.POSITIVE_INFINITY || // return value of _.map([]) for Lodash 3
    o === void 0 || // return value of _.map([]) for Lodash 4
    o === null) && (o = 0), i.rank = o;
  }
  s(n.sources(), r);
}
function T(n, e) {
  return n.node(e.w).rank - n.node(e.v).rank - n.edge(e).minlen;
}
function Fn(n) {
  var e = new x({ directed: !1 }), r = n.nodes()[0], t = n.nodeCount();
  e.setNode(r, {});
  for (var i, o; xr(e, n) < t; )
    i = Er(e, n), o = e.hasNode(i.v) ? T(n, i) : -T(n, i), kr(e, n, o);
  return e;
}
function xr(n, e) {
  function r(t) {
    s(e.nodeEdges(t), function(i) {
      var o = i.v, a = t === o ? i.w : o;
      !n.hasNode(a) && !T(e, i) && (n.setNode(a, {}), n.setEdge(t, a, {}), r(a));
    });
  }
  return s(n.nodes(), r), n.nodeCount();
}
function Er(n, e) {
  return nn(e.edges(), function(r) {
    if (n.hasNode(r.v) !== n.hasNode(r.w))
      return T(e, r);
  });
}
function kr(n, e, r) {
  s(n.nodes(), function(t) {
    e.node(t).rank += r;
  });
}
function yr() {
}
yr.prototype = new Error();
function An(n, e, r) {
  J(e) || (e = [e]);
  var t = (n.isDirected() ? n.successors : n.neighbors).bind(n), i = [], o = {};
  return s(e, function(a) {
    if (!n.hasNode(a))
      throw new Error("Graph does not have node: " + a);
    Bn(n, a, r === "post", o, t, i);
  }), i;
}
function Bn(n, e, r, t, i, o) {
  w(t, e) || (t[e] = !0, r || o.push(e), s(i(e), function(a) {
    Bn(n, a, r, t, i, o);
  }), r && o.push(e));
}
function Nr(n, e) {
  return An(n, e, "post");
}
function Lr(n, e) {
  return An(n, e, "pre");
}
k.initLowLimValues = an;
k.initCutValues = tn;
k.calcCutValue = $n;
k.leaveEdge = Vn;
k.enterEdge = Yn;
k.exchangeEdges = Dn;
function k(n) {
  n = or(n), rn(n);
  var e = Fn(n);
  an(e), tn(e, n);
  for (var r, t; r = Vn(e); )
    t = Yn(e, n, r), Dn(e, n, r, t);
}
function tn(n, e) {
  var r = Nr(n, n.nodes());
  r = r.slice(0, r.length - 1), s(r, function(t) {
    _r(n, e, t);
  });
}
function _r(n, e, r) {
  var t = n.node(r), i = t.parent;
  n.edge(r, i).cutvalue = $n(n, e, r);
}
function $n(n, e, r) {
  var t = n.node(r), i = t.parent, o = !0, a = e.edge(r, i), u = 0;
  return a || (o = !1, a = e.edge(i, r)), u = a.weight, s(e.nodeEdges(r), function(d) {
    var f = d.v === r, c = f ? d.w : d.v;
    if (c !== i) {
      var h = f === o, l = e.edge(d).weight;
      if (u += h ? l : -l, Ir(n, r, c)) {
        var v = n.edge(r, c).cutvalue;
        u += h ? -v : v;
      }
    }
  }), u;
}
function an(n, e) {
  arguments.length < 2 && (e = n.nodes()[0]), Gn(n, {}, 1, e);
}
function Gn(n, e, r, t, i) {
  var o = r, a = n.node(t);
  return e[t] = !0, s(n.neighbors(t), function(u) {
    w(e, u) || (r = Gn(n, e, r, u, t));
  }), a.low = o, a.lim = r++, i ? a.parent = i : delete a.parent, r;
}
function Vn(n) {
  return Z(n.edges(), function(e) {
    return n.edge(e).cutvalue < 0;
  });
}
function Yn(n, e, r) {
  var t = r.v, i = r.w;
  e.hasEdge(t, i) || (t = r.w, i = r.v);
  var o = n.node(t), a = n.node(i), u = o, d = !1;
  o.lim > a.lim && (u = a, d = !0);
  var f = M(e.edges(), function(c) {
    return d === pn(n, n.node(c.v), u) && d !== pn(n, n.node(c.w), u);
  });
  return nn(f, function(c) {
    return T(e, c);
  });
}
function Dn(n, e, r, t) {
  var i = r.v, o = r.w;
  n.removeEdge(i, o), n.setEdge(t.v, t.w, {}), an(n), tn(n, e), Cr(n, e);
}
function Cr(n, e) {
  var r = Z(n.nodes(), function(i) {
    return !e.node(i).parent;
  }), t = Lr(n, r);
  t = t.slice(1), s(t, function(i) {
    var o = n.node(i).parent, a = e.edge(i, o), u = !1;
    a || (a = e.edge(o, i), u = !0), e.node(i).rank = e.node(o).rank + (u ? a.minlen : -a.minlen);
  });
}
function Ir(n, e, r) {
  return n.hasEdge(e, r);
}
function pn(n, e, r) {
  return r.low <= e.lim && e.lim <= r.lim;
}
function Rr(n) {
  switch (n.graph().ranker) {
    case "network-simplex":
      wn(n);
      break;
    case "tight-tree":
      Mr(n);
      break;
    case "longest-path":
      Tr(n);
      break;
    default:
      wn(n);
  }
}
var Tr = rn;
function Mr(n) {
  rn(n), Fn(n);
}
function wn(n) {
  k(n);
}
function Or(n) {
  var e = C(n, "root", {}, "_root"), r = Pr(n), t = E(y(r)) - 1, i = 2 * t + 1;
  n.graph().nestingRoot = e, s(n.edges(), function(a) {
    n.edge(a).minlen *= i;
  });
  var o = Sr(n) + 1;
  s(n.children(), function(a) {
    qn(n, e, i, o, t, r, a);
  }), n.graph().nodeRankFactor = i;
}
function qn(n, e, r, t, i, o, a) {
  var u = n.children(a);
  if (!u.length) {
    a !== e && n.setEdge(e, a, { weight: 0, minlen: r });
    return;
  }
  var d = hn(n, "_bt"), f = hn(n, "_bb"), c = n.node(a);
  n.setParent(d, a), c.borderTop = d, n.setParent(f, a), c.borderBottom = f, s(u, function(h) {
    qn(n, e, r, t, i, o, h);
    var l = n.node(h), v = l.borderTop ? l.borderTop : h, p = l.borderBottom ? l.borderBottom : h, b = l.borderTop ? t : 2 * t, I = v !== p ? 1 : i - o[a] + 1;
    n.setEdge(d, v, {
      weight: b,
      minlen: I,
      nestingEdge: !0
    }), n.setEdge(p, f, {
      weight: b,
      minlen: I,
      nestingEdge: !0
    });
  }), n.parent(a) || n.setEdge(e, d, { weight: 0, minlen: i + o[a] });
}
function Pr(n) {
  var e = {};
  function r(t, i) {
    var o = n.children(t);
    o && o.length && s(o, function(a) {
      r(a, i + 1);
    }), e[t] = i;
  }
  return s(n.children(), function(t) {
    r(t, 1);
  }), e;
}
function Sr(n) {
  return V(
    n.edges(),
    function(e, r) {
      return e + n.edge(r).weight;
    },
    0
  );
}
function Fr(n) {
  var e = n.graph();
  n.removeNode(e.nestingRoot), delete e.nestingRoot, s(n.edges(), function(r) {
    var t = n.edge(r);
    t.nestingEdge && n.removeEdge(r);
  });
}
function Ar(n, e, r) {
  var t = {}, i;
  s(r, function(o) {
    for (var a = n.parent(o), u, d; a; ) {
      if (u = n.parent(a), u ? (d = t[u], t[u] = a) : (d = i, i = a), d && d !== a) {
        e.setEdge(d, a);
        return;
      }
      a = u;
    }
  });
}
function Br(n, e, r) {
  var t = $r(n), i = new x({ compound: !0 }).setGraph({ root: t }).setDefaultNodeLabel(function(o) {
    return n.node(o);
  });
  return s(n.nodes(), function(o) {
    var a = n.node(o), u = n.parent(o);
    (a.rank === e || a.minRank <= e && e <= a.maxRank) && (i.setNode(o), i.setParent(o, u || t), s(n[r](o), function(d) {
      var f = d.v === o ? d.w : d.v, c = i.edge(f, o), h = g(c) ? 0 : c.weight;
      i.setEdge(f, o, { weight: n.edge(d).weight + h });
    }), w(a, "minRank") && i.setNode(o, {
      borderLeft: a.borderLeft[e],
      borderRight: a.borderRight[e]
    }));
  }), i;
}
function $r(n) {
  for (var e; n.hasNode(e = en("_root")); )
    ;
  return e;
}
function Gr(n, e) {
  for (var r = 0, t = 1; t < e.length; ++t)
    r += Vr(n, e[t - 1], e[t]);
  return r;
}
function Vr(n, e, r) {
  for (var t = Je(
    r,
    m(r, function(f, c) {
      return c;
    })
  ), i = _(
    m(e, function(f) {
      return O(
        m(n.outEdges(f), function(c) {
          return { pos: t[c.w], weight: n.edge(c).weight };
        }),
        "pos"
      );
    })
  ), o = 1; o < r.length; )
    o <<= 1;
  var a = 2 * o - 1;
  o -= 1;
  var u = m(new Array(a), function() {
    return 0;
  }), d = 0;
  return s(
    // @ts-expect-error
    i.forEach(function(f) {
      var c = f.pos + o;
      u[c] += f.weight;
      for (var h = 0; c > 0; )
        c % 2 && (h += u[c + 1]), c = c - 1 >> 1, u[c] += f.weight;
      d += f.weight * h;
    })
  ), d;
}
function Yr(n) {
  var e = {}, r = M(n.nodes(), function(u) {
    return !n.children(u).length;
  }), t = E(
    m(r, function(u) {
      return n.node(u).rank;
    })
  ), i = m(N(t + 1), function() {
    return [];
  });
  function o(u) {
    if (!w(e, u)) {
      e[u] = !0;
      var d = n.node(u);
      i[d.rank].push(u), s(n.successors(u), o);
    }
  }
  var a = O(r, function(u) {
    return n.node(u).rank;
  });
  return s(a, o), i;
}
function Dr(n, e) {
  return m(e, function(r) {
    var t = n.inEdges(r);
    if (t.length) {
      var i = V(
        t,
        function(o, a) {
          var u = n.edge(a), d = n.node(a.v);
          return {
            sum: o.sum + u.weight * d.order,
            weight: o.weight + u.weight
          };
        },
        { sum: 0, weight: 0 }
      );
      return {
        v: r,
        barycenter: i.sum / i.weight,
        weight: i.weight
      };
    } else
      return { v: r };
  });
}
function qr(n, e) {
  var r = {};
  s(n, function(i, o) {
    var a = r[i.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [i.v],
      i: o
    };
    g(i.barycenter) || (a.barycenter = i.barycenter, a.weight = i.weight);
  }), s(e.edges(), function(i) {
    var o = r[i.v], a = r[i.w];
    !g(o) && !g(a) && (a.indegree++, o.out.push(r[i.w]));
  });
  var t = M(r, function(i) {
    return !i.indegree;
  });
  return Wr(t);
}
function Wr(n) {
  var e = [];
  function r(o) {
    return function(a) {
      a.merged || (g(a.barycenter) || g(o.barycenter) || a.barycenter >= o.barycenter) && Xr(o, a);
    };
  }
  function t(o) {
    return function(a) {
      a.in.push(o), --a.indegree === 0 && n.push(a);
    };
  }
  for (; n.length; ) {
    var i = n.pop();
    e.push(i), s(i.in.reverse(), r(i)), s(i.out, t(i));
  }
  return m(
    M(e, function(o) {
      return !o.merged;
    }),
    function(o) {
      return G(o, ["vs", "i", "barycenter", "weight"]);
    }
  );
}
function Xr(n, e) {
  var r = 0, t = 0;
  n.weight && (r += n.barycenter * n.weight, t += n.weight), e.weight && (r += e.barycenter * e.weight, t += e.weight), n.vs = e.vs.concat(n.vs), n.barycenter = r / t, n.weight = t, n.i = Math.min(e.i, n.i), e.merged = !0;
}
function zr(n, e) {
  var r = fr(n, function(c) {
    return w(c, "barycenter");
  }), t = r.lhs, i = O(r.rhs, function(c) {
    return -c.i;
  }), o = [], a = 0, u = 0, d = 0;
  t.sort(Ur(!!e)), d = mn(o, i, d), s(t, function(c) {
    d += c.vs.length, o.push(c.vs), a += c.barycenter * c.weight, u += c.weight, d = mn(o, i, d);
  });
  var f = { vs: _(o) };
  return u && (f.barycenter = a / u, f.weight = u), f;
}
function mn(n, e, r) {
  for (var t; e.length && (t = $(e)).i <= r; )
    e.pop(), n.push(t.vs), r++;
  return r;
}
function Ur(n) {
  return function(e, r) {
    return e.barycenter < r.barycenter ? -1 : e.barycenter > r.barycenter ? 1 : n ? r.i - e.i : e.i - r.i;
  };
}
function Wn(n, e, r, t) {
  var i = n.children(e), o = n.node(e), a = o ? o.borderLeft : void 0, u = o ? o.borderRight : void 0, d = {};
  a && (i = M(i, function(p) {
    return p !== a && p !== u;
  }));
  var f = Dr(n, i);
  s(f, function(p) {
    if (n.children(p.v).length) {
      var b = Wn(n, p.v, r, t);
      d[p.v] = b, w(b, "barycenter") && jr(p, b);
    }
  });
  var c = qr(f, r);
  Hr(c, d);
  var h = zr(c, t);
  if (a && (h.vs = _([a, h.vs, u]), n.predecessors(a).length)) {
    var l = n.node(n.predecessors(a)[0]), v = n.node(n.predecessors(u)[0]);
    w(h, "barycenter") || (h.barycenter = 0, h.weight = 0), h.barycenter = (h.barycenter * h.weight + l.order + v.order) / (h.weight + 2), h.weight += 2;
  }
  return h;
}
function Hr(n, e) {
  s(n, function(r) {
    r.vs = _(
      r.vs.map(function(t) {
        return e[t] ? e[t].vs : t;
      })
    );
  });
}
function jr(n, e) {
  g(n.barycenter) ? (n.barycenter = e.barycenter, n.weight = e.weight) : (n.barycenter = (n.barycenter * n.weight + e.barycenter * e.weight) / (n.weight + e.weight), n.weight += e.weight);
}
function Jr(n) {
  var e = Pn(n), r = bn(n, N(1, e + 1), "inEdges"), t = bn(n, N(e - 1, -1, -1), "outEdges"), i = Yr(n);
  gn(n, i);
  for (var o = Number.POSITIVE_INFINITY, a, u = 0, d = 0; d < 4; ++u, ++d) {
    Kr(u % 2 ? r : t, u % 4 >= 2), i = D(n);
    var f = Gr(n, i);
    f < o && (d = 0, a = ke(i), o = f);
  }
  gn(n, a);
}
function bn(n, e, r) {
  return m(e, function(t) {
    return Br(n, t, r);
  });
}
function Kr(n, e) {
  var r = new x();
  s(n, function(t) {
    var i = t.graph().root, o = Wn(t, i, r, e);
    s(o.vs, function(a, u) {
      t.node(a).order = u;
    }), Ar(t, r, o.vs);
  });
}
function gn(n, e) {
  s(e, function(r) {
    s(r, function(t, i) {
      n.node(t).order = i;
    });
  });
}
function Zr(n) {
  var e = nt(n);
  s(n.graph().dummyChains, function(r) {
    for (var t = n.node(r), i = t.edgeObj, o = Qr(n, e, i.v, i.w), a = o.path, u = o.lca, d = 0, f = a[d], c = !0; r !== i.w; ) {
      if (t = n.node(r), c) {
        for (; (f = a[d]) !== u && n.node(f).maxRank < t.rank; )
          d++;
        f === u && (c = !1);
      }
      if (!c) {
        for (; d < a.length - 1 && n.node(f = a[d + 1]).minRank <= t.rank; )
          d++;
        f = a[d];
      }
      n.setParent(r, f), r = n.successors(r)[0];
    }
  });
}
function Qr(n, e, r, t) {
  var i = [], o = [], a = Math.min(e[r].low, e[t].low), u = Math.max(e[r].lim, e[t].lim), d, f;
  d = r;
  do
    d = n.parent(d), i.push(d);
  while (d && (e[d].low > a || u > e[d].lim));
  for (f = d, d = t; (d = n.parent(d)) !== f; )
    o.push(d);
  return { path: i.concat(o.reverse()), lca: f };
}
function nt(n) {
  var e = {}, r = 0;
  function t(i) {
    var o = r;
    s(n.children(i), t), e[i] = { low: o, lim: r++ };
  }
  return s(n.children(), t), e;
}
function et(n, e) {
  var r = {};
  function t(i, o) {
    var a = 0, u = 0, d = i.length, f = $(o);
    return s(o, function(c, h) {
      var l = tt(n, c), v = l ? n.node(l).order : d;
      (l || c === f) && (s(o.slice(u, h + 1), function(p) {
        s(n.predecessors(p), function(b) {
          var I = n.node(b), on = I.order;
          (on < a || v < on) && !(I.dummy && n.node(p).dummy) && Xn(r, b, p);
        });
      }), u = h + 1, a = v);
    }), o;
  }
  return V(e, t), r;
}
function rt(n, e) {
  var r = {};
  function t(o, a, u, d, f) {
    var c;
    s(N(a, u), function(h) {
      c = o[h], n.node(c).dummy && s(n.predecessors(c), function(l) {
        var v = n.node(l);
        v.dummy && (v.order < d || v.order > f) && Xn(r, l, c);
      });
    });
  }
  function i(o, a) {
    var u = -1, d, f = 0;
    return s(a, function(c, h) {
      if (n.node(c).dummy === "border") {
        var l = n.predecessors(c);
        l.length && (d = n.node(l[0]).order, t(a, f, h, u, d), f = h, u = d);
      }
      t(a, f, a.length, d, o.length);
    }), a;
  }
  return V(e, i), r;
}
function tt(n, e) {
  if (n.node(e).dummy)
    return Z(n.predecessors(e), function(r) {
      return n.node(r).dummy;
    });
}
function Xn(n, e, r) {
  if (e > r) {
    var t = e;
    e = r, r = t;
  }
  var i = n[e];
  i || (n[e] = i = {}), i[r] = !0;
}
function it(n, e, r) {
  if (e > r) {
    var t = e;
    e = r, r = t;
  }
  return w(n[e], r);
}
function at(n, e, r, t) {
  var i = {}, o = {}, a = {};
  return s(e, function(u) {
    s(u, function(d, f) {
      i[d] = d, o[d] = d, a[d] = f;
    });
  }), s(e, function(u) {
    var d = -1;
    s(u, function(f) {
      var c = t(f);
      if (c.length) {
        c = O(c, function(b) {
          return a[b];
        });
        for (var h = (c.length - 1) / 2, l = Math.floor(h), v = Math.ceil(h); l <= v; ++l) {
          var p = c[l];
          o[f] === f && d < a[p] && !it(r, f, p) && (o[p] = f, o[f] = i[f] = i[p], d = a[p]);
        }
      }
    });
  }), { root: i, align: o };
}
function ot(n, e, r, t, i) {
  var o = {}, a = ut(n, e, r, i), u = i ? "borderLeft" : "borderRight";
  function d(h, l) {
    for (var v = a.nodes(), p = v.pop(), b = {}; p; )
      b[p] ? h(p) : (b[p] = !0, v.push(p), v = v.concat(l(p))), p = v.pop();
  }
  function f(h) {
    o[h] = a.inEdges(h).reduce(function(l, v) {
      return Math.max(l, o[v.v] + a.edge(v));
    }, 0);
  }
  function c(h) {
    var l = a.outEdges(h).reduce(function(p, b) {
      return Math.min(p, o[b.w] - a.edge(b));
    }, Number.POSITIVE_INFINITY), v = n.node(h);
    l !== Number.POSITIVE_INFINITY && v.borderType !== u && (o[h] = Math.max(o[h], l));
  }
  return d(f, a.predecessors.bind(a)), d(c, a.successors.bind(a)), s(t, function(h) {
    o[h] = o[r[h]];
  }), o;
}
function ut(n, e, r, t) {
  var i = new x(), o = n.graph(), a = ht(o.nodesep, o.edgesep, t);
  return s(e, function(u) {
    var d;
    s(u, function(f) {
      var c = r[f];
      if (i.setNode(c), d) {
        var h = r[d], l = i.edge(h, c);
        i.setEdge(h, c, Math.max(a(n, f, d), l || 0));
      }
      d = f;
    });
  }), i;
}
function dt(n, e) {
  return nn(y(e), function(r) {
    var t = Number.NEGATIVE_INFINITY, i = Number.POSITIVE_INFINITY;
    return Me(r, function(o, a) {
      var u = lt(n, a) / 2;
      t = Math.max(o + u, t), i = Math.min(o - u, i);
    }), t - i;
  });
}
function ft(n, e) {
  var r = y(e), t = R(r), i = E(r);
  s(["u", "d"], function(o) {
    s(["l", "r"], function(a) {
      var u = o + a, d = n[u], f;
      if (d !== e) {
        var c = y(d);
        f = a === "l" ? t - R(c) : i - E(c), f && (n[u] = Y(d, function(h) {
          return h + f;
        }));
      }
    });
  });
}
function st(n, e) {
  return Y(n.ul, function(r, t) {
    if (e)
      return n[e.toLowerCase()][t];
    var i = O(m(n, t));
    return (i[1] + i[2]) / 2;
  });
}
function ct(n) {
  var e = D(n), r = H(et(n, e), rt(n, e)), t = {}, i;
  s(["u", "d"], function(a) {
    i = a === "u" ? e : y(e).reverse(), s(["l", "r"], function(u) {
      u === "r" && (i = m(i, function(h) {
        return y(h).reverse();
      }));
      var d = (a === "u" ? n.predecessors : n.successors).bind(n), f = at(n, i, r, d), c = ot(n, i, f.root, f.align, u === "r");
      u === "r" && (c = Y(c, function(h) {
        return -h;
      })), t[a + u] = c;
    });
  });
  var o = dt(n, t);
  return ft(t, o), st(t, n.graph().align);
}
function ht(n, e, r) {
  return function(t, i, o) {
    var a = t.node(i), u = t.node(o), d = 0, f;
    if (d += a.width / 2, w(a, "labelpos"))
      switch (a.labelpos.toLowerCase()) {
        case "l":
          f = -a.width / 2;
          break;
        case "r":
          f = a.width / 2;
          break;
      }
    if (f && (d += r ? f : -f), f = 0, d += (a.dummy ? e : n) / 2, d += (u.dummy ? e : n) / 2, d += u.width / 2, w(u, "labelpos"))
      switch (u.labelpos.toLowerCase()) {
        case "l":
          f = u.width / 2;
          break;
        case "r":
          f = -u.width / 2;
          break;
      }
    return f && (d += r ? f : -f), f = 0, d;
  };
}
function lt(n, e) {
  return n.node(e).width;
}
function vt(n) {
  n = On(n), pt(n), Oe(ct(n), function(e, r) {
    n.node(r).x = e;
  });
}
function pt(n) {
  var e = D(n), r = n.graph().ranksep, t = 0;
  s(e, function(i) {
    var o = E(
      m(i, function(a) {
        return n.node(a).height;
      })
    );
    s(i, function(a) {
      n.node(a).y = t + o / 2;
    }), t += o + r;
  });
}
function Yt(n, e) {
  var r = e && e.debugTiming ? sr : cr;
  r("layout", function() {
    var t = r("  buildLayoutGraph", function() {
      return _t(n);
    });
    r("  runLayout", function() {
      wt(t, r);
    }), r("  updateInputGraph", function() {
      mt(n, t);
    });
  });
}
function wt(n, e) {
  e("    makeSpaceForEdgeLabels", function() {
    Ct(n);
  }), e("    removeSelfEdges", function() {
    At(n);
  }), e("    acyclic", function() {
    tr(n);
  }), e("    nestingGraph.run", function() {
    Or(n);
  }), e("    rank", function() {
    Rr(On(n));
  }), e("    injectEdgeLabelProxies", function() {
    It(n);
  }), e("    removeEmptyRanks", function() {
    dr(n);
  }), e("    nestingGraph.cleanup", function() {
    Fr(n);
  }), e("    normalizeRanks", function() {
    ur(n);
  }), e("    assignRankMinMax", function() {
    Rt(n);
  }), e("    removeEdgeLabelProxies", function() {
    Tt(n);
  }), e("    normalize.run", function() {
    mr(n);
  }), e("    parentDummyChains", function() {
    Zr(n);
  }), e("    addBorderSegments", function() {
    hr(n);
  }), e("    order", function() {
    Jr(n);
  }), e("    insertSelfEdges", function() {
    Bt(n);
  }), e("    adjustCoordinateSystem", function() {
    lr(n);
  }), e("    position", function() {
    vt(n);
  }), e("    positionSelfEdges", function() {
    $t(n);
  }), e("    removeBorderNodes", function() {
    Ft(n);
  }), e("    normalize.undo", function() {
    gr(n);
  }), e("    fixupEdgeLabelCoords", function() {
    Pt(n);
  }), e("    undoCoordinateSystem", function() {
    vr(n);
  }), e("    translateGraph", function() {
    Mt(n);
  }), e("    assignNodeIntersects", function() {
    Ot(n);
  }), e("    reversePoints", function() {
    St(n);
  }), e("    acyclic.undo", function() {
    ar(n);
  });
}
function mt(n, e) {
  s(n.nodes(), function(r) {
    var t = n.node(r), i = e.node(r);
    t && (t.x = i.x, t.y = i.y, e.children(r).length && (t.width = i.width, t.height = i.height));
  }), s(n.edges(), function(r) {
    var t = n.edge(r), i = e.edge(r);
    t.points = i.points, w(i, "x") && (t.x = i.x, t.y = i.y);
  }), n.graph().width = e.graph().width, n.graph().height = e.graph().height;
}
var bt = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], gt = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, xt = ["acyclicer", "ranker", "rankdir", "align"], Et = ["width", "height"], kt = { width: 0, height: 0 }, yt = ["minlen", "weight", "width", "height", "labeloffset"], Nt = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
}, Lt = ["labelpos"];
function _t(n) {
  var e = new x({ multigraph: !0, compound: !0 }), r = U(n.graph());
  return e.setGraph(
    H({}, gt, z(r, bt), G(r, xt))
  ), s(n.nodes(), function(t) {
    var i = U(n.node(t));
    e.setNode(t, _e(z(i, Et), kt)), e.setParent(t, n.parent(t));
  }), s(n.edges(), function(t) {
    var i = U(n.edge(t));
    e.setEdge(
      t,
      H({}, Nt, z(i, yt), G(i, Lt))
    );
  }), e;
}
function Ct(n) {
  var e = n.graph();
  e.ranksep /= 2, s(n.edges(), function(r) {
    var t = n.edge(r);
    t.minlen *= 2, t.labelpos.toLowerCase() !== "c" && (e.rankdir === "TB" || e.rankdir === "BT" ? t.width += t.labeloffset : t.height += t.labeloffset);
  });
}
function It(n) {
  s(n.edges(), function(e) {
    var r = n.edge(e);
    if (r.width && r.height) {
      var t = n.node(e.v), i = n.node(e.w), o = { rank: (i.rank - t.rank) / 2 + t.rank, e };
      C(n, "edge-proxy", o, "_ep");
    }
  });
}
function Rt(n) {
  var e = 0;
  s(n.nodes(), function(r) {
    var t = n.node(r);
    t.borderTop && (t.minRank = n.node(t.borderTop).rank, t.maxRank = n.node(t.borderBottom).rank, e = E(e, t.maxRank));
  }), n.graph().maxRank = e;
}
function Tt(n) {
  s(n.nodes(), function(e) {
    var r = n.node(e);
    r.dummy === "edge-proxy" && (n.edge(r.e).labelRank = r.rank, n.removeNode(e));
  });
}
function Mt(n) {
  var e = Number.POSITIVE_INFINITY, r = 0, t = Number.POSITIVE_INFINITY, i = 0, o = n.graph(), a = o.marginx || 0, u = o.marginy || 0;
  function d(f) {
    var c = f.x, h = f.y, l = f.width, v = f.height;
    e = Math.min(e, c - l / 2), r = Math.max(r, c + l / 2), t = Math.min(t, h - v / 2), i = Math.max(i, h + v / 2);
  }
  s(n.nodes(), function(f) {
    d(n.node(f));
  }), s(n.edges(), function(f) {
    var c = n.edge(f);
    w(c, "x") && d(c);
  }), e -= a, t -= u, s(n.nodes(), function(f) {
    var c = n.node(f);
    c.x -= e, c.y -= t;
  }), s(n.edges(), function(f) {
    var c = n.edge(f);
    s(c.points, function(h) {
      h.x -= e, h.y -= t;
    }), w(c, "x") && (c.x -= e), w(c, "y") && (c.y -= t);
  }), o.width = r - e + a, o.height = i - t + u;
}
function Ot(n) {
  s(n.edges(), function(e) {
    var r = n.edge(e), t = n.node(e.v), i = n.node(e.w), o, a;
    r.points ? (o = r.points[0], a = r.points[r.points.length - 1]) : (r.points = [], o = i, a = t), r.points.unshift(cn(t, o)), r.points.push(cn(i, a));
  });
}
function Pt(n) {
  s(n.edges(), function(e) {
    var r = n.edge(e);
    if (w(r, "x"))
      switch ((r.labelpos === "l" || r.labelpos === "r") && (r.width -= r.labeloffset), r.labelpos) {
        case "l":
          r.x -= r.width / 2 + r.labeloffset;
          break;
        case "r":
          r.x += r.width / 2 + r.labeloffset;
          break;
      }
  });
}
function St(n) {
  s(n.edges(), function(e) {
    var r = n.edge(e);
    r.reversed && r.points.reverse();
  });
}
function Ft(n) {
  s(n.nodes(), function(e) {
    if (n.children(e).length) {
      var r = n.node(e), t = n.node(r.borderTop), i = n.node(r.borderBottom), o = n.node($(r.borderLeft)), a = n.node($(r.borderRight));
      r.width = Math.abs(a.x - o.x), r.height = Math.abs(i.y - t.y), r.x = o.x + r.width / 2, r.y = t.y + r.height / 2;
    }
  }), s(n.nodes(), function(e) {
    n.node(e).dummy === "border" && n.removeNode(e);
  });
}
function At(n) {
  s(n.edges(), function(e) {
    if (e.v === e.w) {
      var r = n.node(e.v);
      r.selfEdges || (r.selfEdges = []), r.selfEdges.push({ e, label: n.edge(e) }), n.removeEdge(e);
    }
  });
}
function Bt(n) {
  var e = D(n);
  s(e, function(r) {
    var t = 0;
    s(r, function(i, o) {
      var a = n.node(i);
      a.order = o + t, s(a.selfEdges, function(u) {
        C(
          n,
          "selfedge",
          {
            width: u.label.width,
            height: u.label.height,
            rank: a.rank,
            order: o + ++t,
            e: u.e,
            label: u.label
          },
          "_se"
        );
      }), delete a.selfEdges;
    });
  });
}
function $t(n) {
  s(n.nodes(), function(e) {
    var r = n.node(e);
    if (r.dummy === "selfedge") {
      var t = n.node(r.e.v), i = t.x + t.width / 2, o = t.y, a = r.x - i, u = t.height / 2;
      n.setEdge(r.e, r.label), n.removeNode(e), r.label.points = [
        { x: i + 2 * a / 3, y: o - u },
        { x: i + 5 * a / 6, y: o - u },
        { x: i + a, y: o },
        { x: i + 5 * a / 6, y: o + u },
        { x: i + 2 * a / 3, y: o + u }
      ], r.label.x = r.x, r.label.y = r.y;
    }
  });
}
function z(n, e) {
  return Y(G(n, e), Number);
}
function U(n) {
  var e = {};
  return s(n, function(r, t) {
    e[t.toLowerCase()] = r;
  }), e;
}
export {
  _e as d,
  Yt as l,
  m,
  G as p,
  N as r,
  en as u
};
