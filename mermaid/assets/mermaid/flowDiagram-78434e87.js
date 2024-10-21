import { p as Lt, f as V } from "./flowDb-eb72ec24.js";
import { h as S, f as tt, G as _t } from "./graph-71d8872f.js";
import { j as x, n as U, o as Y, p as et, c as G, r as rt, f as at, l as R, q as z, t as Et } from "./mermaid-1fcb8b31.js";
import { u as Tt, r as Nt, p as At, l as Ct, d as M } from "./layout-8444cf3b.js";
import { a as N, b as nt, i as st, c as E, e as it, d as ot, s as It, f as Bt, g as Mt } from "./styles-7f9bfd39.js";
import { l as Dt } from "./line-c65adc04.js";
import "./index-86c44211.js";
import "./clone-e3dc8f2f.js";
import "./edges-83606b8f.js";
import "./createText-a0fe220c.js";
import "./channel-d29179aa.js";
import "./array-2ff2c7a6.js";
import "./path-428ebac9.js";
function Rt(r) {
  if (!r.ok)
    throw new Error(r.status + " " + r.statusText);
  return r.text();
}
function Gt(r, e) {
  return fetch(r, e).then(Rt);
}
function Pt(r) {
  return (e, t) => Gt(e, t).then((n) => new DOMParser().parseFromString(n, r));
}
var Ut = Pt("image/svg+xml"), H = {
  normal: $t,
  vee: Vt,
  undirected: zt
};
function Wt(r) {
  H = r;
}
function $t(r, e, t, n) {
  var a = r.append("marker").attr("id", e).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto"), s = a.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  N(s, t[n + "Style"]), t[n + "Class"] && s.attr("class", t[n + "Class"]);
}
function Vt(r, e, t, n) {
  var a = r.append("marker").attr("id", e).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto"), s = a.append("path").attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  N(s, t[n + "Style"]), t[n + "Class"] && s.attr("class", t[n + "Class"]);
}
function zt(r, e, t, n) {
  var a = r.append("marker").attr("id", e).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto"), s = a.append("path").attr("d", "M 0 5 L 10 5").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  N(s, t[n + "Style"]), t[n + "Class"] && s.attr("class", t[n + "Class"]);
}
function Yt(r, e) {
  var t = r;
  return t.node().appendChild(e.label), N(t, e.labelStyle), t;
}
function Ht(r, e) {
  for (var t = r.append("text"), n = Xt(e.label).split(`
`), a = 0; a < n.length; a++)
    t.append("tspan").attr("xml:space", "preserve").attr("dy", "1em").attr("x", "1").text(n[a]);
  return N(t, e.labelStyle), t;
}
function Xt(r) {
  for (var e = "", t = !1, n, a = 0; a < r.length; ++a)
    if (n = r[a], t) {
      switch (n) {
        case "n":
          e += `
`;
          break;
        default:
          e += n;
      }
      t = !1;
    } else
      n === "\\" ? t = !0 : e += n;
  return e;
}
function J(r, e, t) {
  var n = e.label, a = r.append("g");
  e.labelType === "svg" ? Yt(a, e) : typeof n != "string" || e.labelType === "html" ? nt(a, e) : Ht(a, e);
  var s = a.node().getBBox(), i;
  switch (t) {
    case "top":
      i = -e.height / 2;
      break;
    case "bottom":
      i = e.height / 2 - s.height;
      break;
    default:
      i = -s.height / 2;
  }
  return a.attr("transform", "translate(" + -s.width / 2 + "," + i + ")"), a;
}
var X = function(r, e) {
  var t = e.nodes().filter(function(s) {
    return st(e, s);
  }), n = r.selectAll("g.cluster").data(t, function(s) {
    return s;
  });
  E(n.exit(), e).style("opacity", 0).remove();
  var a = n.enter().append("g").attr("class", "cluster").attr("id", function(s) {
    var i = e.node(s);
    return i.id;
  }).style("opacity", 0).each(function(s) {
    var i = e.node(s), o = x(this);
    x(this).append("rect");
    var c = o.append("g").attr("class", "label");
    J(c, i, i.clusterLabelPos);
  });
  return n = n.merge(a), n = E(n, e).style("opacity", 1), n.selectAll("rect").each(function(s) {
    var i = e.node(s), o = x(this);
    N(o, i.style);
  }), n;
};
function Ft(r) {
  X = r;
}
let F = function(r, e) {
  var t = r.selectAll("g.edgeLabel").data(e.edges(), function(a) {
    return it(a);
  }).classed("update", !0);
  t.exit().remove(), t.enter().append("g").classed("edgeLabel", !0).style("opacity", 0), t = r.selectAll("g.edgeLabel"), t.each(function(a) {
    var s = x(this);
    s.select(".label").remove();
    var i = e.edge(a), o = J(s, e.edge(a), 0).classed("label", !0), c = o.node().getBBox();
    i.labelId && o.attr("id", i.labelId), S(i, "width") || (i.width = c.width), S(i, "height") || (i.height = c.height);
  });
  var n;
  return t.exit ? n = t.exit() : n = t.selectAll(null), E(n, e).style("opacity", 0).remove(), t;
};
function qt(r) {
  F = r;
}
function O(r, e) {
  return r.intersect(e);
}
var q = function(r, e, t) {
  var n = r.selectAll("g.edgePath").data(e.edges(), function(i) {
    return it(i);
  }).classed("update", !0), a = Ot(n, e);
  jt(n, e);
  var s = n.merge !== void 0 ? n.merge(a) : n;
  return E(s, e).style("opacity", 1), s.each(function(i) {
    var o = x(this), c = e.edge(i);
    c.elem = this, c.id && o.attr("id", c.id), ot(
      o,
      c.class,
      (o.classed("update") ? "update " : "") + "edgePath"
    );
  }), s.selectAll("path.path").each(function(i) {
    var o = e.edge(i);
    o.arrowheadId = Tt("arrowhead");
    var c = x(this).attr("marker-end", function() {
      return "url(" + Kt(location.href, o.arrowheadId) + ")";
    }).style("fill", "none");
    E(c, e).attr("d", function(d) {
      return Jt(e, d);
    }), N(c, o.style);
  }), s.selectAll("defs *").remove(), s.selectAll("defs").each(function(i) {
    var o = e.edge(i), c = t[o.arrowhead];
    c(x(this), o.arrowheadId, o, "arrowhead");
  }), s;
};
function Qt(r) {
  q = r;
}
function Kt(r, e) {
  var t = r.split("#")[0];
  return t + "#" + e;
}
function Jt(r, e) {
  var t = r.edge(e), n = r.node(e.v), a = r.node(e.w), s = t.points.slice(1, t.points.length - 1);
  return s.unshift(O(n, s[0])), s.push(O(a, s[s.length - 1])), lt(t, s);
}
function lt(r, e) {
  var t = (Dt || Ut.line)().x(function(n) {
    return n.x;
  }).y(function(n) {
    return n.y;
  });
  return (t.curve || t.interpolate)(r.curve), t(e);
}
function Zt(r) {
  var e = r.getBBox(), t = r.ownerSVGElement.getScreenCTM().inverse().multiply(r.getScreenCTM()).translate(e.width / 2, e.height / 2);
  return { x: t.e, y: t.f };
}
function Ot(r, e) {
  var t = r.enter().append("g").attr("class", "edgePath").style("opacity", 0);
  return t.append("path").attr("class", "path").attr("d", function(n) {
    var a = e.edge(n), s = e.node(n.v).elem, i = Nt(a.points.length).map(function() {
      return Zt(s);
    });
    return lt(a, i);
  }), t.append("defs"), t;
}
function jt(r, e) {
  var t = r.exit();
  E(t, e).style("opacity", 0).remove();
}
var Q = function(r, e, t) {
  var n = e.nodes().filter(function(i) {
    return !st(e, i);
  }), a = r.selectAll("g.node").data(n, function(i) {
    return i;
  }).classed("update", !0);
  a.exit().remove(), a.enter().append("g").attr("class", "node").style("opacity", 0), a = r.selectAll("g.node"), a.each(function(i) {
    var o = e.node(i), c = x(this);
    ot(
      c,
      o.class,
      (c.classed("update") ? "update " : "") + "node"
    ), c.select("g.label").remove();
    var d = c.append("g").attr("class", "label"), l = J(d, o), g = t[o.shape], h = At(l.node().getBBox(), "width", "height");
    o.elem = this, o.id && c.attr("id", o.id), o.labelId && d.attr("id", o.labelId), S(o, "width") && (h.width = o.width), S(o, "height") && (h.height = o.height), h.width += o.paddingLeft + o.paddingRight, h.height += o.paddingTop + o.paddingBottom, d.attr(
      "transform",
      "translate(" + (o.paddingLeft - o.paddingRight) / 2 + "," + (o.paddingTop - o.paddingBottom) / 2 + ")"
    );
    var u = x(this);
    u.select(".label-container").remove();
    var p = g(u, h, o).classed("label-container", !0);
    N(p, o.style);
    var v = p.node().getBBox();
    o.width = v.width, o.height = v.height;
  });
  var s;
  return a.exit ? s = a.exit() : s = a.selectAll(null), E(s, e).style("opacity", 0).remove(), a;
};
function te(r) {
  Q = r;
}
function ee(r, e) {
  var t = r.filter(function() {
    return !x(this).classed("update");
  });
  function n(a) {
    var s = e.node(a);
    return "translate(" + s.x + "," + s.y + ")";
  }
  t.attr("transform", n), E(r, e).style("opacity", 1).attr("transform", n), E(t.selectAll("rect"), e).attr("width", function(a) {
    return e.node(a).width;
  }).attr("height", function(a) {
    return e.node(a).height;
  }).attr("x", function(a) {
    var s = e.node(a);
    return -s.width / 2;
  }).attr("y", function(a) {
    var s = e.node(a);
    return -s.height / 2;
  });
}
function re(r, e) {
  var t = r.filter(function() {
    return !x(this).classed("update");
  });
  function n(a) {
    var s = e.edge(a);
    return S(s, "x") ? "translate(" + s.x + "," + s.y + ")" : "";
  }
  t.attr("transform", n), E(r, e).style("opacity", 1).attr("transform", n);
}
function ae(r, e) {
  var t = r.filter(function() {
    return !x(this).classed("update");
  });
  function n(a) {
    var s = e.node(a);
    return "translate(" + s.x + "," + s.y + ")";
  }
  t.attr("transform", n), E(r, e).style("opacity", 1).attr("transform", n);
}
function ct(r, e, t, n) {
  var a = r.x, s = r.y, i = a - n.x, o = s - n.y, c = Math.sqrt(e * e * o * o + t * t * i * i), d = Math.abs(e * t * i / c);
  n.x < a && (d = -d);
  var l = Math.abs(e * t * o / c);
  return n.y < s && (l = -l), { x: a + d, y: s + l };
}
function ne(r, e, t) {
  return ct(r, e, e, t);
}
function se(r, e, t, n) {
  var a, s, i, o, c, d, l, g, h, u, p, v, f, y, k;
  if (a = e.y - r.y, i = r.x - e.x, c = e.x * r.y - r.x * e.y, h = a * t.x + i * t.y + c, u = a * n.x + i * n.y + c, !(h !== 0 && u !== 0 && j(h, u)) && (s = n.y - t.y, o = t.x - n.x, d = n.x * t.y - t.x * n.y, l = s * r.x + o * r.y + d, g = s * e.x + o * e.y + d, !(l !== 0 && g !== 0 && j(l, g)) && (p = a * o - s * i, p !== 0)))
    return v = Math.abs(p / 2), f = i * d - o * c, y = f < 0 ? (f - v) / p : (f + v) / p, f = s * c - a * d, k = f < 0 ? (f - v) / p : (f + v) / p, { x: y, y: k };
}
function j(r, e) {
  return r * e > 0;
}
function T(r, e, t) {
  var n = r.x, a = r.y, s = [], i = Number.POSITIVE_INFINITY, o = Number.POSITIVE_INFINITY;
  e.forEach(function(p) {
    i = Math.min(i, p.x), o = Math.min(o, p.y);
  });
  for (var c = n - r.width / 2 - i, d = a - r.height / 2 - o, l = 0; l < e.length; l++) {
    var g = e[l], h = e[l < e.length - 1 ? l + 1 : 0], u = se(
      r,
      t,
      { x: c + g.x, y: d + g.y },
      { x: c + h.x, y: d + h.y }
    );
    u && s.push(u);
  }
  return s.length ? (s.length > 1 && s.sort(function(p, v) {
    var f = p.x - t.x, y = p.y - t.y, k = Math.sqrt(f * f + y * y), I = v.x - t.x, _ = v.y - t.y, W = Math.sqrt(I * I + _ * _);
    return k < W ? -1 : k === W ? 0 : 1;
  }), s[0]) : (console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", r), r);
}
function Z(r, e) {
  var t = r.x, n = r.y, a = e.x - t, s = e.y - n, i = r.width / 2, o = r.height / 2, c, d;
  return Math.abs(s) * i > Math.abs(a) * o ? (s < 0 && (o = -o), c = s === 0 ? 0 : o * a / s, d = o) : (a < 0 && (i = -i), c = i, d = a === 0 ? 0 : i * s / a), { x: t + c, y: n + d };
}
var K = {
  rect: oe,
  ellipse: le,
  circle: ce,
  diamond: de
};
function ie(r) {
  K = r;
}
function oe(r, e, t) {
  var n = r.insert("rect", ":first-child").attr("rx", t.rx).attr("ry", t.ry).attr("x", -e.width / 2).attr("y", -e.height / 2).attr("width", e.width).attr("height", e.height);
  return t.intersect = function(a) {
    return Z(t, a);
  }, n;
}
function le(r, e, t) {
  var n = e.width / 2, a = e.height / 2, s = r.insert("ellipse", ":first-child").attr("x", -e.width / 2).attr("y", -e.height / 2).attr("rx", n).attr("ry", a);
  return t.intersect = function(i) {
    return ct(t, n, a, i);
  }, s;
}
function ce(r, e, t) {
  var n = Math.max(e.width, e.height) / 2, a = r.insert("circle", ":first-child").attr("x", -e.width / 2).attr("y", -e.height / 2).attr("r", n);
  return t.intersect = function(s) {
    return ne(t, n, s);
  }, a;
}
function de(r, e, t) {
  var n = e.width * Math.SQRT2 / 2, a = e.height * Math.SQRT2 / 2, s = [
    { x: 0, y: -a },
    { x: -n, y: 0 },
    { x: 0, y: a },
    { x: n, y: 0 }
  ], i = r.insert("polygon", ":first-child").attr(
    "points",
    s.map(function(o) {
      return o.x + "," + o.y;
    }).join(" ")
  );
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function he() {
  var r = function(e, t) {
    pe(t);
    var n = D(e, "output"), a = D(n, "clusters"), s = D(n, "edgePaths"), i = F(D(n, "edgeLabels"), t), o = Q(D(n, "nodes"), t, K);
    Ct(t), ae(o, t), re(i, t), q(s, t, H);
    var c = X(a, t);
    ee(c, t), ge(t);
  };
  return r.createNodes = function(e) {
    return arguments.length ? (te(e), r) : Q;
  }, r.createClusters = function(e) {
    return arguments.length ? (Ft(e), r) : X;
  }, r.createEdgeLabels = function(e) {
    return arguments.length ? (qt(e), r) : F;
  }, r.createEdgePaths = function(e) {
    return arguments.length ? (Qt(e), r) : q;
  }, r.shapes = function(e) {
    return arguments.length ? (ie(e), r) : K;
  }, r.arrows = function(e) {
    return arguments.length ? (Wt(e), r) : H;
  }, r;
}
var ue = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: "rect"
}, fe = {
  arrowhead: "normal",
  curve: U
};
function pe(r) {
  r.nodes().forEach(function(e) {
    var t = r.node(e);
    !S(t, "label") && !r.children(e).length && (t.label = e), S(t, "paddingX") && M(t, {
      paddingLeft: t.paddingX,
      paddingRight: t.paddingX
    }), S(t, "paddingY") && M(t, {
      paddingTop: t.paddingY,
      paddingBottom: t.paddingY
    }), S(t, "padding") && M(t, {
      paddingLeft: t.padding,
      paddingRight: t.padding,
      paddingTop: t.padding,
      paddingBottom: t.padding
    }), M(t, ue), tt(["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"], function(n) {
      t[n] = Number(t[n]);
    }), S(t, "width") && (t._prevWidth = t.width), S(t, "height") && (t._prevHeight = t.height);
  }), r.edges().forEach(function(e) {
    var t = r.edge(e);
    S(t, "label") || (t.label = ""), M(t, fe);
  });
}
function ge(r) {
  tt(r.nodes(), function(e) {
    var t = r.node(e);
    S(t, "_prevWidth") ? t.width = t._prevWidth : delete t.width, S(t, "_prevHeight") ? t.height = t._prevHeight : delete t.height, delete t._prevWidth, delete t._prevHeight;
  });
}
function D(r, e) {
  var t = r.select("g." + e);
  return t.empty() && (t = r.append("g").attr("class", e)), t;
}
function dt(r, e, t) {
  const n = e.width, a = e.height, s = (n + a) * 0.9, i = [
    { x: s / 2, y: 0 },
    { x: s, y: -s / 2 },
    { x: s / 2, y: -s },
    { x: 0, y: -s / 2 }
  ], o = A(r, s, s, i);
  return t.intersect = function(c) {
    return T(t, i, c);
  }, o;
}
function ht(r, e, t) {
  const a = e.height, s = a / 4, i = e.width + 2 * s, o = [
    { x: s, y: 0 },
    { x: i - s, y: 0 },
    { x: i, y: -a / 2 },
    { x: i - s, y: -a },
    { x: s, y: -a },
    { x: 0, y: -a / 2 }
  ], c = A(r, i, a, o);
  return t.intersect = function(d) {
    return T(t, o, d);
  }, c;
}
function ut(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: -a / 2, y: 0 },
    { x: n, y: 0 },
    { x: n, y: -a },
    { x: -a / 2, y: -a },
    { x: 0, y: -a / 2 }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function ft(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: -2 * a / 6, y: 0 },
    { x: n - a / 6, y: 0 },
    { x: n + 2 * a / 6, y: -a },
    { x: a / 6, y: -a }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function pt(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: 2 * a / 6, y: 0 },
    { x: n + a / 6, y: 0 },
    { x: n - 2 * a / 6, y: -a },
    { x: -a / 6, y: -a }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function gt(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: -2 * a / 6, y: 0 },
    { x: n + 2 * a / 6, y: 0 },
    { x: n - a / 6, y: -a },
    { x: a / 6, y: -a }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function yt(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: a / 6, y: 0 },
    { x: n - a / 6, y: 0 },
    { x: n + 2 * a / 6, y: -a },
    { x: -2 * a / 6, y: -a }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function vt(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: 0, y: 0 },
    { x: n + a / 2, y: 0 },
    { x: n, y: -a / 2 },
    { x: n + a / 2, y: -a },
    { x: 0, y: -a }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function wt(r, e, t) {
  const n = e.height, a = e.width + n / 4, s = r.insert("rect", ":first-child").attr("rx", n / 2).attr("ry", n / 2).attr("x", -a / 2).attr("y", -n / 2).attr("width", a).attr("height", n);
  return t.intersect = function(i) {
    return Z(t, i);
  }, s;
}
function mt(r, e, t) {
  const n = e.width, a = e.height, s = [
    { x: 0, y: 0 },
    { x: n, y: 0 },
    { x: n, y: -a },
    { x: 0, y: -a },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: n + 8, y: 0 },
    { x: n + 8, y: -a },
    { x: -8, y: -a },
    { x: -8, y: 0 }
  ], i = A(r, n, a, s);
  return t.intersect = function(o) {
    return T(t, s, o);
  }, i;
}
function xt(r, e, t) {
  const n = e.width, a = n / 2, s = a / (2.5 + n / 50), i = e.height + s, o = "M 0," + s + " a " + a + "," + s + " 0,0,0 " + n + " 0 a " + a + "," + s + " 0,0,0 " + -n + " 0 l 0," + i + " a " + a + "," + s + " 0,0,0 " + n + " 0 l 0," + -i, c = r.attr("label-offset-y", s).insert("path", ":first-child").attr("d", o).attr("transform", "translate(" + -n / 2 + "," + -(i / 2 + s) + ")");
  return t.intersect = function(d) {
    const l = Z(t, d), g = l.x - t.x;
    if (a != 0 && (Math.abs(g) < t.width / 2 || Math.abs(g) == t.width / 2 && Math.abs(l.y - t.y) > t.height / 2 - s)) {
      let h = s * s * (1 - g * g / (a * a));
      h != 0 && (h = Math.sqrt(h)), h = s - h, d.y - t.y > 0 && (h = -h), l.y += h;
    }
    return l;
  }, c;
}
function ye(r) {
  r.shapes().question = dt, r.shapes().hexagon = ht, r.shapes().stadium = wt, r.shapes().subroutine = mt, r.shapes().cylinder = xt, r.shapes().rect_left_inv_arrow = ut, r.shapes().lean_right = ft, r.shapes().lean_left = pt, r.shapes().trapezoid = gt, r.shapes().inv_trapezoid = yt, r.shapes().rect_right_inv_arrow = vt;
}
function ve(r) {
  r({ question: dt }), r({ hexagon: ht }), r({ stadium: wt }), r({ subroutine: mt }), r({ cylinder: xt }), r({ rect_left_inv_arrow: ut }), r({ lean_right: ft }), r({ lean_left: pt }), r({ trapezoid: gt }), r({ inv_trapezoid: yt }), r({ rect_right_inv_arrow: vt });
}
function A(r, e, t, n) {
  return r.insert("polygon", ":first-child").attr(
    "points",
    n.map(function(a) {
      return a.x + "," + a.y;
    }).join(" ")
  ).attr("transform", "translate(" + -e / 2 + "," + t / 2 + ")");
}
const we = {
  addToRender: ye,
  addToRenderV2: ve
}, bt = {}, me = function(r) {
  const e = Object.keys(r);
  for (const t of e)
    bt[t] = r[t];
}, kt = async function(r, e, t, n, a, s) {
  const i = n ? n.select(`[id="${t}"]`) : x(`[id="${t}"]`), o = a || document, c = Object.keys(r);
  for (const d of c) {
    const l = r[d];
    let g = "default";
    l.classes.length > 0 && (g = l.classes.join(" "));
    const h = Y(l.styles);
    let u = l.text !== void 0 ? l.text : l.id, p;
    if (et(G().flowchart.htmlLabels)) {
      const y = {
        label: await rt(
          u.replace(
            /fa[blrs]?:fa-[\w-]+/g,
            // cspell:disable-line
            (k) => `<i class='${k.replace(":", " ")}'></i>`
          ),
          G()
        )
      };
      p = nt(i, y).node(), p.parentNode.removeChild(p);
    } else {
      const y = o.createElementNS("http://www.w3.org/2000/svg", "text");
      y.setAttribute("style", h.labelStyle.replace("color:", "fill:"));
      const k = u.split(at.lineBreakRegex);
      for (const I of k) {
        const _ = o.createElementNS("http://www.w3.org/2000/svg", "tspan");
        _.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), _.setAttribute("dy", "1em"), _.setAttribute("x", "1"), _.textContent = I, y.appendChild(_);
      }
      p = y;
    }
    let v = 0, f = "";
    switch (l.type) {
      case "round":
        v = 5, f = "rect";
        break;
      case "square":
        f = "rect";
        break;
      case "diamond":
        f = "question";
        break;
      case "hexagon":
        f = "hexagon";
        break;
      case "odd":
        f = "rect_left_inv_arrow";
        break;
      case "lean_right":
        f = "lean_right";
        break;
      case "lean_left":
        f = "lean_left";
        break;
      case "trapezoid":
        f = "trapezoid";
        break;
      case "inv_trapezoid":
        f = "inv_trapezoid";
        break;
      case "odd_right":
        f = "rect_left_inv_arrow";
        break;
      case "circle":
        f = "circle";
        break;
      case "ellipse":
        f = "ellipse";
        break;
      case "stadium":
        f = "stadium";
        break;
      case "subroutine":
        f = "subroutine";
        break;
      case "cylinder":
        f = "cylinder";
        break;
      case "group":
        f = "rect";
        break;
      default:
        f = "rect";
    }
    R.warn("Adding node", l.id, l.domId), e.setNode(s.db.lookUpDomId(l.id), {
      labelType: "svg",
      labelStyle: h.labelStyle,
      shape: f,
      label: p,
      rx: v,
      ry: v,
      class: g,
      style: h.style,
      id: s.db.lookUpDomId(l.id)
    });
  }
}, St = async function(r, e, t) {
  let n = 0, a, s;
  if (r.defaultStyle !== void 0) {
    const i = Y(r.defaultStyle);
    a = i.style, s = i.labelStyle;
  }
  for (const i of r) {
    n++;
    const o = "L-" + i.start + "-" + i.end, c = "LS-" + i.start, d = "LE-" + i.end, l = {};
    i.type === "arrow_open" ? l.arrowhead = "none" : l.arrowhead = "normal";
    let g = "", h = "";
    if (i.style !== void 0) {
      const u = Y(i.style);
      g = u.style, h = u.labelStyle;
    } else
      switch (i.stroke) {
        case "normal":
          g = "fill:none", a !== void 0 && (g = a), s !== void 0 && (h = s);
          break;
        case "dotted":
          g = "fill:none;stroke-width:2px;stroke-dasharray:3;";
          break;
        case "thick":
          g = " stroke-width: 3.5px;fill:none";
          break;
      }
    l.style = g, l.labelStyle = h, i.interpolate !== void 0 ? l.curve = z(i.interpolate, U) : r.defaultInterpolate !== void 0 ? l.curve = z(r.defaultInterpolate, U) : l.curve = z(bt.curve, U), i.text === void 0 ? i.style !== void 0 && (l.arrowheadStyle = "fill: #333") : (l.arrowheadStyle = "fill: #333", l.labelpos = "c", et(G().flowchart.htmlLabels) ? (l.labelType = "html", l.label = `<span id="L-${o}" class="edgeLabel L-${c}' L-${d}" style="${l.labelStyle}">${await rt(
      i.text.replace(
        /fa[blrs]?:fa-[\w-]+/g,
        // cspell:disable-line
        (u) => `<i class='${u.replace(":", " ")}'></i>`
      ),
      G()
    )}</span>`) : (l.labelType = "text", l.label = i.text.replace(at.lineBreakRegex, `
`), i.style === void 0 && (l.style = l.style || "stroke: #333; stroke-width: 1.5px;fill:none"), l.labelStyle = l.labelStyle.replace("color:", "fill:"))), l.id = o, l.class = c + " " + d, l.minlen = i.length || 1, e.setEdge(t.db.lookUpDomId(i.start), t.db.lookUpDomId(i.end), l, n);
  }
}, xe = function(r, e) {
  return R.info("Extracting classes"), e.db.getClasses();
}, be = async function(r, e, t, n) {
  R.info("Drawing flowchart");
  const { securityLevel: a, flowchart: s } = G();
  let i;
  a === "sandbox" && (i = x("#i" + e));
  const o = a === "sandbox" ? x(i.nodes()[0].contentDocument.body) : x("body"), c = a === "sandbox" ? i.nodes()[0].contentDocument : document;
  let d = n.db.getDirection();
  d === void 0 && (d = "TD");
  const l = s.nodeSpacing || 50, g = s.rankSpacing || 50, h = new _t({
    multigraph: !0,
    compound: !0
  }).setGraph({
    rankdir: d,
    nodesep: l,
    ranksep: g,
    marginx: 8,
    marginy: 8
  }).setDefaultEdgeLabel(function() {
    return {};
  });
  let u;
  const p = n.db.getSubGraphs();
  for (let w = p.length - 1; w >= 0; w--)
    u = p[w], n.db.addVertex(u.id, u.title, "group", void 0, u.classes);
  const v = n.db.getVertices();
  R.warn("Get vertices", v);
  const f = n.db.getEdges();
  let y = 0;
  for (y = p.length - 1; y >= 0; y--) {
    u = p[y], It("cluster").append("text");
    for (let w = 0; w < u.nodes.length; w++)
      R.warn(
        "Setting subgraph",
        u.nodes[w],
        n.db.lookUpDomId(u.nodes[w]),
        n.db.lookUpDomId(u.id)
      ), h.setParent(n.db.lookUpDomId(u.nodes[w]), n.db.lookUpDomId(u.id));
  }
  await kt(v, h, e, o, c, n), await St(f, h, n);
  const k = new he();
  we.addToRender(k), k.arrows().none = function(b, L, m, B) {
    const C = b.append("marker").attr("id", L).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M 0 0 L 0 0 L 0 0 z");
    N(C, m[B + "Style"]);
  }, k.arrows().normal = function(b, L) {
    b.append("marker").attr("id", L).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowheadPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  };
  const I = o.select(`[id="${e}"]`), _ = o.select("#" + e + " g");
  for (k(_, h), _.selectAll("g.node").attr("title", function() {
    return n.db.getTooltip(this.id);
  }), n.db.indexNodes("subGraph" + y), y = 0; y < p.length; y++)
    if (u = p[y], u.title !== "undefined") {
      const w = c.querySelectorAll(
        "#" + e + ' [id="' + n.db.lookUpDomId(u.id) + '"] rect'
      ), b = c.querySelectorAll(
        "#" + e + ' [id="' + n.db.lookUpDomId(u.id) + '"]'
      ), L = w[0].x.baseVal.value, m = w[0].y.baseVal.value, B = w[0].width.baseVal.value, C = x(b[0]).select(".label");
      C.attr("transform", `translate(${L + B / 2}, ${m + 14})`), C.attr("id", e + "Text");
      for (let $ = 0; $ < u.classes.length; $++)
        b[0].classList.add(u.classes[$]);
    }
  if (!s.htmlLabels) {
    const w = c.querySelectorAll('[id="' + e + '"] .edgeLabel .label');
    for (const b of w) {
      const L = b.getBBox(), m = c.createElementNS("http://www.w3.org/2000/svg", "rect");
      m.setAttribute("rx", 0), m.setAttribute("ry", 0), m.setAttribute("width", L.width), m.setAttribute("height", L.height), b.insertBefore(m, b.firstChild);
    }
  }
  Et(h, I, s.diagramPadding, s.useMaxWidth), Object.keys(v).forEach(function(w) {
    const b = v[w];
    if (b.link) {
      const L = o.select("#" + e + ' [id="' + n.db.lookUpDomId(w) + '"]');
      if (L) {
        const m = c.createElementNS("http://www.w3.org/2000/svg", "a");
        m.setAttributeNS("http://www.w3.org/2000/svg", "class", b.classes.join(" ")), m.setAttributeNS("http://www.w3.org/2000/svg", "href", b.link), m.setAttributeNS("http://www.w3.org/2000/svg", "rel", "noopener"), a === "sandbox" ? m.setAttributeNS("http://www.w3.org/2000/svg", "target", "_top") : b.linkTarget && m.setAttributeNS("http://www.w3.org/2000/svg", "target", b.linkTarget);
        const B = L.insert(function() {
          return m;
        }, ":first-child"), P = L.select(".label-container");
        P && B.append(function() {
          return P.node();
        });
        const C = L.select(".label");
        C && B.append(function() {
          return C.node();
        });
      }
    }
  });
}, ke = {
  setConf: me,
  addVertices: kt,
  addEdges: St,
  getClasses: xe,
  draw: be
}, Ge = {
  parser: Lt,
  db: V,
  renderer: Bt,
  styles: Mt,
  init: (r) => {
    r.flowchart || (r.flowchart = {}), r.flowchart.arrowMarkerAbsolute = r.arrowMarkerAbsolute, ke.setConf(r.flowchart), V.clear(), V.setGen("gen-1");
  }
};
export {
  Ge as diagram
};
