import { aR as o, e as i } from "./mermaid-d733041c.js";
const c = (s, t) => {
  const e = s.append("rect");
  if (e.attr("x", t.x), e.attr("y", t.y), e.attr("fill", t.fill), e.attr("stroke", t.stroke), e.attr("width", t.width), e.attr("height", t.height), t.rx !== void 0 && e.attr("rx", t.rx), t.ry !== void 0 && e.attr("ry", t.ry), t.attrs !== void 0)
    for (const r in t.attrs)
      e.attr(r, t.attrs[r]);
  return t.class !== void 0 && e.attr("class", t.class), e;
}, x = (s, t) => {
  const e = {
    x: t.startx,
    y: t.starty,
    width: t.stopx - t.startx,
    height: t.stopy - t.starty,
    fill: t.fill,
    stroke: t.stroke,
    class: "rect"
  };
  c(s, e).lower();
}, d = (s, t) => {
  const e = t.text.replace(o, " "), r = s.append("text");
  r.attr("x", t.x), r.attr("y", t.y), r.attr("class", "legend"), r.style("text-anchor", t.anchor), t.class !== void 0 && r.attr("class", t.class);
  const n = r.append("tspan");
  return n.attr("x", t.x + t.textMargin * 2), n.text(e), r;
}, h = (s, t, e, r) => {
  const n = s.append("image");
  n.attr("x", t), n.attr("y", e);
  const a = i(r);
  n.attr("xlink:href", a);
}, y = (s, t, e, r) => {
  const n = s.append("use");
  n.attr("x", t), n.attr("y", e);
  const a = i(r);
  n.attr("xlink:href", `#${a}`);
}, g = () => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  fill: "#EDF2AE",
  stroke: "#666",
  anchor: "start",
  rx: 0,
  ry: 0
}), p = () => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  "text-anchor": "start",
  style: "#666",
  textMargin: 0,
  rx: 0,
  ry: 0,
  tspan: !0
});
export {
  x as a,
  y as b,
  h as c,
  c as d,
  p as e,
  d as f,
  g
};
