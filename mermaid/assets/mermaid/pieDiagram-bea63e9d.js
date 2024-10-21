import { V as H, W as at, C as lt, D as ct, s as ot, g as ht, b as ut, a as yt, E as ft, d as pt, c as et, l as it, X as gt, U as dt, Y as mt, k as _t } from "./mermaid-1fcb8b31.js";
import { d as tt } from "./arc-d41f0391.js";
import { o as xt } from "./ordinal-5695958c.js";
import { a as kt } from "./array-2ff2c7a6.js";
import { c as F } from "./path-428ebac9.js";
import "./init-f9637058.js";
function vt(e, u) {
  return u < e ? -1 : u > e ? 1 : u >= e ? 0 : NaN;
}
function bt(e) {
  return e;
}
function St() {
  var e = bt, u = vt, E = null, p = F(0), g = F(H), A = F(0);
  function y(a) {
    var l, d = (a = kt(a)).length, m, I, $ = 0, _ = new Array(d), v = new Array(d), o = +p.apply(this, arguments), T = Math.min(H, Math.max(-H, g.apply(this, arguments) - o)), O, w = Math.min(Math.abs(T) / d, A.apply(this, arguments)), b = w * (T < 0 ? -1 : 1), t;
    for (l = 0; l < d; ++l)
      (t = v[_[l] = l] = +e(a[l], l, a)) > 0 && ($ += t);
    for (u != null ? _.sort(function(i, n) {
      return u(v[i], v[n]);
    }) : E != null && _.sort(function(i, n) {
      return E(a[i], a[n]);
    }), l = 0, I = $ ? (T - d * b) / $ : 0; l < d; ++l, o = O)
      m = _[l], t = v[m], O = o + (t > 0 ? t * I : 0) + b, v[m] = {
        data: a[m],
        index: l,
        value: t,
        startAngle: o,
        endAngle: O,
        padAngle: w
      };
    return v;
  }
  return y.value = function(a) {
    return arguments.length ? (e = typeof a == "function" ? a : F(+a), y) : e;
  }, y.sortValues = function(a) {
    return arguments.length ? (u = a, E = null, y) : u;
  }, y.sort = function(a) {
    return arguments.length ? (E = a, u = null, y) : E;
  }, y.startAngle = function(a) {
    return arguments.length ? (p = typeof a == "function" ? a : F(+a), y) : p;
  }, y.endAngle = function(a) {
    return arguments.length ? (g = typeof a == "function" ? a : F(+a), y) : g;
  }, y.padAngle = function(a) {
    return arguments.length ? (A = typeof a == "function" ? a : F(+a), y) : A;
  }, y;
}
var J = function() {
  var e = function(b, t, i, n) {
    for (i = i || {}, n = b.length; n--; i[b[n]] = t)
      ;
    return i;
  }, u = [1, 3], E = [1, 4], p = [1, 5], g = [1, 6], A = [1, 10, 12, 14, 16, 18, 19, 20, 21, 22], y = [2, 4], a = [1, 5, 10, 12, 14, 16, 18, 19, 20, 21, 22], l = [20, 21, 22], d = [2, 7], m = [1, 12], I = [1, 13], $ = [1, 14], _ = [1, 15], v = [1, 16], o = [1, 17], T = {
    trace: function() {
    },
    yy: {},
    symbols_: { error: 2, start: 3, eol: 4, PIE: 5, document: 6, showData: 7, line: 8, statement: 9, txt: 10, value: 11, title: 12, title_value: 13, acc_title: 14, acc_title_value: 15, acc_descr: 16, acc_descr_value: 17, acc_descr_multiline_value: 18, section: 19, NEWLINE: 20, ";": 21, EOF: 22, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 5: "PIE", 7: "showData", 10: "txt", 11: "value", 12: "title", 13: "title_value", 14: "acc_title", 15: "acc_title_value", 16: "acc_descr", 17: "acc_descr_value", 18: "acc_descr_multiline_value", 19: "section", 20: "NEWLINE", 21: ";", 22: "EOF" },
    productions_: [0, [3, 2], [3, 2], [3, 3], [6, 0], [6, 2], [8, 2], [9, 0], [9, 2], [9, 2], [9, 2], [9, 2], [9, 1], [9, 1], [4, 1], [4, 1], [4, 1]],
    performAction: function(t, i, n, r, c, s, V) {
      var x = s.length - 1;
      switch (c) {
        case 3:
          r.setShowData(!0);
          break;
        case 6:
          this.$ = s[x - 1];
          break;
        case 8:
          r.addSection(s[x - 1], r.cleanupValue(s[x]));
          break;
        case 9:
          this.$ = s[x].trim(), r.setDiagramTitle(this.$);
          break;
        case 10:
          this.$ = s[x].trim(), r.setAccTitle(this.$);
          break;
        case 11:
        case 12:
          this.$ = s[x].trim(), r.setAccDescription(this.$);
          break;
        case 13:
          r.addSection(s[x].substr(8)), this.$ = s[x].substr(8);
          break;
      }
    },
    table: [{ 3: 1, 4: 2, 5: u, 20: E, 21: p, 22: g }, { 1: [3] }, { 3: 7, 4: 2, 5: u, 20: E, 21: p, 22: g }, e(A, y, { 6: 8, 7: [1, 9] }), e(a, [2, 14]), e(a, [2, 15]), e(a, [2, 16]), { 1: [2, 1] }, e(l, d, { 8: 10, 9: 11, 1: [2, 2], 10: m, 12: I, 14: $, 16: _, 18: v, 19: o }), e(A, y, { 6: 18 }), e(A, [2, 5]), { 4: 19, 20: E, 21: p, 22: g }, { 11: [1, 20] }, { 13: [1, 21] }, { 15: [1, 22] }, { 17: [1, 23] }, e(l, [2, 12]), e(l, [2, 13]), e(l, d, { 8: 10, 9: 11, 1: [2, 3], 10: m, 12: I, 14: $, 16: _, 18: v, 19: o }), e(A, [2, 6]), e(l, [2, 8]), e(l, [2, 9]), e(l, [2, 10]), e(l, [2, 11])],
    defaultActions: { 7: [2, 1] },
    parseError: function(t, i) {
      if (i.recoverable)
        this.trace(t);
      else {
        var n = new Error(t);
        throw n.hash = i, n;
      }
    },
    parse: function(t) {
      var i = this, n = [0], r = [], c = [null], s = [], V = this.table, x = "", f = 0, P = 0, R = 2, M = 1, Y = s.slice.call(arguments, 1), h = Object.create(this.lexer), N = { yy: {} };
      for (var B in this.yy)
        Object.prototype.hasOwnProperty.call(this.yy, B) && (N.yy[B] = this.yy[B]);
      h.setInput(t, N.yy), N.yy.lexer = h, N.yy.parser = this, typeof h.yylloc > "u" && (h.yylloc = {});
      var X = h.yylloc;
      s.push(X);
      var st = h.options && h.options.ranges;
      typeof N.yy.parseError == "function" ? this.parseError = N.yy.parseError : this.parseError = Object.getPrototypeOf(this).parseError;
      function rt() {
        var C;
        return C = r.pop() || h.lex() || M, typeof C != "number" && (C instanceof Array && (r = C, C = r.pop()), C = i.symbols_[C] || C), C;
      }
      for (var k, L, S, Z, z = {}, W, D, Q, j; ; ) {
        if (L = n[n.length - 1], this.defaultActions[L] ? S = this.defaultActions[L] : ((k === null || typeof k > "u") && (k = rt()), S = V[L] && V[L][k]), typeof S > "u" || !S.length || !S[0]) {
          var q = "";
          j = [];
          for (W in V[L])
            this.terminals_[W] && W > R && j.push("'" + this.terminals_[W] + "'");
          h.showPosition ? q = "Parse error on line " + (f + 1) + `:
` + h.showPosition() + `
Expecting ` + j.join(", ") + ", got '" + (this.terminals_[k] || k) + "'" : q = "Parse error on line " + (f + 1) + ": Unexpected " + (k == M ? "end of input" : "'" + (this.terminals_[k] || k) + "'"), this.parseError(q, {
            text: h.match,
            token: this.terminals_[k] || k,
            line: h.yylineno,
            loc: X,
            expected: j
          });
        }
        if (S[0] instanceof Array && S.length > 1)
          throw new Error("Parse Error: multiple actions possible at state: " + L + ", token: " + k);
        switch (S[0]) {
          case 1:
            n.push(k), c.push(h.yytext), s.push(h.yylloc), n.push(S[1]), k = null, P = h.yyleng, x = h.yytext, f = h.yylineno, X = h.yylloc;
            break;
          case 2:
            if (D = this.productions_[S[1]][1], z.$ = c[c.length - D], z._$ = {
              first_line: s[s.length - (D || 1)].first_line,
              last_line: s[s.length - 1].last_line,
              first_column: s[s.length - (D || 1)].first_column,
              last_column: s[s.length - 1].last_column
            }, st && (z._$.range = [
              s[s.length - (D || 1)].range[0],
              s[s.length - 1].range[1]
            ]), Z = this.performAction.apply(z, [
              x,
              P,
              f,
              N.yy,
              S[1],
              c,
              s
            ].concat(Y)), typeof Z < "u")
              return Z;
            D && (n = n.slice(0, -1 * D * 2), c = c.slice(0, -1 * D), s = s.slice(0, -1 * D)), n.push(this.productions_[S[1]][0]), c.push(z.$), s.push(z._$), Q = V[n[n.length - 2]][n[n.length - 1]], n.push(Q);
            break;
          case 3:
            return !0;
        }
      }
      return !0;
    }
  }, O = function() {
    var b = {
      EOF: 1,
      parseError: function(i, n) {
        if (this.yy.parser)
          this.yy.parser.parseError(i, n);
        else
          throw new Error(i);
      },
      // resets the lexer, sets new input
      setInput: function(t, i) {
        return this.yy = i || this.yy || {}, this._input = t, this._more = this._backtrack = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this;
      },
      // consumes and returns one char from the input
      input: function() {
        var t = this._input[0];
        this.yytext += t, this.yyleng++, this.offset++, this.match += t, this.matched += t;
        var i = t.match(/(?:\r\n?|\n).*/g);
        return i ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), t;
      },
      // unshifts one char (or a string) into the input
      unput: function(t) {
        var i = t.length, n = t.split(/(?:\r\n?|\n)/g);
        this._input = t + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - i), this.offset -= i;
        var r = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), n.length - 1 && (this.yylineno -= n.length - 1);
        var c = this.yylloc.range;
        return this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: n ? (n.length === r.length ? this.yylloc.first_column : 0) + r[r.length - n.length].length - n[0].length : this.yylloc.first_column - i
        }, this.options.ranges && (this.yylloc.range = [c[0], c[0] + this.yyleng - i]), this.yyleng = this.yytext.length, this;
      },
      // When called from action, caches matched text and appends it on next action
      more: function() {
        return this._more = !0, this;
      },
      // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
      reject: function() {
        if (this.options.backtrack_lexer)
          this._backtrack = !0;
        else
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + `. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
` + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        return this;
      },
      // retain first n characters of the match
      less: function(t) {
        this.unput(this.match.slice(t));
      },
      // displays already matched input, i.e. for error messages
      pastInput: function() {
        var t = this.matched.substr(0, this.matched.length - this.match.length);
        return (t.length > 20 ? "..." : "") + t.substr(-20).replace(/\n/g, "");
      },
      // displays upcoming input, i.e. for error messages
      upcomingInput: function() {
        var t = this.match;
        return t.length < 20 && (t += this._input.substr(0, 20 - t.length)), (t.substr(0, 20) + (t.length > 20 ? "..." : "")).replace(/\n/g, "");
      },
      // displays the character position where the lexing error occurred, i.e. for error messages
      showPosition: function() {
        var t = this.pastInput(), i = new Array(t.length + 1).join("-");
        return t + this.upcomingInput() + `
` + i + "^";
      },
      // test the lexed token: return FALSE when not a match, otherwise return token
      test_match: function(t, i) {
        var n, r, c;
        if (this.options.backtrack_lexer && (c = {
          yylineno: this.yylineno,
          yylloc: {
            first_line: this.yylloc.first_line,
            last_line: this.last_line,
            first_column: this.yylloc.first_column,
            last_column: this.yylloc.last_column
          },
          yytext: this.yytext,
          match: this.match,
          matches: this.matches,
          matched: this.matched,
          yyleng: this.yyleng,
          offset: this.offset,
          _more: this._more,
          _input: this._input,
          yy: this.yy,
          conditionStack: this.conditionStack.slice(0),
          done: this.done
        }, this.options.ranges && (c.yylloc.range = this.yylloc.range.slice(0))), r = t[0].match(/(?:\r\n?|\n).*/g), r && (this.yylineno += r.length), this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: r ? r[r.length - 1].length - r[r.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + t[0].length
        }, this.yytext += t[0], this.match += t[0], this.matches = t, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._backtrack = !1, this._input = this._input.slice(t[0].length), this.matched += t[0], n = this.performAction.call(this, this.yy, this, i, this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), n)
          return n;
        if (this._backtrack) {
          for (var s in c)
            this[s] = c[s];
          return !1;
        }
        return !1;
      },
      // return next match in input
      next: function() {
        if (this.done)
          return this.EOF;
        this._input || (this.done = !0);
        var t, i, n, r;
        this._more || (this.yytext = "", this.match = "");
        for (var c = this._currentRules(), s = 0; s < c.length; s++)
          if (n = this._input.match(this.rules[c[s]]), n && (!i || n[0].length > i[0].length)) {
            if (i = n, r = s, this.options.backtrack_lexer) {
              if (t = this.test_match(n, c[s]), t !== !1)
                return t;
              if (this._backtrack) {
                i = !1;
                continue;
              } else
                return !1;
            } else if (!this.options.flex)
              break;
          }
        return i ? (t = this.test_match(i, c[r]), t !== !1 ? t : !1) : this._input === "" ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + `. Unrecognized text.
` + this.showPosition(), {
          text: "",
          token: null,
          line: this.yylineno
        });
      },
      // return next match that has a token
      lex: function() {
        var i = this.next();
        return i || this.lex();
      },
      // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
      begin: function(i) {
        this.conditionStack.push(i);
      },
      // pop the previously active lexer condition state off the condition stack
      popState: function() {
        var i = this.conditionStack.length - 1;
        return i > 0 ? this.conditionStack.pop() : this.conditionStack[0];
      },
      // produce the lexer rule set which is active for the currently active lexer condition state
      _currentRules: function() {
        return this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1] ? this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules : this.conditions.INITIAL.rules;
      },
      // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
      topState: function(i) {
        return i = this.conditionStack.length - 1 - Math.abs(i || 0), i >= 0 ? this.conditionStack[i] : "INITIAL";
      },
      // alias for begin(condition)
      pushState: function(i) {
        this.begin(i);
      },
      // return the number of states currently on the stack
      stateStackSize: function() {
        return this.conditionStack.length;
      },
      options: { "case-insensitive": !0 },
      performAction: function(i, n, r, c) {
        switch (r) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            return 20;
          case 3:
            break;
          case 4:
            break;
          case 5:
            return this.begin("title"), 12;
          case 6:
            return this.popState(), "title_value";
          case 7:
            return this.begin("acc_title"), 14;
          case 8:
            return this.popState(), "acc_title_value";
          case 9:
            return this.begin("acc_descr"), 16;
          case 10:
            return this.popState(), "acc_descr_value";
          case 11:
            this.begin("acc_descr_multiline");
            break;
          case 12:
            this.popState();
            break;
          case 13:
            return "acc_descr_multiline_value";
          case 14:
            this.begin("string");
            break;
          case 15:
            this.popState();
            break;
          case 16:
            return "txt";
          case 17:
            return 5;
          case 18:
            return 7;
          case 19:
            return "value";
          case 20:
            return 22;
        }
      },
      rules: [/^(?:%%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[\n\r]+)/i, /^(?:%%[^\n]*)/i, /^(?:[\s]+)/i, /^(?:title\b)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:pie\b)/i, /^(?:showData\b)/i, /^(?::[\s]*[\d]+(?:\.[\d]+)?)/i, /^(?:$)/i],
      conditions: { acc_descr_multiline: { rules: [12, 13], inclusive: !1 }, acc_descr: { rules: [10], inclusive: !1 }, acc_title: { rules: [8], inclusive: !1 }, title: { rules: [6], inclusive: !1 }, string: { rules: [15, 16], inclusive: !1 }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 7, 9, 11, 14, 17, 18, 19, 20], inclusive: !0 } }
    };
    return b;
  }();
  T.lexer = O;
  function w() {
    this.yy = {};
  }
  return w.prototype = T, T.Parser = w, new w();
}();
J.parser = J;
const Et = J, nt = at.pie, G = {
  sections: {},
  showData: !1,
  config: nt
};
let U = G.sections, K = G.showData;
const At = structuredClone(nt), wt = () => structuredClone(At), $t = () => {
  U = structuredClone(G.sections), K = G.showData, ft();
}, Tt = (e, u) => {
  e = pt(e, et()), U[e] === void 0 && (U[e] = u, it.debug(`added new section: ${e}, with value: ${u}`));
}, It = () => U, Dt = (e) => (e.substring(0, 1) === ":" && (e = e.substring(1).trim()), Number(e.trim())), Ct = (e) => {
  K = e;
}, Ot = () => K, Vt = {
  getConfig: wt,
  clear: $t,
  setDiagramTitle: lt,
  getDiagramTitle: ct,
  setAccTitle: ot,
  getAccTitle: ht,
  setAccDescription: ut,
  getAccDescription: yt,
  addSection: Tt,
  getSections: It,
  cleanupValue: Dt,
  setShowData: Ct,
  getShowData: Ot
}, Pt = (e) => `
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`, Nt = Pt, Lt = (e) => {
  const u = Object.entries(e).map((p) => ({
    label: p[0],
    value: p[1]
  })).sort((p, g) => g.value - p.value);
  return St().value(
    (p) => p.value
  )(u);
}, Ft = (e, u, E, p) => {
  it.debug(`rendering pie chart
` + e);
  const g = p.db, A = et(), y = gt(g.getConfig(), A.pie), a = 40, l = 18, d = 4, m = 450, I = m, $ = dt(u), _ = $.append("g"), v = g.getSections();
  _.attr("transform", "translate(" + I / 2 + "," + m / 2 + ")");
  const { themeVariables: o } = A;
  let [T] = mt(o.pieOuterStrokeWidth);
  T ?? (T = 2);
  const O = y.textPosition, w = Math.min(I, m) / 2 - a, b = tt().innerRadius(0).outerRadius(w), t = tt().innerRadius(w * O).outerRadius(w * O);
  _.append("circle").attr("cx", 0).attr("cy", 0).attr("r", w + T / 2).attr("class", "pieOuterCircle");
  const i = Lt(v), n = [
    o.pie1,
    o.pie2,
    o.pie3,
    o.pie4,
    o.pie5,
    o.pie6,
    o.pie7,
    o.pie8,
    o.pie9,
    o.pie10,
    o.pie11,
    o.pie12
  ], r = xt(n);
  _.selectAll("mySlices").data(i).enter().append("path").attr("d", b).attr("fill", (f) => r(f.data.label)).attr("class", "pieCircle");
  let c = 0;
  Object.keys(v).forEach((f) => {
    c += v[f];
  }), _.selectAll("mySlices").data(i).enter().append("text").text((f) => (f.data.value / c * 100).toFixed(0) + "%").attr("transform", (f) => "translate(" + t.centroid(f) + ")").style("text-anchor", "middle").attr("class", "slice"), _.append("text").text(g.getDiagramTitle()).attr("x", 0).attr("y", -(m - 50) / 2).attr("class", "pieTitleText");
  const s = _.selectAll(".legend").data(r.domain()).enter().append("g").attr("class", "legend").attr("transform", (f, P) => {
    const R = l + d, M = R * r.domain().length / 2, Y = 12 * l, h = P * R - M;
    return "translate(" + Y + "," + h + ")";
  });
  s.append("rect").attr("width", l).attr("height", l).style("fill", r).style("stroke", r), s.data(i).append("text").attr("x", l + d).attr("y", l - d).text((f) => {
    const { label: P, value: R } = f.data;
    return g.getShowData() ? `${P} [${R}]` : P;
  });
  const V = Math.max(
    ...s.selectAll("text").nodes().map((f) => (f == null ? void 0 : f.getBoundingClientRect().width) ?? 0)
  ), x = I + a + l + d + V;
  $.attr("viewBox", `0 0 ${x} ${m}`), _t($, m, x, y.useMaxWidth);
}, Rt = { draw: Ft }, Yt = {
  parser: Et,
  db: Vt,
  renderer: Rt,
  styles: Nt
};
export {
  Yt as diagram
};
