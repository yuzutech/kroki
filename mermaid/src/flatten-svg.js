// Rewrites a Mermaid SVG into "flat" SVG 1.1 that non-browser renderers
// (prawn-svg in asciidoctor-pdf, rsvg-convert, Batik, ...) can draw.
//
// Mermaid's style sheet relies on hsl() colors, descendant selectors and CSS
// variables, which those renderers ignore or render as black, so every
// computed paint/text style is inlined as a presentation attribute (colors as
// #rrggbb + *-opacity, lengths in px) and <style> is dropped. em-relative
// x/y/dx/dy on <text>/<tspan> become px (lines overlap otherwise), size-less
// placeholder <rect/>s are removed (prawn-svg warns on each), and any leftover
// <foreignObject> (HTML label) becomes a centered <text>.
//
// Runs inside the same Chromium page that rendered the diagram, so the values
// are exactly what the browser would have drawn. Enabled per request with the
// flatten-svg diagram option, or by default with KROKI_MERMAID_FLATTEN_SVG
// (see worker.js).

/**
 * @param {import('puppeteer').Page} page
 * @param {string} svg
 * @returns {Promise<string>}
 */
export async function flattenSvg(page, svg) {
  return await page.evaluate(svgSource => {
    const SVG_NS = 'http://www.w3.org/2000/svg'
    const PAINT_PROPS = ['fill', 'stroke']
    const PLAIN_PROPS = [
      'stroke-width',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'fill-rule'
    ]
    const TEXT_PROPS = ['font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor']
    const SHAPES = new Set(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'])
    const TEXTS = new Set(['text', 'tspan', 'textPath'])

    const host = document.createElement('div')
    host.innerHTML = svgSource
    document.body.appendChild(host)
    const root = host.querySelector('svg')
    try {
      const toHex = n => Number(n).toString(16).padStart(2, '0')
      // Returns [color, alpha] for a computed color, or null for none/transparent.
      const parseColor = value => {
        const m = value.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
        if (!m) return value === 'none' ? null : [value, 1]
        const alpha = m[4] === undefined ? 1 : Number(m[4])
        if (alpha === 0) return null
        return [`#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`, alpha]
      }
      const px = value => value.replace(/px$/, '')

      // Convert foreignObject (HTML) labels that htmlLabels=false did not cover.
      for (const fo of root.querySelectorAll('foreignObject')) {
        const lines = fo.innerText
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
        const html = fo.querySelector('*') || fo
        const cs = getComputedStyle(html)
        const w = Number(fo.getAttribute('width')) || 0
        const h = Number(fo.getAttribute('height')) || 0
        const fontSize = parseFloat(cs.fontSize) || 16
        const text = document.createElementNS(SVG_NS, 'text')
        text.setAttribute('text-anchor', 'middle')
        text.style.fill = cs.color
        text.style.fontFamily = cs.fontFamily
        text.style.fontSize = cs.fontSize
        text.style.fontWeight = cs.fontWeight
        const top = h / 2 - ((lines.length - 1) * fontSize * 1.2) / 2 + fontSize * 0.35
        lines.forEach((line, i) => {
          const tspan = document.createElementNS(SVG_NS, 'tspan')
          tspan.setAttribute('x', String(w / 2))
          tspan.setAttribute('y', String(top + i * fontSize * 1.2))
          tspan.textContent = line
          text.appendChild(tspan)
        })
        const g = document.createElementNS(SVG_NS, 'g')
        const x = fo.getAttribute('x') || 0
        const y = fo.getAttribute('y') || 0
        g.setAttribute('transform', `translate(${x}, ${y})`)
        g.appendChild(text)
        fo.replaceWith(g)
      }

      // Mermaid emits one <tspan> per word. prawn-svg anchors each tspan on
      // its own, stacking centered words on top of each other, so join runs
      // of identically-attributed tspans that don't start a new position.
      const startsChunk = el => ['x', 'y', 'dx', 'dy'].some(a => el.hasAttribute(a))
      const sameAttrs = (a, b) =>
        a.attributes.length === b.attributes.length &&
        [...a.attributes].every(attr => b.getAttribute(attr.name) === attr.value)
      for (const tspan of [...root.querySelectorAll('tspan')]) {
        const prev = tspan.previousElementSibling
        if (
          prev?.localName === 'tspan' &&
          prev.nextSibling === tspan &&
          !startsChunk(tspan) &&
          prev.children.length === 0 &&
          tspan.children.length === 0 &&
          sameAttrs(prev, tspan)
        ) {
          prev.textContent += tspan.textContent
          tspan.remove()
        }
      }

      for (const rect of root.querySelectorAll('rect')) {
        if (!rect.hasAttribute('width') || !rect.hasAttribute('height')) rect.remove()
      }

      // Resolve every style first, then write, so earlier writes can't
      // change what later elements inherit.
      const elements = [...root.querySelectorAll('*')].filter(
        el => el.namespaceURI === SVG_NS && el.localName !== 'style'
      )
      const resolved = elements.map(el => {
        const cs = getComputedStyle(el)
        const attrs = {}
        if (cs.display === 'none') attrs.display = 'none'
        if (cs.visibility === 'hidden') attrs.visibility = 'hidden'
        if (Number(cs.opacity) !== 1) attrs.opacity = cs.opacity
        const name = el.localName
        if (SHAPES.has(name) || TEXTS.has(name)) {
          for (const prop of PAINT_PROPS) {
            const color = parseColor(cs.getPropertyValue(prop))
            if (color === null) {
              attrs[prop] = 'none'
            } else {
              attrs[prop] = color[0]
              const alpha = color[1] * Number(cs.getPropertyValue(`${prop}-opacity`))
              if (alpha !== 1) attrs[`${prop}-opacity`] = String(alpha)
            }
          }
          for (const prop of PLAIN_PROPS) attrs[prop] = px(cs.getPropertyValue(prop))
        }
        if (TEXTS.has(name)) {
          for (const prop of TEXT_PROPS) attrs[prop] = px(cs.getPropertyValue(prop))
          // text-anchor only applies where a text chunk starts; prawn-svg
          // would otherwise re-anchor mid-line tspans.
          if (name === 'tspan' && !startsChunk(el)) attrs['text-anchor'] = ''
          const fontSize = parseFloat(cs.fontSize) || 16
          for (const attr of ['x', 'y', 'dx', 'dy']) {
            const v = el.getAttribute(attr)
            if (v && /em$/.test(v)) attrs[attr] = String(parseFloat(v) * fontSize)
          }
        }
        return [el, attrs]
      })
      for (const [el, attrs] of resolved) {
        for (const [k, v] of Object.entries(attrs)) {
          if (v === '') el.removeAttribute(k)
          else el.setAttribute(k, v)
        }
        el.removeAttribute('style')
      }
      for (const style of root.querySelectorAll('style')) style.remove()

      return new XMLSerializer().serializeToString(root)
    } finally {
      host.remove()
    }
  }, svg)
}
