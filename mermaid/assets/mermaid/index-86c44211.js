import { i as N, G as A } from "./graph-71d8872f.js";
import { m as J, l as H } from "./layout-8444cf3b.js";
import { c as V } from "./clone-e3dc8f2f.js";
import { c as L, g as D, i as p, a as U, b as W, d as _, u as q, s as z, e as K, f as Q, p as O, h as Y, j as Z } from "./edges-83606b8f.js";
import { l as s, c as T, p as S, j as R } from "./mermaid-1fcb8b31.js";
import { a as I } from "./createText-a0fe220c.js";
function m(e) {
  var t = {
    options: {
      directed: e.isDirected(),
      multigraph: e.isMultigraph(),
      compound: e.isCompound()
    },
    nodes: tt(e),
    edges: et(e)
  };
  return N(e.graph()) || (t.value = V(e.graph())), t;
}
function tt(e) {
  return J(e.nodes(), function(t) {
    var n = e.node(t), r = e.parent(t), i = { v: t };
    return N(n) || (i.value = n), N(r) || (i.parent = r), i;
  });
}
function et(e) {
  return J(e.edges(), function(t) {
    var n = e.edge(t), r = { v: t.v, w: t.w };
    return N(t.name) || (r.name = t.name), N(n) || (r.value = n), r;
  });
}
let l = {}, g = {}, P = {};
const nt = () => {
  g = {}, P = {}, l = {};
}, B = (e, t) => (s.trace("In isDescendant", t, " ", e, " = ", g[t].includes(e)), !!g[t].includes(e)), it = (e, t) => (s.info("Descendants of ", t, " is ", g[t]), s.info("Edge is ", e), e.v === t || e.w === t ? !1 : g[t] ? g[t].includes(e.v) || B(e.v, t) || B(e.w, t) || g[t].includes(e.w) : (s.debug("Tilt, ", t, ",not in descendants"), !1)), k = (e, t, n, r) => {
  s.warn(
    "Copying children of ",
    e,
    "root",
    r,
    "data",
    t.node(e),
    r
  );
  const i = t.children(e) || [];
  e !== r && i.push(e), s.warn("Copying (nodes) clusterId", e, "nodes", i), i.forEach((a) => {
    if (t.children(a).length > 0)
      k(a, t, n, r);
    else {
      const d = t.node(a);
      s.info("cp ", a, " to ", r, " with parent ", e), n.setNode(a, d), r !== t.parent(a) && (s.warn("Setting parent", a, t.parent(a)), n.setParent(a, t.parent(a))), e !== r && a !== e ? (s.debug("Setting parent", a, e), n.setParent(a, e)) : (s.info("In copy ", e, "root", r, "data", t.node(e), r), s.debug(
        "Not Setting parent for node=",
        a,
        "cluster!==rootId",
        e !== r,
        "node!==clusterId",
        a !== e
      ));
      const u = t.edges(a);
      s.debug("Copying Edges", u), u.forEach((f) => {
        s.info("Edge", f);
        const h = t.edge(f.v, f.w, f.name);
        s.info("Edge data", h, r);
        try {
          it(f, r) ? (s.info("Copying as ", f.v, f.w, h, f.name), n.setEdge(f.v, f.w, h, f.name), s.info("newGraph edges ", n.edges(), n.edge(n.edges()[0]))) : s.info(
            "Skipping copy of edge ",
            f.v,
            "-->",
            f.w,
            " rootId: ",
            r,
            " clusterId:",
            e
          );
        } catch (w) {
          s.error(w);
        }
      });
    }
    s.debug("Removing node", a), t.removeNode(a);
  });
}, $ = (e, t) => {
  const n = t.children(e);
  let r = [...n];
  for (const i of n)
    P[i] = e, r = [...r, ...$(i, t)];
  return r;
}, C = (e, t) => {
  s.trace("Searching", e);
  const n = t.children(e);
  if (s.trace("Searching children of id ", e, n), n.length < 1)
    return s.trace("This is a valid node", e), e;
  for (const r of n) {
    const i = C(r, t);
    if (i)
      return s.trace("Found replacement for", e, " => ", i), i;
  }
}, X = (e) => !l[e] || !l[e].externalConnections ? e : l[e] ? l[e].id : e, st = (e, t) => {
  if (!e || t > 10) {
    s.debug("Opting out, no graph ");
    return;
  } else
    s.debug("Opting in, graph ");
  e.nodes().forEach(function(n) {
    e.children(n).length > 0 && (s.warn(
      "Cluster identified",
      n,
      " Replacement id in edges: ",
      C(n, e)
    ), g[n] = $(n, e), l[n] = { id: C(n, e), clusterData: e.node(n) });
  }), e.nodes().forEach(function(n) {
    const r = e.children(n), i = e.edges();
    r.length > 0 ? (s.debug("Cluster identified", n, g), i.forEach((a) => {
      if (a.v !== n && a.w !== n) {
        const d = B(a.v, n), u = B(a.w, n);
        d ^ u && (s.warn("Edge: ", a, " leaves cluster ", n), s.warn("Descendants of XXX ", n, ": ", g[n]), l[n].externalConnections = !0);
      }
    })) : s.debug("Not a cluster ", n, g);
  });
  for (let n of Object.keys(l)) {
    const r = l[n].id, i = e.parent(r);
    i !== n && l[i] && !l[i].externalConnections && (l[n].id = i);
  }
  e.edges().forEach(function(n) {
    const r = e.edge(n);
    s.warn("Edge " + n.v + " -> " + n.w + ": " + JSON.stringify(n)), s.warn("Edge " + n.v + " -> " + n.w + ": " + JSON.stringify(e.edge(n)));
    let i = n.v, a = n.w;
    if (s.warn(
      "Fix XXX",
      l,
      "ids:",
      n.v,
      n.w,
      "Translating: ",
      l[n.v],
      " --- ",
      l[n.w]
    ), l[n.v] && l[n.w] && l[n.v] === l[n.w]) {
      s.warn("Fixing and trixing link to self - removing XXX", n.v, n.w, n.name), s.warn("Fixing and trixing - removing XXX", n.v, n.w, n.name), i = X(n.v), a = X(n.w), e.removeEdge(n.v, n.w, n.name);
      const d = n.w + "---" + n.v;
      e.setNode(d, {
        domId: d,
        id: d,
        labelStyle: "",
        labelText: r.label,
        padding: 0,
        shape: "labelRect",
        style: ""
      });
      const u = structuredClone(r), f = structuredClone(r);
      u.label = "", u.arrowTypeEnd = "none", f.label = "", u.fromCluster = n.v, f.toCluster = n.v, e.setEdge(i, d, u, n.name + "-cyclic-special"), e.setEdge(d, a, f, n.name + "-cyclic-special");
    } else if (l[n.v] || l[n.w]) {
      if (s.warn("Fixing and trixing - removing XXX", n.v, n.w, n.name), i = X(n.v), a = X(n.w), e.removeEdge(n.v, n.w, n.name), i !== n.v) {
        const d = e.parent(i);
        l[d].externalConnections = !0, r.fromCluster = n.v;
      }
      if (a !== n.w) {
        const d = e.parent(a);
        l[d].externalConnections = !0, r.toCluster = n.w;
      }
      s.warn("Fix Replacing with XXX", i, a, n.name), e.setEdge(i, a, r, n.name);
    }
  }), s.warn("Adjusted Graph", m(e)), F(e, 0), s.trace(l);
}, F = (e, t) => {
  if (s.warn("extractor - ", t, m(e), e.children("D")), t > 10) {
    s.error("Bailing out");
    return;
  }
  let n = e.nodes(), r = !1;
  for (const i of n) {
    const a = e.children(i);
    r = r || a.length > 0;
  }
  if (!r) {
    s.debug("Done, no node has children", e.nodes());
    return;
  }
  s.debug("Nodes = ", n, t);
  for (const i of n)
    if (s.debug(
      "Extracting node",
      i,
      l,
      l[i] && !l[i].externalConnections,
      !e.parent(i),
      e.node(i),
      e.children("D"),
      " Depth ",
      t
    ), !l[i])
      s.debug("Not a cluster", i, t);
    else if (!l[i].externalConnections && // !graph.parent(node) &&
    e.children(i) && e.children(i).length > 0) {
      s.warn(
        "Cluster without external connections, without a parent and with children",
        i,
        t
      );
      let d = e.graph().rankdir === "TB" ? "LR" : "TB";
      l[i] && l[i].clusterData && l[i].clusterData.dir && (d = l[i].clusterData.dir, s.warn("Fixing dir", l[i].clusterData.dir, d));
      const u = new A({
        multigraph: !0,
        compound: !0
      }).setGraph({
        rankdir: d,
        // Todo: set proper spacing
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8
      }).setDefaultEdgeLabel(function() {
        return {};
      });
      s.warn("Old graph before copy", m(e)), k(i, e, u, i), e.setNode(i, {
        clusterNode: !0,
        id: i,
        clusterData: l[i].clusterData,
        labelText: l[i].labelText,
        graph: u
      }), s.warn("New graph after copy node: (", i, ")", m(u)), s.debug("Old graph after copy", m(e));
    } else
      s.warn(
        "Cluster ** ",
        i,
        " **not meeting the criteria !externalConnections:",
        !l[i].externalConnections,
        " no parent: ",
        !e.parent(i),
        " children ",
        e.children(i) && e.children(i).length > 0,
        e.children("D"),
        t
      ), s.debug(l);
  n = e.nodes(), s.warn("New list of nodes", n);
  for (const i of n) {
    const a = e.node(i);
    s.warn(" Now next level", i, a), a.clusterNode && F(a.graph, t + 1);
  }
}, G = (e, t) => {
  if (t.length === 0)
    return [];
  let n = Object.assign(t);
  return t.forEach((r) => {
    const i = e.children(r), a = G(e, i);
    n = [...n, ...a];
  }), n;
}, rt = (e) => G(e, e.children()), at = (e, t) => {
  s.info("Creating subgraph rect for ", t.id, t);
  const n = T(), r = e.insert("g").attr("class", "cluster" + (t.class ? " " + t.class : "")).attr("id", t.id), i = r.insert("rect", ":first-child"), a = S(n.flowchart.htmlLabels), d = r.insert("g").attr("class", "cluster-label"), u = t.labelType === "markdown" ? I(d, t.labelText, { style: t.labelStyle, useHtmlLabels: a }) : d.node().appendChild(L(t.labelText, t.labelStyle, void 0, !0));
  let f = u.getBBox();
  if (S(n.flowchart.htmlLabels)) {
    const c = u.children[0], o = R(u);
    f = c.getBoundingClientRect(), o.attr("width", f.width), o.attr("height", f.height);
  }
  const h = 0 * t.padding, w = h / 2, x = t.width <= f.width + h ? f.width + h : t.width;
  t.width <= f.width + h ? t.diff = (f.width - t.width) / 2 - t.padding / 2 : t.diff = -t.padding / 2, s.trace("Data ", t, JSON.stringify(t)), i.attr("style", t.style).attr("rx", t.rx).attr("ry", t.ry).attr("x", t.x - x / 2).attr("y", t.y - t.height / 2 - w).attr("width", x).attr("height", t.height + h);
  const { subGraphTitleTopMargin: v } = D(n);
  a ? d.attr(
    "transform",
    // This puts the label on top of the box instead of inside it
    `translate(${t.x - f.width / 2}, ${t.y - t.height / 2 + v})`
  ) : d.attr(
    "transform",
    // This puts the label on top of the box instead of inside it
    `translate(${t.x}, ${t.y - t.height / 2 + v})`
  );
  const y = i.node().getBBox();
  return t.width = y.width, t.height = y.height, t.intersect = function(c) {
    return p(t, c);
  }, r;
}, ct = (e, t) => {
  const n = e.insert("g").attr("class", "note-cluster").attr("id", t.id), r = n.insert("rect", ":first-child"), i = 0 * t.padding, a = i / 2;
  r.attr("rx", t.rx).attr("ry", t.ry).attr("x", t.x - t.width / 2 - a).attr("y", t.y - t.height / 2 - a).attr("width", t.width + i).attr("height", t.height + i).attr("fill", "none");
  const d = r.node().getBBox();
  return t.width = d.width, t.height = d.height, t.intersect = function(u) {
    return p(t, u);
  }, n;
}, ot = (e, t) => {
  const n = T(), r = e.insert("g").attr("class", t.classes).attr("id", t.id), i = r.insert("rect", ":first-child"), a = r.insert("g").attr("class", "cluster-label"), d = r.append("rect"), u = a.node().appendChild(L(t.labelText, t.labelStyle, void 0, !0));
  let f = u.getBBox();
  if (S(n.flowchart.htmlLabels)) {
    const c = u.children[0], o = R(u);
    f = c.getBoundingClientRect(), o.attr("width", f.width), o.attr("height", f.height);
  }
  f = u.getBBox();
  const h = 0 * t.padding, w = h / 2, x = t.width <= f.width + t.padding ? f.width + t.padding : t.width;
  t.width <= f.width + t.padding ? t.diff = (f.width + t.padding * 0 - t.width) / 2 : t.diff = -t.padding / 2, i.attr("class", "outer").attr("x", t.x - x / 2 - w).attr("y", t.y - t.height / 2 - w).attr("width", x + h).attr("height", t.height + h), d.attr("class", "inner").attr("x", t.x - x / 2 - w).attr("y", t.y - t.height / 2 - w + f.height - 1).attr("width", x + h).attr("height", t.height + h - f.height - 3);
  const { subGraphTitleTopMargin: v } = D(n);
  a.attr(
    "transform",
    `translate(${t.x - f.width / 2}, ${t.y - t.height / 2 - t.padding / 3 + (S(n.flowchart.htmlLabels) ? 5 : 3) + v})`
  );
  const y = i.node().getBBox();
  return t.height = y.height, t.intersect = function(c) {
    return p(t, c);
  }, r;
}, lt = (e, t) => {
  const n = e.insert("g").attr("class", t.classes).attr("id", t.id), r = n.insert("rect", ":first-child"), i = 0 * t.padding, a = i / 2;
  r.attr("class", "divider").attr("x", t.x - t.width / 2 - a).attr("y", t.y - t.height / 2).attr("width", t.width + i).attr("height", t.height + i);
  const d = r.node().getBBox();
  return t.width = d.width, t.height = d.height, t.diff = -t.padding / 2, t.intersect = function(u) {
    return p(t, u);
  }, n;
}, ft = { rect: at, roundedWithTitle: ot, noteGroup: ct, divider: lt };
let j = {};
const dt = (e, t) => {
  s.trace("Inserting cluster");
  const n = t.shape || "rect";
  j[t.id] = ft[n](e, t);
}, ut = () => {
  j = {};
}, M = async (e, t, n, r, i, a) => {
  s.info("Graph in recursive render: XXX", m(t), i);
  const d = t.graph().rankdir;
  s.trace("Dir in recursive render - dir:", d);
  const u = e.insert("g").attr("class", "root");
  t.nodes() ? s.info("Recursive render XXX", t.nodes()) : s.info("No nodes found for", t), t.edges().length > 0 && s.trace("Recursive edges", t.edge(t.edges()[0]));
  const f = u.insert("g").attr("class", "clusters"), h = u.insert("g").attr("class", "edgePaths"), w = u.insert("g").attr("class", "edgeLabels"), x = u.insert("g").attr("class", "nodes");
  await Promise.all(
    t.nodes().map(async function(c) {
      const o = t.node(c);
      if (i !== void 0) {
        const b = JSON.parse(JSON.stringify(i.clusterData));
        s.info("Setting data for cluster XXX (", c, ") ", b, i), t.setNode(i.id, b), t.parent(c) || (s.trace("Setting parent", c, i.id), t.setParent(c, i.id, b));
      }
      if (s.info("(Insert) Node XXX" + c + ": " + JSON.stringify(t.node(c))), o && o.clusterNode) {
        s.info("Cluster identified", c, o.width, t.node(c));
        const b = await M(
          x,
          o.graph,
          n,
          r,
          t.node(c),
          a
        ), E = b.elem;
        q(o, E), o.diff = b.diff || 0, s.info("Node bounds (abc123)", c, o, o.width, o.x, o.y), z(E, o), s.warn("Recursive render complete ", E, o);
      } else
        t.children(c).length > 0 ? (s.info("Cluster - the non recursive path XXX", c, o.id, o, t), s.info(C(o.id, t)), l[o.id] = { id: C(o.id, t), node: o }) : (s.info("Node - the non recursive path", c, o.id, o), await K(x, t.node(c), d));
    })
  ), t.edges().forEach(function(c) {
    const o = t.edge(c.v, c.w, c.name);
    s.info("Edge " + c.v + " -> " + c.w + ": " + JSON.stringify(c)), s.info("Edge " + c.v + " -> " + c.w + ": ", c, " ", JSON.stringify(t.edge(c))), s.info("Fix", l, "ids:", c.v, c.w, "Translating: ", l[c.v], l[c.w]), Q(w, o);
  }), t.edges().forEach(function(c) {
    s.info("Edge " + c.v + " -> " + c.w + ": " + JSON.stringify(c));
  }), s.info("#############################################"), s.info("###                Layout                 ###"), s.info("#############################################"), s.info(t), H(t), s.info("Graph after layout:", m(t));
  let v = 0;
  const { subGraphTitleTotalMargin: y } = D(a);
  return rt(t).forEach(function(c) {
    const o = t.node(c);
    s.info("Position " + c + ": " + JSON.stringify(t.node(c))), s.info(
      "Position " + c + ": (" + o.x,
      "," + o.y,
      ") width: ",
      o.width,
      " height: ",
      o.height
    ), o && o.clusterNode ? (o.y += y, O(o)) : t.children(c).length > 0 ? (o.height += y, dt(f, o), l[o.id].node = o) : (o.y += y / 2, O(o));
  }), t.edges().forEach(function(c) {
    const o = t.edge(c);
    s.info("Edge " + c.v + " -> " + c.w + ": " + JSON.stringify(o), o), o.points.forEach((E) => E.y += y / 2);
    const b = Y(h, c, o, l, n, t, r);
    Z(o, b);
  }), t.nodes().forEach(function(c) {
    const o = t.node(c);
    s.info(c, o.type, o.diff), o.type === "group" && (v = o.diff);
  }), { elem: u, diff: v };
}, bt = async (e, t, n, r, i) => {
  U(e, n, r, i), W(), _(), ut(), nt(), s.warn("Graph at first:", JSON.stringify(m(t))), st(t), s.warn("Graph after:", JSON.stringify(m(t)));
  const a = T();
  await M(e, t, r, i, void 0, a);
};
export {
  bt as r
};
