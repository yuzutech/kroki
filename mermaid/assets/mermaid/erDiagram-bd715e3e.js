import { c as V, s as xt, g as Rt, b as Ot, a as bt, z as Nt, A as Tt, m as At, l as et, B as Mt, j as st, x as vt, k as Dt, D as wt, E as It } from "./mermaid-8ea29a40.js";
import { G as St, l as Lt } from "./layout-3ecfba7d.js";
import { l as Bt } from "./line-130fa1e5.js";
import "./array-2ff2c7a6.js";
import "./constant-2fe7eae5.js";
var ct = function() {
  var t = function(M, a, l, d) {
    for (l = l || {}, d = M.length; d--; l[M[d]] = a)
      ;
    return l;
  }, r = [1, 2], e = [1, 5], n = [6, 9, 11, 23, 25, 27, 29, 30, 31, 52], s = [1, 17], p = [1, 18], f = [1, 19], o = [1, 20], c = [1, 21], _ = [1, 22], E = [1, 25], g = [1, 30], O = [1, 31], y = [1, 32], A = [1, 33], Y = [1, 34], U = [6, 9, 11, 15, 20, 23, 25, 27, 29, 30, 31, 44, 45, 46, 47, 48, 52], X = [1, 46], I = [30, 31, 49, 50], N = [4, 6, 9, 11, 23, 25, 27, 29, 30, 31, 52], v = [44, 45, 46, 47, 48], k = [22, 37], x = [1, 66], P = [1, 65], Z = [22, 37, 39, 41], w = {
    trace: function() {
    },
    yy: {},
    symbols_: { error: 2, start: 3, ER_DIAGRAM: 4, document: 5, EOF: 6, directive: 7, line: 8, SPACE: 9, statement: 10, NEWLINE: 11, openDirective: 12, typeDirective: 13, closeDirective: 14, ":": 15, argDirective: 16, entityName: 17, relSpec: 18, role: 19, BLOCK_START: 20, attributes: 21, BLOCK_STOP: 22, title: 23, title_value: 24, acc_title: 25, acc_title_value: 26, acc_descr: 27, acc_descr_value: 28, acc_descr_multiline_value: 29, ALPHANUM: 30, ENTITY_NAME: 31, attribute: 32, attributeType: 33, attributeName: 34, attributeKeyTypeList: 35, attributeComment: 36, ATTRIBUTE_WORD: 37, attributeKeyType: 38, COMMA: 39, ATTRIBUTE_KEY: 40, COMMENT: 41, cardinality: 42, relType: 43, ZERO_OR_ONE: 44, ZERO_OR_MORE: 45, ONE_OR_MORE: 46, ONLY_ONE: 47, MD_PARENT: 48, NON_IDENTIFYING: 49, IDENTIFYING: 50, WORD: 51, open_directive: 52, type_directive: 53, arg_directive: 54, close_directive: 55, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "ER_DIAGRAM", 6: "EOF", 9: "SPACE", 11: "NEWLINE", 15: ":", 20: "BLOCK_START", 22: "BLOCK_STOP", 23: "title", 24: "title_value", 25: "acc_title", 26: "acc_title_value", 27: "acc_descr", 28: "acc_descr_value", 29: "acc_descr_multiline_value", 30: "ALPHANUM", 31: "ENTITY_NAME", 37: "ATTRIBUTE_WORD", 39: "COMMA", 40: "ATTRIBUTE_KEY", 41: "COMMENT", 44: "ZERO_OR_ONE", 45: "ZERO_OR_MORE", 46: "ONE_OR_MORE", 47: "ONLY_ONE", 48: "MD_PARENT", 49: "NON_IDENTIFYING", 50: "IDENTIFYING", 51: "WORD", 52: "open_directive", 53: "type_directive", 54: "arg_directive", 55: "close_directive" },
    productions_: [0, [3, 3], [3, 2], [5, 0], [5, 2], [8, 2], [8, 1], [8, 1], [8, 1], [7, 4], [7, 6], [10, 1], [10, 5], [10, 4], [10, 3], [10, 1], [10, 2], [10, 2], [10, 2], [10, 1], [17, 1], [17, 1], [21, 1], [21, 2], [32, 2], [32, 3], [32, 3], [32, 4], [33, 1], [34, 1], [35, 1], [35, 3], [38, 1], [36, 1], [18, 3], [42, 1], [42, 1], [42, 1], [42, 1], [42, 1], [43, 1], [43, 1], [19, 1], [19, 1], [19, 1], [12, 1], [13, 1], [16, 1], [14, 1]],
    performAction: function(a, l, d, u, m, i, Q) {
      var h = i.length - 1;
      switch (m) {
        case 1:
          break;
        case 3:
          this.$ = [];
          break;
        case 4:
          i[h - 1].push(i[h]), this.$ = i[h - 1];
          break;
        case 5:
        case 6:
          this.$ = i[h];
          break;
        case 7:
        case 8:
          this.$ = [];
          break;
        case 12:
          u.addEntity(i[h - 4]), u.addEntity(i[h - 2]), u.addRelationship(i[h - 4], i[h], i[h - 2], i[h - 3]);
          break;
        case 13:
          u.addEntity(i[h - 3]), u.addAttributes(i[h - 3], i[h - 1]);
          break;
        case 14:
          u.addEntity(i[h - 2]);
          break;
        case 15:
          u.addEntity(i[h]);
          break;
        case 16:
        case 17:
          this.$ = i[h].trim(), u.setAccTitle(this.$);
          break;
        case 18:
        case 19:
          this.$ = i[h].trim(), u.setAccDescription(this.$);
          break;
        case 20:
        case 44:
          this.$ = i[h];
          break;
        case 21:
        case 42:
        case 43:
          this.$ = i[h].replace(/"/g, "");
          break;
        case 22:
        case 30:
          this.$ = [i[h]];
          break;
        case 23:
          i[h].push(i[h - 1]), this.$ = i[h];
          break;
        case 24:
          this.$ = { attributeType: i[h - 1], attributeName: i[h] };
          break;
        case 25:
          this.$ = { attributeType: i[h - 2], attributeName: i[h - 1], attributeKeyTypeList: i[h] };
          break;
        case 26:
          this.$ = { attributeType: i[h - 2], attributeName: i[h - 1], attributeComment: i[h] };
          break;
        case 27:
          this.$ = { attributeType: i[h - 3], attributeName: i[h - 2], attributeKeyTypeList: i[h - 1], attributeComment: i[h] };
          break;
        case 28:
        case 29:
        case 32:
          this.$ = i[h];
          break;
        case 31:
          i[h - 2].push(i[h]), this.$ = i[h - 2];
          break;
        case 33:
          this.$ = i[h].replace(/"/g, "");
          break;
        case 34:
          this.$ = { cardA: i[h], relType: i[h - 1], cardB: i[h - 2] };
          break;
        case 35:
          this.$ = u.Cardinality.ZERO_OR_ONE;
          break;
        case 36:
          this.$ = u.Cardinality.ZERO_OR_MORE;
          break;
        case 37:
          this.$ = u.Cardinality.ONE_OR_MORE;
          break;
        case 38:
          this.$ = u.Cardinality.ONLY_ONE;
          break;
        case 39:
          this.$ = u.Cardinality.MD_PARENT;
          break;
        case 40:
          this.$ = u.Identification.NON_IDENTIFYING;
          break;
        case 41:
          this.$ = u.Identification.IDENTIFYING;
          break;
        case 45:
          u.parseDirective("%%{", "open_directive");
          break;
        case 46:
          u.parseDirective(i[h], "type_directive");
          break;
        case 47:
          i[h] = i[h].trim().replace(/'/g, '"'), u.parseDirective(i[h], "arg_directive");
          break;
        case 48:
          u.parseDirective("}%%", "close_directive", "er");
          break;
      }
    },
    table: [{ 3: 1, 4: r, 7: 3, 12: 4, 52: e }, { 1: [3] }, t(n, [2, 3], { 5: 6 }), { 3: 7, 4: r, 7: 3, 12: 4, 52: e }, { 13: 8, 53: [1, 9] }, { 53: [2, 45] }, { 6: [1, 10], 7: 15, 8: 11, 9: [1, 12], 10: 13, 11: [1, 14], 12: 4, 17: 16, 23: s, 25: p, 27: f, 29: o, 30: c, 31: _, 52: e }, { 1: [2, 2] }, { 14: 23, 15: [1, 24], 55: E }, t([15, 55], [2, 46]), t(n, [2, 8], { 1: [2, 1] }), t(n, [2, 4]), { 7: 15, 10: 26, 12: 4, 17: 16, 23: s, 25: p, 27: f, 29: o, 30: c, 31: _, 52: e }, t(n, [2, 6]), t(n, [2, 7]), t(n, [2, 11]), t(n, [2, 15], { 18: 27, 42: 29, 20: [1, 28], 44: g, 45: O, 46: y, 47: A, 48: Y }), { 24: [1, 35] }, { 26: [1, 36] }, { 28: [1, 37] }, t(n, [2, 19]), t(U, [2, 20]), t(U, [2, 21]), { 11: [1, 38] }, { 16: 39, 54: [1, 40] }, { 11: [2, 48] }, t(n, [2, 5]), { 17: 41, 30: c, 31: _ }, { 21: 42, 22: [1, 43], 32: 44, 33: 45, 37: X }, { 43: 47, 49: [1, 48], 50: [1, 49] }, t(I, [2, 35]), t(I, [2, 36]), t(I, [2, 37]), t(I, [2, 38]), t(I, [2, 39]), t(n, [2, 16]), t(n, [2, 17]), t(n, [2, 18]), t(N, [2, 9]), { 14: 50, 55: E }, { 55: [2, 47] }, { 15: [1, 51] }, { 22: [1, 52] }, t(n, [2, 14]), { 21: 53, 22: [2, 22], 32: 44, 33: 45, 37: X }, { 34: 54, 37: [1, 55] }, { 37: [2, 28] }, { 42: 56, 44: g, 45: O, 46: y, 47: A, 48: Y }, t(v, [2, 40]), t(v, [2, 41]), { 11: [1, 57] }, { 19: 58, 30: [1, 61], 31: [1, 60], 51: [1, 59] }, t(n, [2, 13]), { 22: [2, 23] }, t(k, [2, 24], { 35: 62, 36: 63, 38: 64, 40: x, 41: P }), t([22, 37, 40, 41], [2, 29]), t([30, 31], [2, 34]), t(N, [2, 10]), t(n, [2, 12]), t(n, [2, 42]), t(n, [2, 43]), t(n, [2, 44]), t(k, [2, 25], { 36: 67, 39: [1, 68], 41: P }), t(k, [2, 26]), t(Z, [2, 30]), t(k, [2, 33]), t(Z, [2, 32]), t(k, [2, 27]), { 38: 69, 40: x }, t(Z, [2, 31])],
    defaultActions: { 5: [2, 45], 7: [2, 2], 25: [2, 48], 40: [2, 47], 46: [2, 28], 53: [2, 23] },
    parseError: function(a, l) {
      if (l.recoverable)
        this.trace(a);
      else {
        var d = new Error(a);
        throw d.hash = l, d;
      }
    },
    parse: function(a) {
      var l = this, d = [0], u = [], m = [null], i = [], Q = this.table, h = "", J = 0, ht = 0, Et = 2, dt = 1, mt = i.slice.call(arguments, 1), b = Object.create(this.lexer), H = { yy: {} };
      for (var rt in this.yy)
        Object.prototype.hasOwnProperty.call(this.yy, rt) && (H.yy[rt] = this.yy[rt]);
      b.setInput(a, H.yy), H.yy.lexer = b, H.yy.parser = this, typeof b.yylloc > "u" && (b.yylloc = {});
      var it = b.yylloc;
      i.push(it);
      var gt = b.options && b.options.ranges;
      typeof H.yy.parseError == "function" ? this.parseError = H.yy.parseError : this.parseError = Object.getPrototypeOf(this).parseError;
      function kt() {
        var W;
        return W = u.pop() || b.lex() || dt, typeof W != "number" && (W instanceof Array && (u = W, W = u.pop()), W = l.symbols_[W] || W), W;
      }
      for (var D, G, L, at, K = {}, $, F, ut, tt; ; ) {
        if (G = d[d.length - 1], this.defaultActions[G] ? L = this.defaultActions[G] : ((D === null || typeof D > "u") && (D = kt()), L = Q[G] && Q[G][D]), typeof L > "u" || !L.length || !L[0]) {
          var nt = "";
          tt = [];
          for ($ in Q[G])
            this.terminals_[$] && $ > Et && tt.push("'" + this.terminals_[$] + "'");
          b.showPosition ? nt = "Parse error on line " + (J + 1) + `:
` + b.showPosition() + `
Expecting ` + tt.join(", ") + ", got '" + (this.terminals_[D] || D) + "'" : nt = "Parse error on line " + (J + 1) + ": Unexpected " + (D == dt ? "end of input" : "'" + (this.terminals_[D] || D) + "'"), this.parseError(nt, {
            text: b.match,
            token: this.terminals_[D] || D,
            line: b.yylineno,
            loc: it,
            expected: tt
          });
        }
        if (L[0] instanceof Array && L.length > 1)
          throw new Error("Parse Error: multiple actions possible at state: " + G + ", token: " + D);
        switch (L[0]) {
          case 1:
            d.push(D), m.push(b.yytext), i.push(b.yylloc), d.push(L[1]), D = null, ht = b.yyleng, h = b.yytext, J = b.yylineno, it = b.yylloc;
            break;
          case 2:
            if (F = this.productions_[L[1]][1], K.$ = m[m.length - F], K._$ = {
              first_line: i[i.length - (F || 1)].first_line,
              last_line: i[i.length - 1].last_line,
              first_column: i[i.length - (F || 1)].first_column,
              last_column: i[i.length - 1].last_column
            }, gt && (K._$.range = [
              i[i.length - (F || 1)].range[0],
              i[i.length - 1].range[1]
            ]), at = this.performAction.apply(K, [
              h,
              ht,
              J,
              H.yy,
              L[1],
              m,
              i
            ].concat(mt)), typeof at < "u")
              return at;
            F && (d = d.slice(0, -1 * F * 2), m = m.slice(0, -1 * F), i = i.slice(0, -1 * F)), d.push(this.productions_[L[1]][0]), m.push(K.$), i.push(K._$), ut = Q[d[d.length - 2]][d[d.length - 1]], d.push(ut);
            break;
          case 3:
            return !0;
        }
      }
      return !0;
    }
  }, z = function() {
    var M = {
      EOF: 1,
      parseError: function(l, d) {
        if (this.yy.parser)
          this.yy.parser.parseError(l, d);
        else
          throw new Error(l);
      },
      // resets the lexer, sets new input
      setInput: function(a, l) {
        return this.yy = l || this.yy || {}, this._input = a, this._more = this._backtrack = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this;
      },
      // consumes and returns one char from the input
      input: function() {
        var a = this._input[0];
        this.yytext += a, this.yyleng++, this.offset++, this.match += a, this.matched += a;
        var l = a.match(/(?:\r\n?|\n).*/g);
        return l ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), a;
      },
      // unshifts one char (or a string) into the input
      unput: function(a) {
        var l = a.length, d = a.split(/(?:\r\n?|\n)/g);
        this._input = a + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - l), this.offset -= l;
        var u = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), d.length - 1 && (this.yylineno -= d.length - 1);
        var m = this.yylloc.range;
        return this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: d ? (d.length === u.length ? this.yylloc.first_column : 0) + u[u.length - d.length].length - d[0].length : this.yylloc.first_column - l
        }, this.options.ranges && (this.yylloc.range = [m[0], m[0] + this.yyleng - l]), this.yyleng = this.yytext.length, this;
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
      less: function(a) {
        this.unput(this.match.slice(a));
      },
      // displays already matched input, i.e. for error messages
      pastInput: function() {
        var a = this.matched.substr(0, this.matched.length - this.match.length);
        return (a.length > 20 ? "..." : "") + a.substr(-20).replace(/\n/g, "");
      },
      // displays upcoming input, i.e. for error messages
      upcomingInput: function() {
        var a = this.match;
        return a.length < 20 && (a += this._input.substr(0, 20 - a.length)), (a.substr(0, 20) + (a.length > 20 ? "..." : "")).replace(/\n/g, "");
      },
      // displays the character position where the lexing error occurred, i.e. for error messages
      showPosition: function() {
        var a = this.pastInput(), l = new Array(a.length + 1).join("-");
        return a + this.upcomingInput() + `
` + l + "^";
      },
      // test the lexed token: return FALSE when not a match, otherwise return token
      test_match: function(a, l) {
        var d, u, m;
        if (this.options.backtrack_lexer && (m = {
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
        }, this.options.ranges && (m.yylloc.range = this.yylloc.range.slice(0))), u = a[0].match(/(?:\r\n?|\n).*/g), u && (this.yylineno += u.length), this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: u ? u[u.length - 1].length - u[u.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + a[0].length
        }, this.yytext += a[0], this.match += a[0], this.matches = a, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._backtrack = !1, this._input = this._input.slice(a[0].length), this.matched += a[0], d = this.performAction.call(this, this.yy, this, l, this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), d)
          return d;
        if (this._backtrack) {
          for (var i in m)
            this[i] = m[i];
          return !1;
        }
        return !1;
      },
      // return next match in input
      next: function() {
        if (this.done)
          return this.EOF;
        this._input || (this.done = !0);
        var a, l, d, u;
        this._more || (this.yytext = "", this.match = "");
        for (var m = this._currentRules(), i = 0; i < m.length; i++)
          if (d = this._input.match(this.rules[m[i]]), d && (!l || d[0].length > l[0].length)) {
            if (l = d, u = i, this.options.backtrack_lexer) {
              if (a = this.test_match(d, m[i]), a !== !1)
                return a;
              if (this._backtrack) {
                l = !1;
                continue;
              } else
                return !1;
            } else if (!this.options.flex)
              break;
          }
        return l ? (a = this.test_match(l, m[u]), a !== !1 ? a : !1) : this._input === "" ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + `. Unrecognized text.
` + this.showPosition(), {
          text: "",
          token: null,
          line: this.yylineno
        });
      },
      // return next match that has a token
      lex: function() {
        var l = this.next();
        return l || this.lex();
      },
      // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
      begin: function(l) {
        this.conditionStack.push(l);
      },
      // pop the previously active lexer condition state off the condition stack
      popState: function() {
        var l = this.conditionStack.length - 1;
        return l > 0 ? this.conditionStack.pop() : this.conditionStack[0];
      },
      // produce the lexer rule set which is active for the currently active lexer condition state
      _currentRules: function() {
        return this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1] ? this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules : this.conditions.INITIAL.rules;
      },
      // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
      topState: function(l) {
        return l = this.conditionStack.length - 1 - Math.abs(l || 0), l >= 0 ? this.conditionStack[l] : "INITIAL";
      },
      // alias for begin(condition)
      pushState: function(l) {
        this.begin(l);
      },
      // return the number of states currently on the stack
      stateStackSize: function() {
        return this.conditionStack.length;
      },
      options: { "case-insensitive": !0 },
      performAction: function(l, d, u, m) {
        switch (u) {
          case 0:
            return this.begin("acc_title"), 25;
          case 1:
            return this.popState(), "acc_title_value";
          case 2:
            return this.begin("acc_descr"), 27;
          case 3:
            return this.popState(), "acc_descr_value";
          case 4:
            this.begin("acc_descr_multiline");
            break;
          case 5:
            this.popState();
            break;
          case 6:
            return "acc_descr_multiline_value";
          case 7:
            return this.begin("open_directive"), 52;
          case 8:
            return this.begin("type_directive"), 53;
          case 9:
            return this.popState(), this.begin("arg_directive"), 15;
          case 10:
            return this.popState(), this.popState(), 55;
          case 11:
            return 54;
          case 12:
            return 11;
          case 13:
            break;
          case 14:
            return 9;
          case 15:
            return 31;
          case 16:
            return 51;
          case 17:
            return 4;
          case 18:
            return this.begin("block"), 20;
          case 19:
            return 39;
          case 20:
            break;
          case 21:
            return 40;
          case 22:
            return 37;
          case 23:
            return 37;
          case 24:
            return 41;
          case 25:
            break;
          case 26:
            return this.popState(), 22;
          case 27:
            return d.yytext[0];
          case 28:
            return 44;
          case 29:
            return 46;
          case 30:
            return 46;
          case 31:
            return 46;
          case 32:
            return 44;
          case 33:
            return 44;
          case 34:
            return 45;
          case 35:
            return 45;
          case 36:
            return 45;
          case 37:
            return 45;
          case 38:
            return 45;
          case 39:
            return 46;
          case 40:
            return 45;
          case 41:
            return 46;
          case 42:
            return 47;
          case 43:
            return 47;
          case 44:
            return 47;
          case 45:
            return 47;
          case 46:
            return 44;
          case 47:
            return 45;
          case 48:
            return 46;
          case 49:
            return 48;
          case 50:
            return 49;
          case 51:
            return 50;
          case 52:
            return 50;
          case 53:
            return 49;
          case 54:
            return 49;
          case 55:
            return 49;
          case 56:
            return 30;
          case 57:
            return d.yytext[0];
          case 58:
            return 6;
        }
      },
      rules: [/^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:%%\{)/i, /^(?:((?:(?!\}%%)[^:.])*))/i, /^(?::)/i, /^(?:\}%%)/i, /^(?:((?:(?!\}%%).|\n)*))/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:[\s]+)/i, /^(?:"[^"%\r\n\v\b\\]+")/i, /^(?:"[^"]*")/i, /^(?:erDiagram\b)/i, /^(?:\{)/i, /^(?:,)/i, /^(?:\s+)/i, /^(?:\b((?:PK)|(?:FK)|(?:UK))\b)/i, /^(?:(.*?)[~](.*?)*[~])/i, /^(?:[A-Za-z_][A-Za-z0-9\-_\[\]\(\)]*)/i, /^(?:"[^"]*")/i, /^(?:[\n]+)/i, /^(?:\})/i, /^(?:.)/i, /^(?:one or zero\b)/i, /^(?:one or more\b)/i, /^(?:one or many\b)/i, /^(?:1\+)/i, /^(?:\|o\b)/i, /^(?:zero or one\b)/i, /^(?:zero or more\b)/i, /^(?:zero or many\b)/i, /^(?:0\+)/i, /^(?:\}o\b)/i, /^(?:many\(0\))/i, /^(?:many\(1\))/i, /^(?:many\b)/i, /^(?:\}\|)/i, /^(?:one\b)/i, /^(?:only one\b)/i, /^(?:1\b)/i, /^(?:\|\|)/i, /^(?:o\|)/i, /^(?:o\{)/i, /^(?:\|\{)/i, /^(?:\s*u\b)/i, /^(?:\.\.)/i, /^(?:--)/i, /^(?:to\b)/i, /^(?:optionally to\b)/i, /^(?:\.-)/i, /^(?:-\.)/i, /^(?:[A-Za-z][A-Za-z0-9\-_]*)/i, /^(?:.)/i, /^(?:$)/i],
      conditions: { acc_descr_multiline: { rules: [5, 6], inclusive: !1 }, acc_descr: { rules: [3], inclusive: !1 }, acc_title: { rules: [1], inclusive: !1 }, open_directive: { rules: [8], inclusive: !1 }, type_directive: { rules: [9, 10], inclusive: !1 }, arg_directive: { rules: [10, 11], inclusive: !1 }, block: { rules: [19, 20, 21, 22, 23, 24, 25, 26, 27], inclusive: !1 }, INITIAL: { rules: [0, 2, 4, 7, 12, 13, 14, 15, 16, 17, 18, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], inclusive: !0 } }
    };
    return M;
  }();
  w.lexer = z;
  function S() {
    this.yy = {};
  }
  return S.prototype = w, w.Parser = S, new S();
}();
ct.parser = ct;
const Ct = ct;
let j = {}, lt = [];
const Pt = {
  ZERO_OR_ONE: "ZERO_OR_ONE",
  ZERO_OR_MORE: "ZERO_OR_MORE",
  ONE_OR_MORE: "ONE_OR_MORE",
  ONLY_ONE: "ONLY_ONE",
  MD_PARENT: "MD_PARENT"
}, Yt = {
  NON_IDENTIFYING: "NON_IDENTIFYING",
  IDENTIFYING: "IDENTIFYING"
}, Zt = function(t, r, e) {
  At.parseDirective(this, t, r, e);
}, pt = function(t) {
  return j[t] === void 0 && (j[t] = { attributes: [] }, et.info("Added new entity :", t)), j[t];
}, Ft = () => j, Wt = function(t, r) {
  let e = pt(t), n;
  for (n = r.length - 1; n >= 0; n--)
    e.attributes.push(r[n]), et.debug("Added attribute ", r[n].attributeName);
}, Vt = function(t, r, e, n) {
  let s = {
    entityA: t,
    roleA: r,
    entityB: e,
    relSpec: n
  };
  lt.push(s), et.debug("Added new relationship :", s);
}, Ut = () => lt, zt = function() {
  j = {}, lt = [], Mt();
}, Ht = {
  Cardinality: Pt,
  Identification: Yt,
  parseDirective: Zt,
  getConfig: () => V().er,
  addEntity: pt,
  addAttributes: Wt,
  getEntities: Ft,
  addRelationship: Vt,
  getRelationships: Ut,
  clear: zt,
  setAccTitle: xt,
  getAccTitle: Rt,
  setAccDescription: Ot,
  getAccDescription: bt,
  setDiagramTitle: Nt,
  getDiagramTitle: Tt
}, B = {
  ONLY_ONE_START: "ONLY_ONE_START",
  ONLY_ONE_END: "ONLY_ONE_END",
  ZERO_OR_ONE_START: "ZERO_OR_ONE_START",
  ZERO_OR_ONE_END: "ZERO_OR_ONE_END",
  ONE_OR_MORE_START: "ONE_OR_MORE_START",
  ONE_OR_MORE_END: "ONE_OR_MORE_END",
  ZERO_OR_MORE_START: "ZERO_OR_MORE_START",
  ZERO_OR_MORE_END: "ZERO_OR_MORE_END",
  MD_PARENT_END: "MD_PARENT_END",
  MD_PARENT_START: "MD_PARENT_START"
}, Gt = function(t, r) {
  let e;
  t.append("defs").append("marker").attr("id", B.MD_PARENT_START).attr("refX", 0).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), t.append("defs").append("marker").attr("id", B.MD_PARENT_END).attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), t.append("defs").append("marker").attr("id", B.ONLY_ONE_START).attr("refX", 0).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M9,0 L9,18 M15,0 L15,18"), t.append("defs").append("marker").attr("id", B.ONLY_ONE_END).attr("refX", 18).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M3,0 L3,18 M9,0 L9,18"), e = t.append("defs").append("marker").attr("id", B.ZERO_OR_ONE_START).attr("refX", 0).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto"), e.append("circle").attr("stroke", r.stroke).attr("fill", "white").attr("cx", 21).attr("cy", 9).attr("r", 6), e.append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M9,0 L9,18"), e = t.append("defs").append("marker").attr("id", B.ZERO_OR_ONE_END).attr("refX", 30).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto"), e.append("circle").attr("stroke", r.stroke).attr("fill", "white").attr("cx", 9).attr("cy", 9).attr("r", 6), e.append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M21,0 L21,18"), t.append("defs").append("marker").attr("id", B.ONE_OR_MORE_START).attr("refX", 18).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27"), t.append("defs").append("marker").attr("id", B.ONE_OR_MORE_END).attr("refX", 27).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18"), e = t.append("defs").append("marker").attr("id", B.ZERO_OR_MORE_START).attr("refX", 18).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto"), e.append("circle").attr("stroke", r.stroke).attr("fill", "white").attr("cx", 48).attr("cy", 18).attr("r", 6), e.append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M0,18 Q18,0 36,18 Q18,36 0,18"), e = t.append("defs").append("marker").attr("id", B.ZERO_OR_MORE_END).attr("refX", 39).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto"), e.append("circle").attr("stroke", r.stroke).attr("fill", "white").attr("cx", 9).attr("cy", 18).attr("r", 6), e.append("path").attr("stroke", r.stroke).attr("fill", "none").attr("d", "M21,18 Q39,0 57,18 Q39,36 21,18");
}, C = {
  ERMarkers: B,
  insertMarkers: Gt
}, Kt = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function Xt(t) {
  return typeof t == "string" && Kt.test(t);
}
const T = [];
for (let t = 0; t < 256; ++t)
  T.push((t + 256).toString(16).slice(1));
function Qt(t, r = 0) {
  return (T[t[r + 0]] + T[t[r + 1]] + T[t[r + 2]] + T[t[r + 3]] + "-" + T[t[r + 4]] + T[t[r + 5]] + "-" + T[t[r + 6]] + T[t[r + 7]] + "-" + T[t[r + 8]] + T[t[r + 9]] + "-" + T[t[r + 10]] + T[t[r + 11]] + T[t[r + 12]] + T[t[r + 13]] + T[t[r + 14]] + T[t[r + 15]]).toLowerCase();
}
function jt(t) {
  if (!Xt(t))
    throw TypeError("Invalid UUID");
  let r;
  const e = new Uint8Array(16);
  return e[0] = (r = parseInt(t.slice(0, 8), 16)) >>> 24, e[1] = r >>> 16 & 255, e[2] = r >>> 8 & 255, e[3] = r & 255, e[4] = (r = parseInt(t.slice(9, 13), 16)) >>> 8, e[5] = r & 255, e[6] = (r = parseInt(t.slice(14, 18), 16)) >>> 8, e[7] = r & 255, e[8] = (r = parseInt(t.slice(19, 23), 16)) >>> 8, e[9] = r & 255, e[10] = (r = parseInt(t.slice(24, 36), 16)) / 1099511627776 & 255, e[11] = r / 4294967296 & 255, e[12] = r >>> 24 & 255, e[13] = r >>> 16 & 255, e[14] = r >>> 8 & 255, e[15] = r & 255, e;
}
function qt(t) {
  t = unescape(encodeURIComponent(t));
  const r = [];
  for (let e = 0; e < t.length; ++e)
    r.push(t.charCodeAt(e));
  return r;
}
const Jt = "6ba7b810-9dad-11d1-80b4-00c04fd430c8", $t = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function te(t, r, e) {
  function n(s, p, f, o) {
    var c;
    if (typeof s == "string" && (s = qt(s)), typeof p == "string" && (p = jt(p)), ((c = p) === null || c === void 0 ? void 0 : c.length) !== 16)
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    let _ = new Uint8Array(16 + s.length);
    if (_.set(p), _.set(s, p.length), _ = e(_), _[6] = _[6] & 15 | r, _[8] = _[8] & 63 | 128, f) {
      o = o || 0;
      for (let E = 0; E < 16; ++E)
        f[o + E] = _[E];
      return f;
    }
    return Qt(_);
  }
  try {
    n.name = t;
  } catch {
  }
  return n.DNS = Jt, n.URL = $t, n;
}
function ee(t, r, e, n) {
  switch (t) {
    case 0:
      return r & e ^ ~r & n;
    case 1:
      return r ^ e ^ n;
    case 2:
      return r & e ^ r & n ^ e & n;
    case 3:
      return r ^ e ^ n;
  }
}
function ot(t, r) {
  return t << r | t >>> 32 - r;
}
function re(t) {
  const r = [1518500249, 1859775393, 2400959708, 3395469782], e = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof t == "string") {
    const f = unescape(encodeURIComponent(t));
    t = [];
    for (let o = 0; o < f.length; ++o)
      t.push(f.charCodeAt(o));
  } else
    Array.isArray(t) || (t = Array.prototype.slice.call(t));
  t.push(128);
  const n = t.length / 4 + 2, s = Math.ceil(n / 16), p = new Array(s);
  for (let f = 0; f < s; ++f) {
    const o = new Uint32Array(16);
    for (let c = 0; c < 16; ++c)
      o[c] = t[f * 64 + c * 4] << 24 | t[f * 64 + c * 4 + 1] << 16 | t[f * 64 + c * 4 + 2] << 8 | t[f * 64 + c * 4 + 3];
    p[f] = o;
  }
  p[s - 1][14] = (t.length - 1) * 8 / Math.pow(2, 32), p[s - 1][14] = Math.floor(p[s - 1][14]), p[s - 1][15] = (t.length - 1) * 8 & 4294967295;
  for (let f = 0; f < s; ++f) {
    const o = new Uint32Array(80);
    for (let y = 0; y < 16; ++y)
      o[y] = p[f][y];
    for (let y = 16; y < 80; ++y)
      o[y] = ot(o[y - 3] ^ o[y - 8] ^ o[y - 14] ^ o[y - 16], 1);
    let c = e[0], _ = e[1], E = e[2], g = e[3], O = e[4];
    for (let y = 0; y < 80; ++y) {
      const A = Math.floor(y / 20), Y = ot(c, 5) + ee(A, _, E, g) + O + r[A] + o[y] >>> 0;
      O = g, g = E, E = ot(_, 30) >>> 0, _ = c, c = Y;
    }
    e[0] = e[0] + c >>> 0, e[1] = e[1] + _ >>> 0, e[2] = e[2] + E >>> 0, e[3] = e[3] + g >>> 0, e[4] = e[4] + O >>> 0;
  }
  return [e[0] >> 24 & 255, e[0] >> 16 & 255, e[0] >> 8 & 255, e[0] & 255, e[1] >> 24 & 255, e[1] >> 16 & 255, e[1] >> 8 & 255, e[1] & 255, e[2] >> 24 & 255, e[2] >> 16 & 255, e[2] >> 8 & 255, e[2] & 255, e[3] >> 24 & 255, e[3] >> 16 & 255, e[3] >> 8 & 255, e[3] & 255, e[4] >> 24 & 255, e[4] >> 16 & 255, e[4] >> 8 & 255, e[4] & 255];
}
const ie = te("v5", 80, re), ae = ie, ne = /[^\dA-Za-z](\W)*/g;
let R = {}, q = /* @__PURE__ */ new Map();
const se = function(t) {
  const r = Object.keys(t);
  for (const e of r)
    R[e] = t[e];
}, oe = (t, r, e) => {
  const n = R.entityPadding / 3, s = R.entityPadding / 3, p = R.fontSize * 0.85, f = r.node().getBBox(), o = [];
  let c = !1, _ = !1, E = 0, g = 0, O = 0, y = 0, A = f.height + n * 2, Y = 1;
  e.forEach((N) => {
    N.attributeKeyTypeList !== void 0 && N.attributeKeyTypeList.length > 0 && (c = !0), N.attributeComment !== void 0 && (_ = !0);
  }), e.forEach((N) => {
    const v = `${r.node().id}-attr-${Y}`;
    let k = 0;
    const x = It(N.attributeType), P = t.append("text").classed("er entityLabel", !0).attr("id", `${v}-type`).attr("x", 0).attr("y", 0).style("dominant-baseline", "middle").style("text-anchor", "left").style("font-family", V().fontFamily).style("font-size", p + "px").text(x), Z = t.append("text").classed("er entityLabel", !0).attr("id", `${v}-name`).attr("x", 0).attr("y", 0).style("dominant-baseline", "middle").style("text-anchor", "left").style("font-family", V().fontFamily).style("font-size", p + "px").text(N.attributeName), w = {};
    w.tn = P, w.nn = Z;
    const z = P.node().getBBox(), S = Z.node().getBBox();
    if (E = Math.max(E, z.width), g = Math.max(g, S.width), k = Math.max(z.height, S.height), c) {
      const M = N.attributeKeyTypeList !== void 0 ? N.attributeKeyTypeList.join(",") : "", a = t.append("text").classed("er entityLabel", !0).attr("id", `${v}-key`).attr("x", 0).attr("y", 0).style("dominant-baseline", "middle").style("text-anchor", "left").style("font-family", V().fontFamily).style("font-size", p + "px").text(M);
      w.kn = a;
      const l = a.node().getBBox();
      O = Math.max(O, l.width), k = Math.max(k, l.height);
    }
    if (_) {
      const M = t.append("text").classed("er entityLabel", !0).attr("id", `${v}-comment`).attr("x", 0).attr("y", 0).style("dominant-baseline", "middle").style("text-anchor", "left").style("font-family", V().fontFamily).style("font-size", p + "px").text(N.attributeComment || "");
      w.cn = M;
      const a = M.node().getBBox();
      y = Math.max(y, a.width), k = Math.max(k, a.height);
    }
    w.height = k, o.push(w), A += k + n * 2, Y += 1;
  });
  let U = 4;
  c && (U += 2), _ && (U += 2);
  const X = E + g + O + y, I = {
    width: Math.max(
      R.minEntityWidth,
      Math.max(
        f.width + R.entityPadding * 2,
        X + s * U
      )
    ),
    height: e.length > 0 ? A : Math.max(R.minEntityHeight, f.height + R.entityPadding * 2)
  };
  if (e.length > 0) {
    const N = Math.max(
      0,
      (I.width - X - s * U) / (U / 2)
    );
    r.attr(
      "transform",
      "translate(" + I.width / 2 + "," + (n + f.height / 2) + ")"
    );
    let v = f.height + n * 2, k = "attributeBoxOdd";
    o.forEach((x) => {
      const P = v + n + x.height / 2;
      x.tn.attr("transform", "translate(" + s + "," + P + ")");
      const Z = t.insert("rect", "#" + x.tn.node().id).classed(`er ${k}`, !0).attr("x", 0).attr("y", v).attr("width", E + s * 2 + N).attr("height", x.height + n * 2), w = parseFloat(Z.attr("x")) + parseFloat(Z.attr("width"));
      x.nn.attr(
        "transform",
        "translate(" + (w + s) + "," + P + ")"
      );
      const z = t.insert("rect", "#" + x.nn.node().id).classed(`er ${k}`, !0).attr("x", w).attr("y", v).attr("width", g + s * 2 + N).attr("height", x.height + n * 2);
      let S = parseFloat(z.attr("x")) + parseFloat(z.attr("width"));
      if (c) {
        x.kn.attr(
          "transform",
          "translate(" + (S + s) + "," + P + ")"
        );
        const M = t.insert("rect", "#" + x.kn.node().id).classed(`er ${k}`, !0).attr("x", S).attr("y", v).attr("width", O + s * 2 + N).attr("height", x.height + n * 2);
        S = parseFloat(M.attr("x")) + parseFloat(M.attr("width"));
      }
      _ && (x.cn.attr(
        "transform",
        "translate(" + (S + s) + "," + P + ")"
      ), t.insert("rect", "#" + x.cn.node().id).classed(`er ${k}`, "true").attr("x", S).attr("y", v).attr("width", y + s * 2 + N).attr("height", x.height + n * 2)), v += x.height + n * 2, k = k === "attributeBoxOdd" ? "attributeBoxEven" : "attributeBoxOdd";
    });
  } else
    I.height = Math.max(R.minEntityHeight, A), r.attr("transform", "translate(" + I.width / 2 + "," + I.height / 2 + ")");
  return I;
}, ce = function(t, r, e) {
  const n = Object.keys(r);
  let s;
  return n.forEach(function(p) {
    const f = ye(p, "entity");
    q.set(p, f);
    const o = t.append("g").attr("id", f);
    s = s === void 0 ? f : s;
    const c = "text-" + f, _ = o.append("text").classed("er entityLabel", !0).attr("id", c).attr("x", 0).attr("y", 0).style("dominant-baseline", "middle").style("text-anchor", "middle").style("font-family", V().fontFamily).style("font-size", R.fontSize + "px").text(p), { width: E, height: g } = oe(
      o,
      _,
      r[p].attributes
    ), y = o.insert("rect", "#" + c).classed("er entityBox", !0).attr("x", 0).attr("y", 0).attr("width", E).attr("height", g).node().getBBox();
    e.setNode(f, {
      width: y.width,
      height: y.height,
      shape: "rect",
      id: f
    });
  }), s;
}, le = function(t, r) {
  r.nodes().forEach(function(e) {
    e !== void 0 && r.node(e) !== void 0 && t.select("#" + e).attr(
      "transform",
      "translate(" + (r.node(e).x - r.node(e).width / 2) + "," + (r.node(e).y - r.node(e).height / 2) + " )"
    );
  });
}, _t = function(t) {
  return (t.entityA + t.roleA + t.entityB).replace(/\s/g, "");
}, he = function(t, r) {
  return t.forEach(function(e) {
    r.setEdge(
      q.get(e.entityA),
      q.get(e.entityB),
      { relationship: e },
      _t(e)
    );
  }), t;
};
let ft = 0;
const de = function(t, r, e, n, s) {
  ft++;
  const p = e.edge(
    q.get(r.entityA),
    q.get(r.entityB),
    _t(r)
  ), f = Bt().x(function(A) {
    return A.x;
  }).y(function(A) {
    return A.y;
  }).curve(wt), o = t.insert("path", "#" + n).classed("er relationshipLine", !0).attr("d", f(p.points)).style("stroke", R.stroke).style("fill", "none");
  r.relSpec.relType === s.db.Identification.NON_IDENTIFYING && o.attr("stroke-dasharray", "8,8");
  let c = "";
  switch (R.arrowMarkerAbsolute && (c = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search, c = c.replace(/\(/g, "\\("), c = c.replace(/\)/g, "\\)")), r.relSpec.cardA) {
    case s.db.Cardinality.ZERO_OR_ONE:
      o.attr("marker-end", "url(" + c + "#" + C.ERMarkers.ZERO_OR_ONE_END + ")");
      break;
    case s.db.Cardinality.ZERO_OR_MORE:
      o.attr("marker-end", "url(" + c + "#" + C.ERMarkers.ZERO_OR_MORE_END + ")");
      break;
    case s.db.Cardinality.ONE_OR_MORE:
      o.attr("marker-end", "url(" + c + "#" + C.ERMarkers.ONE_OR_MORE_END + ")");
      break;
    case s.db.Cardinality.ONLY_ONE:
      o.attr("marker-end", "url(" + c + "#" + C.ERMarkers.ONLY_ONE_END + ")");
      break;
    case s.db.Cardinality.MD_PARENT:
      o.attr("marker-end", "url(" + c + "#" + C.ERMarkers.MD_PARENT_END + ")");
      break;
  }
  switch (r.relSpec.cardB) {
    case s.db.Cardinality.ZERO_OR_ONE:
      o.attr(
        "marker-start",
        "url(" + c + "#" + C.ERMarkers.ZERO_OR_ONE_START + ")"
      );
      break;
    case s.db.Cardinality.ZERO_OR_MORE:
      o.attr(
        "marker-start",
        "url(" + c + "#" + C.ERMarkers.ZERO_OR_MORE_START + ")"
      );
      break;
    case s.db.Cardinality.ONE_OR_MORE:
      o.attr(
        "marker-start",
        "url(" + c + "#" + C.ERMarkers.ONE_OR_MORE_START + ")"
      );
      break;
    case s.db.Cardinality.ONLY_ONE:
      o.attr("marker-start", "url(" + c + "#" + C.ERMarkers.ONLY_ONE_START + ")");
      break;
    case s.db.Cardinality.MD_PARENT:
      o.attr("marker-start", "url(" + c + "#" + C.ERMarkers.MD_PARENT_START + ")");
      break;
  }
  const _ = o.node().getTotalLength(), E = o.node().getPointAtLength(_ * 0.5), g = "rel" + ft, y = t.append("text").classed("er relationshipLabel", !0).attr("id", g).attr("x", E.x).attr("y", E.y).style("text-anchor", "middle").style("dominant-baseline", "middle").style("font-family", V().fontFamily).style("font-size", R.fontSize + "px").text(r.roleA).node().getBBox();
  t.insert("rect", "#" + g).classed("er relationshipLabelBox", !0).attr("x", E.x - y.width / 2).attr("y", E.y - y.height / 2).attr("width", y.width).attr("height", y.height);
}, ue = function(t, r, e, n) {
  R = V().er, et.info("Drawing ER diagram");
  const s = V().securityLevel;
  let p;
  s === "sandbox" && (p = st("#i" + r));
  const o = (s === "sandbox" ? st(p.nodes()[0].contentDocument.body) : st("body")).select(`[id='${r}']`);
  C.insertMarkers(o, R);
  let c;
  c = new St({
    multigraph: !0,
    directed: !0,
    compound: !1
  }).setGraph({
    rankdir: R.layoutDirection,
    marginx: 20,
    marginy: 20,
    nodesep: 100,
    edgesep: 100,
    ranksep: 100
  }).setDefaultEdgeLabel(function() {
    return {};
  });
  const _ = ce(o, n.db.getEntities(), c), E = he(n.db.getRelationships(), c);
  Lt(c), le(o, c), E.forEach(function(Y) {
    de(o, Y, c, _, n);
  });
  const g = R.diagramPadding;
  vt.insertTitle(o, "entityTitleText", R.titleTopMargin, n.db.getDiagramTitle());
  const O = o.node().getBBox(), y = O.width + g * 2, A = O.height + g * 2;
  Dt(o, A, y, R.useMaxWidth), o.attr("viewBox", `${O.x - g} ${O.y - g} ${y} ${A}`);
}, fe = "28e9f9db-3c8d-5aa5-9faf-44286ae5937c";
function ye(t = "", r = "") {
  const e = t.replace(ne, "");
  return `${yt(r)}${yt(e)}${ae(
    t,
    fe
  )}`;
}
function yt(t = "") {
  return t.length > 0 ? `${t}-` : "";
}
const pe = {
  setConf: se,
  draw: ue
}, _e = (t) => `
  .entityBox {
    fill: ${t.mainBkg};
    stroke: ${t.nodeBorder};
  }

  .attributeBoxOdd {
    fill: ${t.attributeBackgroundColorOdd};
    stroke: ${t.nodeBorder};
  }

  .attributeBoxEven {
    fill:  ${t.attributeBackgroundColorEven};
    stroke: ${t.nodeBorder};
  }

  .relationshipLabelBox {
    fill: ${t.tertiaryColor};
    opacity: 0.7;
    background-color: ${t.tertiaryColor};
      rect {
        opacity: 0.5;
      }
  }

    .relationshipLine {
      stroke: ${t.lineColor};
    }

  .entityTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.textColor};
  }    
  #MD_PARENT_START {
    fill: #f5f5f5 !important;
    stroke: ${t.lineColor} !important;
    stroke-width: 1;
  }
  #MD_PARENT_END {
    fill: #f5f5f5 !important;
    stroke: ${t.lineColor} !important;
    stroke-width: 1;
  }
  
`, Ee = _e, Oe = {
  parser: Ct,
  db: Ht,
  renderer: pe,
  styles: Ee
};
export {
  Oe as diagram
};
