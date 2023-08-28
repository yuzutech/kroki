import { c as I, s as Oe, g as Ie, a as Ge, b as Pe, D as Ne, E as He, m as De, l as N, f as V, F as Be, I as Ve, J as fe, j as ze, A as je, K as qe } from "./mermaid-d733041c.js";
var pe = function() {
  var r = function(q, m, b, k) {
    for (b = b || {}, k = q.length; k--; b[q[k]] = m)
      ;
    return b;
  }, a = [1, 4], o = [1, 7], p = [1, 5], n = [1, 9], c = [1, 6], u = [2, 6], h = [1, 16], w = [6, 8, 14, 20, 22, 24, 25, 27, 29, 32, 37, 40, 50, 55], x = [8, 14, 20, 22, 24, 25, 27, 29, 32, 37, 40], l = [8, 13, 14, 20, 22, 24, 25, 27, 29, 32, 37, 40], g = [1, 26], f = [6, 8, 14, 50, 55], s = [8, 14, 55], _ = [1, 53], T = [1, 52], O = [8, 14, 30, 33, 35, 38, 55], E = [1, 67], d = [1, 68], y = [1, 69], H = [8, 14, 33, 35, 42, 55], ce = {
    trace: function() {
    },
    yy: {},
    symbols_: { error: 2, start: 3, eol: 4, directive: 5, GG: 6, document: 7, EOF: 8, ":": 9, DIR: 10, options: 11, body: 12, OPT: 13, NL: 14, line: 15, statement: 16, commitStatement: 17, mergeStatement: 18, cherryPickStatement: 19, acc_title: 20, acc_title_value: 21, acc_descr: 22, acc_descr_value: 23, acc_descr_multiline_value: 24, section: 25, branchStatement: 26, CHECKOUT: 27, ref: 28, BRANCH: 29, ORDER: 30, NUM: 31, CHERRY_PICK: 32, COMMIT_ID: 33, STR: 34, COMMIT_TAG: 35, EMPTYSTR: 36, MERGE: 37, COMMIT_TYPE: 38, commitType: 39, COMMIT: 40, commit_arg: 41, COMMIT_MSG: 42, NORMAL: 43, REVERSE: 44, HIGHLIGHT: 45, openDirective: 46, typeDirective: 47, closeDirective: 48, argDirective: 49, open_directive: 50, type_directive: 51, arg_directive: 52, close_directive: 53, ID: 54, ";": 55, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 6: "GG", 8: "EOF", 9: ":", 10: "DIR", 13: "OPT", 14: "NL", 20: "acc_title", 21: "acc_title_value", 22: "acc_descr", 23: "acc_descr_value", 24: "acc_descr_multiline_value", 25: "section", 27: "CHECKOUT", 29: "BRANCH", 30: "ORDER", 31: "NUM", 32: "CHERRY_PICK", 33: "COMMIT_ID", 34: "STR", 35: "COMMIT_TAG", 36: "EMPTYSTR", 37: "MERGE", 38: "COMMIT_TYPE", 40: "COMMIT", 42: "COMMIT_MSG", 43: "NORMAL", 44: "REVERSE", 45: "HIGHLIGHT", 50: "open_directive", 51: "type_directive", 52: "arg_directive", 53: "close_directive", 54: "ID", 55: ";" },
    productions_: [0, [3, 2], [3, 2], [3, 3], [3, 4], [3, 5], [7, 0], [7, 2], [11, 2], [11, 1], [12, 0], [12, 2], [15, 2], [15, 1], [16, 1], [16, 1], [16, 1], [16, 2], [16, 2], [16, 1], [16, 1], [16, 1], [16, 2], [26, 2], [26, 4], [19, 3], [19, 5], [19, 5], [19, 5], [19, 5], [18, 2], [18, 4], [18, 4], [18, 4], [18, 6], [18, 6], [18, 6], [18, 6], [18, 6], [18, 6], [18, 8], [18, 8], [18, 8], [18, 8], [18, 8], [18, 8], [17, 2], [17, 3], [17, 3], [17, 5], [17, 5], [17, 3], [17, 5], [17, 5], [17, 5], [17, 5], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 3], [17, 5], [17, 5], [17, 5], [17, 5], [17, 5], [17, 5], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 7], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [17, 9], [41, 0], [41, 1], [39, 1], [39, 1], [39, 1], [5, 3], [5, 5], [46, 1], [47, 1], [49, 1], [48, 1], [28, 1], [28, 1], [4, 1], [4, 1], [4, 1]],
    performAction: function(m, b, k, i, v, e, W) {
      var t = e.length - 1;
      switch (v) {
        case 3:
          return e[t];
        case 4:
          return e[t - 1];
        case 5:
          return i.setDirection(e[t - 3]), e[t - 1];
        case 7:
          i.setOptions(e[t - 1]), this.$ = e[t];
          break;
        case 8:
          e[t - 1] += e[t], this.$ = e[t - 1];
          break;
        case 10:
          this.$ = [];
          break;
        case 11:
          e[t - 1].push(e[t]), this.$ = e[t - 1];
          break;
        case 12:
          this.$ = e[t - 1];
          break;
        case 17:
          this.$ = e[t].trim(), i.setAccTitle(this.$);
          break;
        case 18:
        case 19:
          this.$ = e[t].trim(), i.setAccDescription(this.$);
          break;
        case 20:
          i.addSection(e[t].substr(8)), this.$ = e[t].substr(8);
          break;
        case 22:
          i.checkout(e[t]);
          break;
        case 23:
          i.branch(e[t]);
          break;
        case 24:
          i.branch(e[t - 2], e[t]);
          break;
        case 25:
          i.cherryPick(e[t], "", void 0);
          break;
        case 26:
          i.cherryPick(e[t - 2], "", e[t]);
          break;
        case 27:
        case 29:
          i.cherryPick(e[t - 2], "", "");
          break;
        case 28:
          i.cherryPick(e[t], "", e[t - 2]);
          break;
        case 30:
          i.merge(e[t], "", "", "");
          break;
        case 31:
          i.merge(e[t - 2], e[t], "", "");
          break;
        case 32:
          i.merge(e[t - 2], "", e[t], "");
          break;
        case 33:
          i.merge(e[t - 2], "", "", e[t]);
          break;
        case 34:
          i.merge(e[t - 4], e[t], "", e[t - 2]);
          break;
        case 35:
          i.merge(e[t - 4], "", e[t], e[t - 2]);
          break;
        case 36:
          i.merge(e[t - 4], "", e[t - 2], e[t]);
          break;
        case 37:
          i.merge(e[t - 4], e[t - 2], e[t], "");
          break;
        case 38:
          i.merge(e[t - 4], e[t - 2], "", e[t]);
          break;
        case 39:
          i.merge(e[t - 4], e[t], e[t - 2], "");
          break;
        case 40:
          i.merge(e[t - 6], e[t - 4], e[t - 2], e[t]);
          break;
        case 41:
          i.merge(e[t - 6], e[t], e[t - 4], e[t - 2]);
          break;
        case 42:
          i.merge(e[t - 6], e[t - 4], e[t], e[t - 2]);
          break;
        case 43:
          i.merge(e[t - 6], e[t - 2], e[t - 4], e[t]);
          break;
        case 44:
          i.merge(e[t - 6], e[t], e[t - 2], e[t - 4]);
          break;
        case 45:
          i.merge(e[t - 6], e[t - 2], e[t], e[t - 4]);
          break;
        case 46:
          i.commit(e[t]);
          break;
        case 47:
          i.commit("", "", i.commitType.NORMAL, e[t]);
          break;
        case 48:
          i.commit("", "", e[t], "");
          break;
        case 49:
          i.commit("", "", e[t], e[t - 2]);
          break;
        case 50:
          i.commit("", "", e[t - 2], e[t]);
          break;
        case 51:
          i.commit("", e[t], i.commitType.NORMAL, "");
          break;
        case 52:
          i.commit("", e[t - 2], i.commitType.NORMAL, e[t]);
          break;
        case 53:
          i.commit("", e[t], i.commitType.NORMAL, e[t - 2]);
          break;
        case 54:
          i.commit("", e[t - 2], e[t], "");
          break;
        case 55:
          i.commit("", e[t], e[t - 2], "");
          break;
        case 56:
          i.commit("", e[t - 4], e[t - 2], e[t]);
          break;
        case 57:
          i.commit("", e[t - 4], e[t], e[t - 2]);
          break;
        case 58:
          i.commit("", e[t - 2], e[t - 4], e[t]);
          break;
        case 59:
          i.commit("", e[t], e[t - 4], e[t - 2]);
          break;
        case 60:
          i.commit("", e[t], e[t - 2], e[t - 4]);
          break;
        case 61:
          i.commit("", e[t - 2], e[t], e[t - 4]);
          break;
        case 62:
          i.commit(e[t], "", i.commitType.NORMAL, "");
          break;
        case 63:
          i.commit(e[t], "", i.commitType.NORMAL, e[t - 2]);
          break;
        case 64:
          i.commit(e[t - 2], "", i.commitType.NORMAL, e[t]);
          break;
        case 65:
          i.commit(e[t - 2], "", e[t], "");
          break;
        case 66:
          i.commit(e[t], "", e[t - 2], "");
          break;
        case 67:
          i.commit(e[t], e[t - 2], i.commitType.NORMAL, "");
          break;
        case 68:
          i.commit(e[t - 2], e[t], i.commitType.NORMAL, "");
          break;
        case 69:
          i.commit(e[t - 4], "", e[t - 2], e[t]);
          break;
        case 70:
          i.commit(e[t - 4], "", e[t], e[t - 2]);
          break;
        case 71:
          i.commit(e[t - 2], "", e[t - 4], e[t]);
          break;
        case 72:
          i.commit(e[t], "", e[t - 4], e[t - 2]);
          break;
        case 73:
          i.commit(e[t], "", e[t - 2], e[t - 4]);
          break;
        case 74:
          i.commit(e[t - 2], "", e[t], e[t - 4]);
          break;
        case 75:
          i.commit(e[t - 4], e[t], e[t - 2], "");
          break;
        case 76:
          i.commit(e[t - 4], e[t - 2], e[t], "");
          break;
        case 77:
          i.commit(e[t - 2], e[t], e[t - 4], "");
          break;
        case 78:
          i.commit(e[t], e[t - 2], e[t - 4], "");
          break;
        case 79:
          i.commit(e[t], e[t - 4], e[t - 2], "");
          break;
        case 80:
          i.commit(e[t - 2], e[t - 4], e[t], "");
          break;
        case 81:
          i.commit(e[t - 4], e[t], i.commitType.NORMAL, e[t - 2]);
          break;
        case 82:
          i.commit(e[t - 4], e[t - 2], i.commitType.NORMAL, e[t]);
          break;
        case 83:
          i.commit(e[t - 2], e[t], i.commitType.NORMAL, e[t - 4]);
          break;
        case 84:
          i.commit(e[t], e[t - 2], i.commitType.NORMAL, e[t - 4]);
          break;
        case 85:
          i.commit(e[t], e[t - 4], i.commitType.NORMAL, e[t - 2]);
          break;
        case 86:
          i.commit(e[t - 2], e[t - 4], i.commitType.NORMAL, e[t]);
          break;
        case 87:
          i.commit(e[t - 6], e[t - 4], e[t - 2], e[t]);
          break;
        case 88:
          i.commit(e[t - 6], e[t - 4], e[t], e[t - 2]);
          break;
        case 89:
          i.commit(e[t - 6], e[t - 2], e[t - 4], e[t]);
          break;
        case 90:
          i.commit(e[t - 6], e[t], e[t - 4], e[t - 2]);
          break;
        case 91:
          i.commit(e[t - 6], e[t - 2], e[t], e[t - 4]);
          break;
        case 92:
          i.commit(e[t - 6], e[t], e[t - 2], e[t - 4]);
          break;
        case 93:
          i.commit(e[t - 4], e[t - 6], e[t - 2], e[t]);
          break;
        case 94:
          i.commit(e[t - 4], e[t - 6], e[t], e[t - 2]);
          break;
        case 95:
          i.commit(e[t - 2], e[t - 6], e[t - 4], e[t]);
          break;
        case 96:
          i.commit(e[t], e[t - 6], e[t - 4], e[t - 2]);
          break;
        case 97:
          i.commit(e[t - 2], e[t - 6], e[t], e[t - 4]);
          break;
        case 98:
          i.commit(e[t], e[t - 6], e[t - 2], e[t - 4]);
          break;
        case 99:
          i.commit(e[t], e[t - 4], e[t - 2], e[t - 6]);
          break;
        case 100:
          i.commit(e[t - 2], e[t - 4], e[t], e[t - 6]);
          break;
        case 101:
          i.commit(e[t], e[t - 2], e[t - 4], e[t - 6]);
          break;
        case 102:
          i.commit(e[t - 2], e[t], e[t - 4], e[t - 6]);
          break;
        case 103:
          i.commit(e[t - 4], e[t - 2], e[t], e[t - 6]);
          break;
        case 104:
          i.commit(e[t - 4], e[t], e[t - 2], e[t - 6]);
          break;
        case 105:
          i.commit(e[t - 2], e[t - 4], e[t - 6], e[t]);
          break;
        case 106:
          i.commit(e[t], e[t - 4], e[t - 6], e[t - 2]);
          break;
        case 107:
          i.commit(e[t - 2], e[t], e[t - 6], e[t - 4]);
          break;
        case 108:
          i.commit(e[t], e[t - 2], e[t - 6], e[t - 4]);
          break;
        case 109:
          i.commit(e[t - 4], e[t - 2], e[t - 6], e[t]);
          break;
        case 110:
          i.commit(e[t - 4], e[t], e[t - 6], e[t - 2]);
          break;
        case 111:
          this.$ = "";
          break;
        case 112:
          this.$ = e[t];
          break;
        case 113:
          this.$ = i.commitType.NORMAL;
          break;
        case 114:
          this.$ = i.commitType.REVERSE;
          break;
        case 115:
          this.$ = i.commitType.HIGHLIGHT;
          break;
        case 118:
          i.parseDirective("%%{", "open_directive");
          break;
        case 119:
          i.parseDirective(e[t], "type_directive");
          break;
        case 120:
          e[t] = e[t].trim().replace(/'/g, '"'), i.parseDirective(e[t], "arg_directive");
          break;
        case 121:
          i.parseDirective("}%%", "close_directive", "gitGraph");
          break;
      }
    },
    table: [{ 3: 1, 4: 2, 5: 3, 6: a, 8: o, 14: p, 46: 8, 50: n, 55: c }, { 1: [3] }, { 3: 10, 4: 2, 5: 3, 6: a, 8: o, 14: p, 46: 8, 50: n, 55: c }, { 3: 11, 4: 2, 5: 3, 6: a, 8: o, 14: p, 46: 8, 50: n, 55: c }, { 7: 12, 8: u, 9: [1, 13], 10: [1, 14], 11: 15, 14: h }, r(w, [2, 124]), r(w, [2, 125]), r(w, [2, 126]), { 47: 17, 51: [1, 18] }, { 51: [2, 118] }, { 1: [2, 1] }, { 1: [2, 2] }, { 8: [1, 19] }, { 7: 20, 8: u, 11: 15, 14: h }, { 9: [1, 21] }, r(x, [2, 10], { 12: 22, 13: [1, 23] }), r(l, [2, 9]), { 9: [1, 25], 48: 24, 53: g }, r([9, 53], [2, 119]), { 1: [2, 3] }, { 8: [1, 27] }, { 7: 28, 8: u, 11: 15, 14: h }, { 8: [2, 7], 14: [1, 31], 15: 29, 16: 30, 17: 32, 18: 33, 19: 34, 20: [1, 35], 22: [1, 36], 24: [1, 37], 25: [1, 38], 26: 39, 27: [1, 40], 29: [1, 44], 32: [1, 43], 37: [1, 42], 40: [1, 41] }, r(l, [2, 8]), r(f, [2, 116]), { 49: 45, 52: [1, 46] }, r(f, [2, 121]), { 1: [2, 4] }, { 8: [1, 47] }, r(x, [2, 11]), { 4: 48, 8: o, 14: p, 55: c }, r(x, [2, 13]), r(s, [2, 14]), r(s, [2, 15]), r(s, [2, 16]), { 21: [1, 49] }, { 23: [1, 50] }, r(s, [2, 19]), r(s, [2, 20]), r(s, [2, 21]), { 28: 51, 34: _, 54: T }, r(s, [2, 111], { 41: 54, 33: [1, 57], 34: [1, 59], 35: [1, 55], 38: [1, 56], 42: [1, 58] }), { 28: 60, 34: _, 54: T }, { 33: [1, 61], 35: [1, 62] }, { 28: 63, 34: _, 54: T }, { 48: 64, 53: g }, { 53: [2, 120] }, { 1: [2, 5] }, r(x, [2, 12]), r(s, [2, 17]), r(s, [2, 18]), r(s, [2, 22]), r(O, [2, 122]), r(O, [2, 123]), r(s, [2, 46]), { 34: [1, 65] }, { 39: 66, 43: E, 44: d, 45: y }, { 34: [1, 70] }, { 34: [1, 71] }, r(s, [2, 112]), r(s, [2, 30], { 33: [1, 72], 35: [1, 74], 38: [1, 73] }), { 34: [1, 75] }, { 34: [1, 76], 36: [1, 77] }, r(s, [2, 23], { 30: [1, 78] }), r(f, [2, 117]), r(s, [2, 47], { 33: [1, 80], 38: [1, 79], 42: [1, 81] }), r(s, [2, 48], { 33: [1, 83], 35: [1, 82], 42: [1, 84] }), r(H, [2, 113]), r(H, [2, 114]), r(H, [2, 115]), r(s, [2, 51], { 35: [1, 85], 38: [1, 86], 42: [1, 87] }), r(s, [2, 62], { 33: [1, 90], 35: [1, 88], 38: [1, 89] }), { 34: [1, 91] }, { 39: 92, 43: E, 44: d, 45: y }, { 34: [1, 93] }, r(s, [2, 25], { 35: [1, 94] }), { 33: [1, 95] }, { 33: [1, 96] }, { 31: [1, 97] }, { 39: 98, 43: E, 44: d, 45: y }, { 34: [1, 99] }, { 34: [1, 100] }, { 34: [1, 101] }, { 34: [1, 102] }, { 34: [1, 103] }, { 34: [1, 104] }, { 39: 105, 43: E, 44: d, 45: y }, { 34: [1, 106] }, { 34: [1, 107] }, { 39: 108, 43: E, 44: d, 45: y }, { 34: [1, 109] }, r(s, [2, 31], { 35: [1, 111], 38: [1, 110] }), r(s, [2, 32], { 33: [1, 113], 35: [1, 112] }), r(s, [2, 33], { 33: [1, 114], 38: [1, 115] }), { 34: [1, 116], 36: [1, 117] }, { 34: [1, 118] }, { 34: [1, 119] }, r(s, [2, 24]), r(s, [2, 49], { 33: [1, 120], 42: [1, 121] }), r(s, [2, 53], { 38: [1, 122], 42: [1, 123] }), r(s, [2, 63], { 33: [1, 125], 38: [1, 124] }), r(s, [2, 50], { 33: [1, 126], 42: [1, 127] }), r(s, [2, 55], { 35: [1, 128], 42: [1, 129] }), r(s, [2, 66], { 33: [1, 131], 35: [1, 130] }), r(s, [2, 52], { 38: [1, 132], 42: [1, 133] }), r(s, [2, 54], { 35: [1, 134], 42: [1, 135] }), r(s, [2, 67], { 35: [1, 137], 38: [1, 136] }), r(s, [2, 64], { 33: [1, 139], 38: [1, 138] }), r(s, [2, 65], { 33: [1, 141], 35: [1, 140] }), r(s, [2, 68], { 35: [1, 143], 38: [1, 142] }), { 39: 144, 43: E, 44: d, 45: y }, { 34: [1, 145] }, { 34: [1, 146] }, { 34: [1, 147] }, { 34: [1, 148] }, { 39: 149, 43: E, 44: d, 45: y }, r(s, [2, 26]), r(s, [2, 27]), r(s, [2, 28]), r(s, [2, 29]), { 34: [1, 150] }, { 34: [1, 151] }, { 39: 152, 43: E, 44: d, 45: y }, { 34: [1, 153] }, { 39: 154, 43: E, 44: d, 45: y }, { 34: [1, 155] }, { 34: [1, 156] }, { 34: [1, 157] }, { 34: [1, 158] }, { 34: [1, 159] }, { 34: [1, 160] }, { 34: [1, 161] }, { 39: 162, 43: E, 44: d, 45: y }, { 34: [1, 163] }, { 34: [1, 164] }, { 34: [1, 165] }, { 39: 166, 43: E, 44: d, 45: y }, { 34: [1, 167] }, { 39: 168, 43: E, 44: d, 45: y }, { 34: [1, 169] }, { 34: [1, 170] }, { 34: [1, 171] }, { 39: 172, 43: E, 44: d, 45: y }, { 34: [1, 173] }, r(s, [2, 37], { 35: [1, 174] }), r(s, [2, 38], { 38: [1, 175] }), r(s, [2, 36], { 33: [1, 176] }), r(s, [2, 39], { 35: [1, 177] }), r(s, [2, 34], { 38: [1, 178] }), r(s, [2, 35], { 33: [1, 179] }), r(s, [2, 60], { 42: [1, 180] }), r(s, [2, 73], { 33: [1, 181] }), r(s, [2, 61], { 42: [1, 182] }), r(s, [2, 84], { 38: [1, 183] }), r(s, [2, 74], { 33: [1, 184] }), r(s, [2, 83], { 38: [1, 185] }), r(s, [2, 59], { 42: [1, 186] }), r(s, [2, 72], { 33: [1, 187] }), r(s, [2, 58], { 42: [1, 188] }), r(s, [2, 78], { 35: [1, 189] }), r(s, [2, 71], { 33: [1, 190] }), r(s, [2, 77], { 35: [1, 191] }), r(s, [2, 57], { 42: [1, 192] }), r(s, [2, 85], { 38: [1, 193] }), r(s, [2, 56], { 42: [1, 194] }), r(s, [2, 79], { 35: [1, 195] }), r(s, [2, 80], { 35: [1, 196] }), r(s, [2, 86], { 38: [1, 197] }), r(s, [2, 70], { 33: [1, 198] }), r(s, [2, 81], { 38: [1, 199] }), r(s, [2, 69], { 33: [1, 200] }), r(s, [2, 75], { 35: [1, 201] }), r(s, [2, 76], { 35: [1, 202] }), r(s, [2, 82], { 38: [1, 203] }), { 34: [1, 204] }, { 39: 205, 43: E, 44: d, 45: y }, { 34: [1, 206] }, { 34: [1, 207] }, { 39: 208, 43: E, 44: d, 45: y }, { 34: [1, 209] }, { 34: [1, 210] }, { 34: [1, 211] }, { 34: [1, 212] }, { 39: 213, 43: E, 44: d, 45: y }, { 34: [1, 214] }, { 39: 215, 43: E, 44: d, 45: y }, { 34: [1, 216] }, { 34: [1, 217] }, { 34: [1, 218] }, { 34: [1, 219] }, { 34: [1, 220] }, { 34: [1, 221] }, { 34: [1, 222] }, { 39: 223, 43: E, 44: d, 45: y }, { 34: [1, 224] }, { 34: [1, 225] }, { 34: [1, 226] }, { 39: 227, 43: E, 44: d, 45: y }, { 34: [1, 228] }, { 39: 229, 43: E, 44: d, 45: y }, { 34: [1, 230] }, { 34: [1, 231] }, { 34: [1, 232] }, { 39: 233, 43: E, 44: d, 45: y }, r(s, [2, 40]), r(s, [2, 42]), r(s, [2, 41]), r(s, [2, 43]), r(s, [2, 45]), r(s, [2, 44]), r(s, [2, 101]), r(s, [2, 102]), r(s, [2, 99]), r(s, [2, 100]), r(s, [2, 104]), r(s, [2, 103]), r(s, [2, 108]), r(s, [2, 107]), r(s, [2, 106]), r(s, [2, 105]), r(s, [2, 110]), r(s, [2, 109]), r(s, [2, 98]), r(s, [2, 97]), r(s, [2, 96]), r(s, [2, 95]), r(s, [2, 93]), r(s, [2, 94]), r(s, [2, 92]), r(s, [2, 91]), r(s, [2, 90]), r(s, [2, 89]), r(s, [2, 87]), r(s, [2, 88])],
    defaultActions: { 9: [2, 118], 10: [2, 1], 11: [2, 2], 19: [2, 3], 27: [2, 4], 46: [2, 120], 47: [2, 5] },
    parseError: function(m, b) {
      if (b.recoverable)
        this.trace(m);
      else {
        var k = new Error(m);
        throw k.hash = b, k;
      }
    },
    parse: function(m) {
      var b = this, k = [0], i = [], v = [null], e = [], W = this.table, t = "", re = 0, ge = 0, Me = 2, de = 1, Ce = e.slice.call(arguments, 1), M = Object.create(this.lexer), Y = { yy: {} };
      for (var le in this.yy)
        Object.prototype.hasOwnProperty.call(this.yy, le) && (Y.yy[le] = this.yy[le]);
      M.setInput(m, Y.yy), Y.yy.lexer = M, Y.yy.parser = this, typeof M.yylloc > "u" && (M.yylloc = {});
      var he = M.yylloc;
      e.push(he);
      var Ae = M.options && M.options.ranges;
      typeof Y.yy.parseError == "function" ? this.parseError = Y.yy.parseError : this.parseError = Object.getPrototypeOf(this).parseError;
      function Se() {
        var j;
        return j = i.pop() || M.lex() || de, typeof j != "number" && (j instanceof Array && (i = j, j = i.pop()), j = b.symbols_[j] || j), j;
      }
      for (var P, K, B, me, J = {}, ie, z, ke, se; ; ) {
        if (K = k[k.length - 1], this.defaultActions[K] ? B = this.defaultActions[K] : ((P === null || typeof P > "u") && (P = Se()), B = W[K] && W[K][P]), typeof B > "u" || !B.length || !B[0]) {
          var ue = "";
          se = [];
          for (ie in W[K])
            this.terminals_[ie] && ie > Me && se.push("'" + this.terminals_[ie] + "'");
          M.showPosition ? ue = "Parse error on line " + (re + 1) + `:
` + M.showPosition() + `
Expecting ` + se.join(", ") + ", got '" + (this.terminals_[P] || P) + "'" : ue = "Parse error on line " + (re + 1) + ": Unexpected " + (P == de ? "end of input" : "'" + (this.terminals_[P] || P) + "'"), this.parseError(ue, {
            text: M.match,
            token: this.terminals_[P] || P,
            line: M.yylineno,
            loc: he,
            expected: se
          });
        }
        if (B[0] instanceof Array && B.length > 1)
          throw new Error("Parse Error: multiple actions possible at state: " + K + ", token: " + P);
        switch (B[0]) {
          case 1:
            k.push(P), v.push(M.yytext), e.push(M.yylloc), k.push(B[1]), P = null, ge = M.yyleng, t = M.yytext, re = M.yylineno, he = M.yylloc;
            break;
          case 2:
            if (z = this.productions_[B[1]][1], J.$ = v[v.length - z], J._$ = {
              first_line: e[e.length - (z || 1)].first_line,
              last_line: e[e.length - 1].last_line,
              first_column: e[e.length - (z || 1)].first_column,
              last_column: e[e.length - 1].last_column
            }, Ae && (J._$.range = [
              e[e.length - (z || 1)].range[0],
              e[e.length - 1].range[1]
            ]), me = this.performAction.apply(J, [
              t,
              ge,
              re,
              Y.yy,
              B[1],
              v,
              e
            ].concat(Ce)), typeof me < "u")
              return me;
            z && (k = k.slice(0, -1 * z * 2), v = v.slice(0, -1 * z), e = e.slice(0, -1 * z)), k.push(this.productions_[B[1]][0]), v.push(J.$), e.push(J._$), ke = W[k[k.length - 2]][k[k.length - 1]], k.push(ke);
            break;
          case 3:
            return !0;
        }
      }
      return !0;
    }
  }, Re = function() {
    var q = {
      EOF: 1,
      parseError: function(b, k) {
        if (this.yy.parser)
          this.yy.parser.parseError(b, k);
        else
          throw new Error(b);
      },
      // resets the lexer, sets new input
      setInput: function(m, b) {
        return this.yy = b || this.yy || {}, this._input = m, this._more = this._backtrack = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this;
      },
      // consumes and returns one char from the input
      input: function() {
        var m = this._input[0];
        this.yytext += m, this.yyleng++, this.offset++, this.match += m, this.matched += m;
        var b = m.match(/(?:\r\n?|\n).*/g);
        return b ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), m;
      },
      // unshifts one char (or a string) into the input
      unput: function(m) {
        var b = m.length, k = m.split(/(?:\r\n?|\n)/g);
        this._input = m + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - b), this.offset -= b;
        var i = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), k.length - 1 && (this.yylineno -= k.length - 1);
        var v = this.yylloc.range;
        return this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: k ? (k.length === i.length ? this.yylloc.first_column : 0) + i[i.length - k.length].length - k[0].length : this.yylloc.first_column - b
        }, this.options.ranges && (this.yylloc.range = [v[0], v[0] + this.yyleng - b]), this.yyleng = this.yytext.length, this;
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
      less: function(m) {
        this.unput(this.match.slice(m));
      },
      // displays already matched input, i.e. for error messages
      pastInput: function() {
        var m = this.matched.substr(0, this.matched.length - this.match.length);
        return (m.length > 20 ? "..." : "") + m.substr(-20).replace(/\n/g, "");
      },
      // displays upcoming input, i.e. for error messages
      upcomingInput: function() {
        var m = this.match;
        return m.length < 20 && (m += this._input.substr(0, 20 - m.length)), (m.substr(0, 20) + (m.length > 20 ? "..." : "")).replace(/\n/g, "");
      },
      // displays the character position where the lexing error occurred, i.e. for error messages
      showPosition: function() {
        var m = this.pastInput(), b = new Array(m.length + 1).join("-");
        return m + this.upcomingInput() + `
` + b + "^";
      },
      // test the lexed token: return FALSE when not a match, otherwise return token
      test_match: function(m, b) {
        var k, i, v;
        if (this.options.backtrack_lexer && (v = {
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
        }, this.options.ranges && (v.yylloc.range = this.yylloc.range.slice(0))), i = m[0].match(/(?:\r\n?|\n).*/g), i && (this.yylineno += i.length), this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: i ? i[i.length - 1].length - i[i.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + m[0].length
        }, this.yytext += m[0], this.match += m[0], this.matches = m, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._backtrack = !1, this._input = this._input.slice(m[0].length), this.matched += m[0], k = this.performAction.call(this, this.yy, this, b, this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), k)
          return k;
        if (this._backtrack) {
          for (var e in v)
            this[e] = v[e];
          return !1;
        }
        return !1;
      },
      // return next match in input
      next: function() {
        if (this.done)
          return this.EOF;
        this._input || (this.done = !0);
        var m, b, k, i;
        this._more || (this.yytext = "", this.match = "");
        for (var v = this._currentRules(), e = 0; e < v.length; e++)
          if (k = this._input.match(this.rules[v[e]]), k && (!b || k[0].length > b[0].length)) {
            if (b = k, i = e, this.options.backtrack_lexer) {
              if (m = this.test_match(k, v[e]), m !== !1)
                return m;
              if (this._backtrack) {
                b = !1;
                continue;
              } else
                return !1;
            } else if (!this.options.flex)
              break;
          }
        return b ? (m = this.test_match(b, v[i]), m !== !1 ? m : !1) : this._input === "" ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + `. Unrecognized text.
` + this.showPosition(), {
          text: "",
          token: null,
          line: this.yylineno
        });
      },
      // return next match that has a token
      lex: function() {
        var b = this.next();
        return b || this.lex();
      },
      // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
      begin: function(b) {
        this.conditionStack.push(b);
      },
      // pop the previously active lexer condition state off the condition stack
      popState: function() {
        var b = this.conditionStack.length - 1;
        return b > 0 ? this.conditionStack.pop() : this.conditionStack[0];
      },
      // produce the lexer rule set which is active for the currently active lexer condition state
      _currentRules: function() {
        return this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1] ? this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules : this.conditions.INITIAL.rules;
      },
      // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
      topState: function(b) {
        return b = this.conditionStack.length - 1 - Math.abs(b || 0), b >= 0 ? this.conditionStack[b] : "INITIAL";
      },
      // alias for begin(condition)
      pushState: function(b) {
        this.begin(b);
      },
      // return the number of states currently on the stack
      stateStackSize: function() {
        return this.conditionStack.length;
      },
      options: { "case-insensitive": !0 },
      performAction: function(b, k, i, v) {
        switch (i) {
          case 0:
            return this.begin("open_directive"), 50;
          case 1:
            return this.begin("type_directive"), 51;
          case 2:
            return this.popState(), this.begin("arg_directive"), 9;
          case 3:
            return this.popState(), this.popState(), 53;
          case 4:
            return 52;
          case 5:
            return this.begin("acc_title"), 20;
          case 6:
            return this.popState(), "acc_title_value";
          case 7:
            return this.begin("acc_descr"), 22;
          case 8:
            return this.popState(), "acc_descr_value";
          case 9:
            this.begin("acc_descr_multiline");
            break;
          case 10:
            this.popState();
            break;
          case 11:
            return "acc_descr_multiline_value";
          case 12:
            return 14;
          case 13:
            break;
          case 14:
            break;
          case 15:
            return 6;
          case 16:
            return 40;
          case 17:
            return 33;
          case 18:
            return 38;
          case 19:
            return 42;
          case 20:
            return 43;
          case 21:
            return 44;
          case 22:
            return 45;
          case 23:
            return 35;
          case 24:
            return 29;
          case 25:
            return 30;
          case 26:
            return 37;
          case 27:
            return 32;
          case 28:
            return 27;
          case 29:
            return 10;
          case 30:
            return 10;
          case 31:
            return 9;
          case 32:
            return "CARET";
          case 33:
            this.begin("options");
            break;
          case 34:
            this.popState();
            break;
          case 35:
            return 13;
          case 36:
            return 36;
          case 37:
            this.begin("string");
            break;
          case 38:
            this.popState();
            break;
          case 39:
            return 34;
          case 40:
            return 31;
          case 41:
            return 54;
          case 42:
            return 8;
        }
      },
      rules: [/^(?:%%\{)/i, /^(?:((?:(?!\}%%)[^:.])*))/i, /^(?::)/i, /^(?:\}%%)/i, /^(?:((?:(?!\}%%).|\n)*))/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:(\r?\n)+)/i, /^(?:#[^\n]*)/i, /^(?:%[^\n]*)/i, /^(?:gitGraph\b)/i, /^(?:commit(?=\s|$))/i, /^(?:id:)/i, /^(?:type:)/i, /^(?:msg:)/i, /^(?:NORMAL\b)/i, /^(?:REVERSE\b)/i, /^(?:HIGHLIGHT\b)/i, /^(?:tag:)/i, /^(?:branch(?=\s|$))/i, /^(?:order:)/i, /^(?:merge(?=\s|$))/i, /^(?:cherry-pick(?=\s|$))/i, /^(?:checkout(?=\s|$))/i, /^(?:LR\b)/i, /^(?:TB\b)/i, /^(?::)/i, /^(?:\^)/i, /^(?:options\r?\n)/i, /^(?:[ \r\n\t]+end\b)/i, /^(?:[\s\S]+(?=[ \r\n\t]+end))/i, /^(?:["]["])/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:[0-9]+(?=\s|$))/i, /^(?:\w([-\./\w]*[-\w])?)/i, /^(?:$)/i, /^(?:\s+)/i],
      conditions: { acc_descr_multiline: { rules: [10, 11], inclusive: !1 }, acc_descr: { rules: [8], inclusive: !1 }, acc_title: { rules: [6], inclusive: !1 }, close_directive: { rules: [], inclusive: !1 }, arg_directive: { rules: [3, 4], inclusive: !1 }, type_directive: { rules: [2, 3], inclusive: !1 }, open_directive: { rules: [1], inclusive: !1 }, options: { rules: [34, 35], inclusive: !1 }, string: { rules: [38, 39], inclusive: !1 }, INITIAL: { rules: [0, 5, 7, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 36, 37, 40, 41, 42, 43], inclusive: !0 } }
    };
    return q;
  }();
  ce.lexer = Re;
  function oe() {
    this.yy = {};
  }
  return oe.prototype = ce, ce.Parser = oe, new oe();
}();
pe.parser = pe;
const Ye = pe;
let ae = I().gitGraph.mainBranchName, Ke = I().gitGraph.mainBranchOrder, R = {}, G = null, Z = {};
Z[ae] = { name: ae, order: Ke };
let L = {};
L[ae] = G;
let A = ae, ye = "LR", U = 0;
function be() {
  return Ve({ length: 7 });
}
const Fe = function(r, a, o) {
  De.parseDirective(this, r, a, o);
};
function Ue(r, a) {
  const o = /* @__PURE__ */ Object.create(null);
  return r.reduce((p, n) => {
    const c = a(n);
    return o[c] || (o[c] = !0, p.push(n)), p;
  }, []);
}
const Je = function(r) {
  ye = r;
};
let Ee = {};
const We = function(r) {
  N.debug("options str", r), r = r && r.trim(), r = r || "{}";
  try {
    Ee = JSON.parse(r);
  } catch (a) {
    N.error("error while parsing gitGraph options", a.message);
  }
}, Xe = function() {
  return Ee;
}, Qe = function(r, a, o, p) {
  N.debug("Entering commit:", r, a, o, p), a = V.sanitizeText(a, I()), r = V.sanitizeText(r, I()), p = V.sanitizeText(p, I());
  const n = {
    id: a || U + "-" + be(),
    message: r,
    seq: U++,
    type: o || $.NORMAL,
    tag: p || "",
    parents: G == null ? [] : [G.id],
    branch: A
  };
  G = n, R[n.id] = n, L[A] = n.id, N.debug("in pushCommit " + n.id);
}, Ze = function(r, a) {
  if (r = V.sanitizeText(r, I()), L[r] === void 0)
    L[r] = G != null ? G.id : null, Z[r] = { name: r, order: a ? parseInt(a, 10) : null }, we(r), N.debug("in createBranch");
  else {
    let o = new Error(
      'Trying to create an existing branch. (Help: Either use a new name if you want create a new branch or try using "checkout ' + r + '")'
    );
    throw o.hash = {
      text: "branch " + r,
      token: "branch " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ['"checkout ' + r + '"']
    }, o;
  }
}, $e = function(r, a, o, p) {
  r = V.sanitizeText(r, I()), a = V.sanitizeText(a, I());
  const n = R[L[A]], c = R[L[r]];
  if (A === r) {
    let h = new Error('Incorrect usage of "merge". Cannot merge a branch to itself');
    throw h.hash = {
      text: "merge " + r,
      token: "merge " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ["branch abc"]
    }, h;
  } else if (n === void 0 || !n) {
    let h = new Error(
      'Incorrect usage of "merge". Current branch (' + A + ")has no commits"
    );
    throw h.hash = {
      text: "merge " + r,
      token: "merge " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ["commit"]
    }, h;
  } else if (L[r] === void 0) {
    let h = new Error(
      'Incorrect usage of "merge". Branch to be merged (' + r + ") does not exist"
    );
    throw h.hash = {
      text: "merge " + r,
      token: "merge " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ["branch " + r]
    }, h;
  } else if (c === void 0 || !c) {
    let h = new Error(
      'Incorrect usage of "merge". Branch to be merged (' + r + ") has no commits"
    );
    throw h.hash = {
      text: "merge " + r,
      token: "merge " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ['"commit"']
    }, h;
  } else if (n === c) {
    let h = new Error('Incorrect usage of "merge". Both branches have same head');
    throw h.hash = {
      text: "merge " + r,
      token: "merge " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ["branch abc"]
    }, h;
  } else if (a && R[a] !== void 0) {
    let h = new Error(
      'Incorrect usage of "merge". Commit with id:' + a + " already exists, use different custom Id"
    );
    throw h.hash = {
      text: "merge " + r + a + o + p,
      token: "merge " + r + a + o + p,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: [
        "merge " + r + " " + a + "_UNIQUE " + o + " " + p
      ]
    }, h;
  }
  const u = {
    id: a || U + "-" + be(),
    message: "merged branch " + r + " into " + A,
    seq: U++,
    parents: [G == null ? null : G.id, L[r]],
    branch: A,
    type: $.MERGE,
    customType: o,
    customId: !!a,
    tag: p || ""
  };
  G = u, R[u.id] = u, L[A] = u.id, N.debug(L), N.debug("in mergeBranch");
}, et = function(r, a, o) {
  if (N.debug("Entering cherryPick:", r, a, o), r = V.sanitizeText(r, I()), a = V.sanitizeText(a, I()), o = V.sanitizeText(o, I()), !r || R[r] === void 0) {
    let c = new Error(
      'Incorrect usage of "cherryPick". Source commit id should exist and provided'
    );
    throw c.hash = {
      text: "cherryPick " + r + " " + a,
      token: "cherryPick " + r + " " + a,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ["cherry-pick abc"]
    }, c;
  }
  let p = R[r], n = p.branch;
  if (p.type === $.MERGE) {
    let c = new Error(
      'Incorrect usage of "cherryPick". Source commit should not be a merge commit'
    );
    throw c.hash = {
      text: "cherryPick " + r + " " + a,
      token: "cherryPick " + r + " " + a,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ["cherry-pick abc"]
    }, c;
  }
  if (!a || R[a] === void 0) {
    if (n === A) {
      let h = new Error(
        'Incorrect usage of "cherryPick". Source commit is already on current branch'
      );
      throw h.hash = {
        text: "cherryPick " + r + " " + a,
        token: "cherryPick " + r + " " + a,
        line: "1",
        loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
        expected: ["cherry-pick abc"]
      }, h;
    }
    const c = R[L[A]];
    if (c === void 0 || !c) {
      let h = new Error(
        'Incorrect usage of "cherry-pick". Current branch (' + A + ")has no commits"
      );
      throw h.hash = {
        text: "cherryPick " + r + " " + a,
        token: "cherryPick " + r + " " + a,
        line: "1",
        loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
        expected: ["cherry-pick abc"]
      }, h;
    }
    const u = {
      id: U + "-" + be(),
      message: "cherry-picked " + p + " into " + A,
      seq: U++,
      parents: [G == null ? null : G.id, p.id],
      branch: A,
      type: $.CHERRY_PICK,
      tag: o ?? "cherry-pick:" + p.id
    };
    G = u, R[u.id] = u, L[A] = u.id, N.debug(L), N.debug("in cherryPick");
  }
}, we = function(r) {
  if (r = V.sanitizeText(r, I()), L[r] === void 0) {
    let a = new Error(
      'Trying to checkout branch which is not yet created. (Help try using "branch ' + r + '")'
    );
    throw a.hash = {
      text: "checkout " + r,
      token: "checkout " + r,
      line: "1",
      loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
      expected: ['"branch ' + r + '"']
    }, a;
  } else {
    A = r;
    const a = L[A];
    G = R[a];
  }
};
function xe(r, a, o) {
  const p = r.indexOf(a);
  p === -1 ? r.push(o) : r.splice(p, 1, o);
}
function Te(r) {
  const a = r.reduce((n, c) => n.seq > c.seq ? n : c, r[0]);
  let o = "";
  r.forEach(function(n) {
    n === a ? o += "	*" : o += "	|";
  });
  const p = [o, a.id, a.seq];
  for (let n in L)
    L[n] === a.id && p.push(n);
  if (N.debug(p.join(" ")), a.parents && a.parents.length == 2) {
    const n = R[a.parents[0]];
    xe(r, a, n), r.push(R[a.parents[1]]);
  } else {
    if (a.parents.length == 0)
      return;
    {
      const n = R[a.parents];
      xe(r, a, n);
    }
  }
  r = Ue(r, (n) => n.id), Te(r);
}
const tt = function() {
  N.debug(R);
  const r = ve()[0];
  Te([r]);
}, rt = function() {
  R = {}, G = null;
  let r = I().gitGraph.mainBranchName, a = I().gitGraph.mainBranchOrder;
  L = {}, L[r] = null, Z = {}, Z[r] = { name: r, order: a }, A = r, U = 0, Be();
}, it = function() {
  return Object.values(Z).map((a, o) => a.order !== null ? a : {
    ...a,
    order: parseFloat(`0.${o}`, 10)
  }).sort((a, o) => a.order - o.order).map(({ name: a }) => ({ name: a }));
}, st = function() {
  return L;
}, at = function() {
  return R;
}, ve = function() {
  const r = Object.keys(R).map(function(a) {
    return R[a];
  });
  return r.forEach(function(a) {
    N.debug(a.id);
  }), r.sort((a, o) => a.seq - o.seq), r;
}, nt = function() {
  return A;
}, ct = function() {
  return ye;
}, ot = function() {
  return G;
}, $ = {
  NORMAL: 0,
  REVERSE: 1,
  HIGHLIGHT: 2,
  MERGE: 3,
  CHERRY_PICK: 4
}, lt = {
  parseDirective: Fe,
  getConfig: () => I().gitGraph,
  setDirection: Je,
  setOptions: We,
  getOptions: Xe,
  commit: Qe,
  branch: Ze,
  merge: $e,
  cherryPick: et,
  checkout: we,
  //reset,
  prettyPrint: tt,
  clear: rt,
  getBranchesAsObjArray: it,
  getBranches: st,
  getCommits: at,
  getCommitsArray: ve,
  getCurrentBranch: nt,
  getDirection: ct,
  getHead: ot,
  setAccTitle: Oe,
  getAccTitle: Ie,
  getAccDescription: Ge,
  setAccDescription: Pe,
  setDiagramTitle: Ne,
  getDiagramTitle: He,
  commitType: $
};
let X = {};
const D = {
  NORMAL: 0,
  REVERSE: 1,
  HIGHLIGHT: 2,
  MERGE: 3,
  CHERRY_PICK: 4
}, F = 8;
let C = {}, ee = {}, ne = [], te = 0, S = "LR";
const ht = () => {
  C = {}, ee = {}, X = {}, te = 0, ne = [], S = "LR";
}, Le = (r) => {
  const a = document.createElementNS("http://www.w3.org/2000/svg", "text");
  let o = [];
  typeof r == "string" ? o = r.split(/\\n|\n|<br\s*\/?>/gi) : Array.isArray(r) ? o = r : o = [];
  for (const p of o) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    n.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), n.setAttribute("dy", "1em"), n.setAttribute("x", "0"), n.setAttribute("class", "row"), n.textContent = p.trim(), a.appendChild(n);
  }
  return a;
}, _e = (r, a, o) => {
  const p = fe().gitGraph, n = r.append("g").attr("class", "commit-bullets"), c = r.append("g").attr("class", "commit-labels");
  let u = 0;
  S === "TB" && (u = 30), Object.keys(a).sort((x, l) => a[x].seq - a[l].seq).forEach((x) => {
    const l = a[x], g = S === "TB" ? u + 10 : C[l.branch].pos, f = S === "TB" ? C[l.branch].pos : u + 10;
    if (o) {
      let s, _ = l.customType !== void 0 && l.customType !== "" ? l.customType : l.type;
      switch (_) {
        case D.NORMAL:
          s = "commit-normal";
          break;
        case D.REVERSE:
          s = "commit-reverse";
          break;
        case D.HIGHLIGHT:
          s = "commit-highlight";
          break;
        case D.MERGE:
          s = "commit-merge";
          break;
        case D.CHERRY_PICK:
          s = "commit-cherry-pick";
          break;
        default:
          s = "commit-normal";
      }
      if (_ === D.HIGHLIGHT) {
        const T = n.append("rect");
        T.attr("x", f - 10), T.attr("y", g - 10), T.attr("height", 20), T.attr("width", 20), T.attr(
          "class",
          `commit ${l.id} commit-highlight${C[l.branch].index % F} ${s}-outer`
        ), n.append("rect").attr("x", f - 6).attr("y", g - 6).attr("height", 12).attr("width", 12).attr(
          "class",
          `commit ${l.id} commit${C[l.branch].index % F} ${s}-inner`
        );
      } else if (_ === D.CHERRY_PICK)
        n.append("circle").attr("cx", f).attr("cy", g).attr("r", 10).attr("class", `commit ${l.id} ${s}`), n.append("circle").attr("cx", f - 3).attr("cy", g + 2).attr("r", 2.75).attr("fill", "#fff").attr("class", `commit ${l.id} ${s}`), n.append("circle").attr("cx", f + 3).attr("cy", g + 2).attr("r", 2.75).attr("fill", "#fff").attr("class", `commit ${l.id} ${s}`), n.append("line").attr("x1", f + 3).attr("y1", g + 1).attr("x2", f).attr("y2", g - 5).attr("stroke", "#fff").attr("class", `commit ${l.id} ${s}`), n.append("line").attr("x1", f - 3).attr("y1", g + 1).attr("x2", f).attr("y2", g - 5).attr("stroke", "#fff").attr("class", `commit ${l.id} ${s}`);
      else {
        const T = n.append("circle");
        if (T.attr("cx", f), T.attr("cy", g), T.attr("r", l.type === D.MERGE ? 9 : 10), T.attr(
          "class",
          `commit ${l.id} commit${C[l.branch].index % F}`
        ), _ === D.MERGE) {
          const O = n.append("circle");
          O.attr("cx", f), O.attr("cy", g), O.attr("r", 6), O.attr(
            "class",
            `commit ${s} ${l.id} commit${C[l.branch].index % F}`
          );
        }
        _ === D.REVERSE && n.append("path").attr("d", `M ${f - 5},${g - 5}L${f + 5},${g + 5}M${f - 5},${g + 5}L${f + 5},${g - 5}`).attr(
          "class",
          `commit ${s} ${l.id} commit${C[l.branch].index % F}`
        );
      }
    }
    if (S === "TB" ? ee[l.id] = { x: f, y: u + 10 } : ee[l.id] = { x: u + 10, y: g }, o) {
      if (l.type !== D.CHERRY_PICK && (l.customId && l.type === D.MERGE || l.type !== D.MERGE) && p.showCommitLabel) {
        const T = c.append("g"), O = T.insert("rect").attr("class", "commit-label-bkg"), E = T.append("text").attr("x", u).attr("y", g + 25).attr("class", "commit-label").text(l.id);
        let d = E.node().getBBox();
        if (O.attr("x", u + 10 - d.width / 2 - 2).attr("y", g + 13.5).attr("width", d.width + 2 * 2).attr("height", d.height + 2 * 2), S === "TB" && (O.attr("x", f - (d.width + 4 * 4 + 5)).attr("y", g - 12), E.attr("x", f - (d.width + 4 * 4)).attr("y", g + d.height - 12)), S !== "TB" && E.attr("x", u + 10 - d.width / 2), p.rotateCommitLabel)
          if (S === "TB")
            E.attr("transform", "rotate(-45, " + f + ", " + g + ")"), O.attr("transform", "rotate(-45, " + f + ", " + g + ")");
          else {
            let y = -7.5 - (d.width + 10) / 25 * 9.5, H = 10 + d.width / 25 * 8.5;
            T.attr(
              "transform",
              "translate(" + y + ", " + H + ") rotate(-45, " + u + ", " + g + ")"
            );
          }
      }
      if (l.tag) {
        const T = c.insert("polygon"), O = c.append("circle"), E = c.append("text").attr("y", g - 16).attr("class", "tag-label").text(l.tag);
        let d = E.node().getBBox();
        E.attr("x", u + 10 - d.width / 2);
        const y = d.height / 2, H = g - 19.2;
        T.attr("class", "tag-label-bkg").attr(
          "points",
          `
          ${u - d.width / 2 - 4 / 2},${H + 2}
          ${u - d.width / 2 - 4 / 2},${H - 2}
          ${u + 10 - d.width / 2 - 4},${H - y - 2}
          ${u + 10 + d.width / 2 + 4},${H - y - 2}
          ${u + 10 + d.width / 2 + 4},${H + y + 2}
          ${u + 10 - d.width / 2 - 4},${H + y + 2}`
        ), O.attr("cx", u - d.width / 2 + 4 / 2).attr("cy", H).attr("r", 1.5).attr("class", "tag-hole"), S === "TB" && (T.attr("class", "tag-label-bkg").attr(
          "points",
          `
            ${f},${u + 2}
            ${f},${u - 2}
            ${f + 10},${u - y - 2}
            ${f + 10 + d.width + 4},${u - y - 2}
            ${f + 10 + d.width + 4},${u + y + 2}
            ${f + 10},${u + y + 2}`
        ).attr("transform", "translate(12,12) rotate(45, " + f + "," + u + ")"), O.attr("cx", f + 4 / 2).attr("cy", u).attr("transform", "translate(12,12) rotate(45, " + f + "," + u + ")"), E.attr("x", f + 5).attr("y", u + 3).attr("transform", "translate(14,14) rotate(45, " + f + "," + u + ")"));
      }
    }
    u += 50, u > te && (te = u);
  });
}, mt = (r, a, o) => Object.keys(o).filter((c) => o[c].branch === a.branch && o[c].seq > r.seq && o[c].seq < a.seq).length > 0, Q = (r, a, o = 0) => {
  const p = r + Math.abs(r - a) / 2;
  if (o > 5)
    return p;
  if (ne.every((u) => Math.abs(u - p) >= 10))
    return ne.push(p), p;
  const c = Math.abs(r - a);
  return Q(r, a - c / 5, o + 1);
}, ut = (r, a, o, p) => {
  const n = ee[a.id], c = ee[o.id], u = mt(a, o, p);
  let h = "", w = "", x = 0, l = 0, g = C[o.branch].index, f;
  if (u) {
    h = "A 10 10, 0, 0, 0,", w = "A 10 10, 0, 0, 1,", x = 10, l = 10, g = C[o.branch].index;
    const s = n.y < c.y ? Q(n.y, c.y) : Q(c.y, n.y), _ = n.x < c.x ? Q(n.x, c.x) : Q(c.x, n.x);
    S === "TB" ? n.x < c.x ? f = `M ${n.x} ${n.y} L ${_ - x} ${n.y} ${w} ${_} ${n.y + l} L ${_} ${c.y - x} ${h} ${_ + l} ${c.y} L ${c.x} ${c.y}` : f = `M ${n.x} ${n.y} L ${_ + x} ${n.y} ${h} ${_} ${n.y + l} L ${_} ${c.y - x} ${w} ${_ - l} ${c.y} L ${c.x} ${c.y}` : n.y < c.y ? f = `M ${n.x} ${n.y} L ${n.x} ${s - x} ${h} ${n.x + l} ${s} L ${c.x - x} ${s} ${w} ${c.x} ${s + l} L ${c.x} ${c.y}` : f = `M ${n.x} ${n.y} L ${n.x} ${s + x} ${w} ${n.x + l} ${s} L ${c.x - x} ${s} ${h} ${c.x} ${s - l} L ${c.x} ${c.y}`;
  } else
    S === "TB" ? (n.x < c.x && (h = "A 20 20, 0, 0, 0,", w = "A 20 20, 0, 0, 1,", x = 20, l = 20, g = C[o.branch].index, f = `M ${n.x} ${n.y} L ${c.x - x} ${n.y} ${w} ${c.x} ${n.y + l} L ${c.x} ${c.y}`), n.x > c.x && (h = "A 20 20, 0, 0, 0,", w = "A 20 20, 0, 0, 1,", x = 20, l = 20, g = C[a.branch].index, f = `M ${n.x} ${n.y} L ${n.x} ${c.y - x} ${w} ${n.x - l} ${c.y} L ${c.x} ${c.y}`), n.x === c.x && (g = C[a.branch].index, f = `M ${n.x} ${n.y} L ${n.x + x} ${n.y} ${h} ${n.x + l} ${c.y + x} L ${c.x} ${c.y}`)) : (n.y < c.y && (h = "A 20 20, 0, 0, 0,", x = 20, l = 20, g = C[o.branch].index, f = `M ${n.x} ${n.y} L ${n.x} ${c.y - x} ${h} ${n.x + l} ${c.y} L ${c.x} ${c.y}`), n.y > c.y && (h = "A 20 20, 0, 0, 0,", x = 20, l = 20, g = C[a.branch].index, f = `M ${n.x} ${n.y} L ${c.x - x} ${n.y} ${h} ${c.x} ${n.y - l} L ${c.x} ${c.y}`), n.y === c.y && (g = C[a.branch].index, f = `M ${n.x} ${n.y} L ${n.x} ${c.y - x} ${h} ${n.x + l} ${c.y} L ${c.x} ${c.y}`));
  r.append("path").attr("d", f).attr("class", "arrow arrow" + g % F);
}, pt = (r, a) => {
  const o = r.append("g").attr("class", "commit-arrows");
  Object.keys(a).forEach((p) => {
    const n = a[p];
    n.parents && n.parents.length > 0 && n.parents.forEach((c) => {
      ut(o, a[c], n, a);
    });
  });
}, ft = (r, a) => {
  const o = fe().gitGraph, p = r.append("g");
  a.forEach((n, c) => {
    const u = c % F, h = C[n.name].pos, w = p.append("line");
    w.attr("x1", 0), w.attr("y1", h), w.attr("x2", te), w.attr("y2", h), w.attr("class", "branch branch" + u), S === "TB" && (w.attr("y1", 30), w.attr("x1", h), w.attr("y2", te), w.attr("x2", h)), ne.push(h);
    let x = n.name;
    const l = Le(x), g = p.insert("rect"), s = p.insert("g").attr("class", "branchLabel").insert("g").attr("class", "label branch-label" + u);
    s.node().appendChild(l);
    let _ = l.getBBox();
    g.attr("class", "branchLabelBkg label" + u).attr("rx", 4).attr("ry", 4).attr("x", -_.width - 4 - (o.rotateCommitLabel === !0 ? 30 : 0)).attr("y", -_.height / 2 + 8).attr("width", _.width + 18).attr("height", _.height + 4), s.attr(
      "transform",
      "translate(" + (-_.width - 14 - (o.rotateCommitLabel === !0 ? 30 : 0)) + ", " + (h - _.height / 2 - 1) + ")"
    ), S === "TB" && (g.attr("x", h - _.width / 2 - 10).attr("y", 0), s.attr("transform", "translate(" + (h - _.width / 2 - 5) + ", 0)")), S !== "TB" && g.attr("transform", "translate(-19, " + (h - _.height / 2) + ")");
  });
}, bt = function(r, a, o, p) {
  ht();
  const n = fe(), c = n.gitGraph;
  N.debug("in gitgraph renderer", r + `
`, "id:", a, o), X = p.db.getCommits();
  const u = p.db.getBranchesAsObjArray();
  S = p.db.getDirection();
  const h = ze(`[id="${a}"]`);
  let w = 0;
  u.forEach((x, l) => {
    const g = Le(x.name), f = h.append("g"), s = f.insert("g").attr("class", "branchLabel"), _ = s.insert("g").attr("class", "label branch-label");
    _.node().appendChild(g);
    let T = g.getBBox();
    C[x.name] = { pos: w, index: l }, w += 50 + (c.rotateCommitLabel ? 40 : 0) + (S === "TB" ? T.width / 2 : 0), _.remove(), s.remove(), f.remove();
  }), _e(h, X, !1), c.showBranches && ft(h, u), pt(h, X), _e(h, X, !0), je.insertTitle(
    h,
    "gitTitleText",
    c.titleTopMargin,
    p.db.getDiagramTitle()
  ), qe(
    void 0,
    h,
    c.diagramPadding,
    c.useMaxWidth ?? n.useMaxWidth
  );
}, gt = {
  draw: bt
}, dt = (r) => `
  .commit-id,
  .commit-msg,
  .branch-label {
    fill: lightgrey;
    color: lightgrey;
    font-family: 'trebuchet ms', verdana, arial, sans-serif;
    font-family: var(--mermaid-font-family);
  }
  ${[0, 1, 2, 3, 4, 5, 6, 7].map(
  (a) => `
        .branch-label${a} { fill: ${r["gitBranchLabel" + a]}; }
        .commit${a} { stroke: ${r["git" + a]}; fill: ${r["git" + a]}; }
        .commit-highlight${a} { stroke: ${r["gitInv" + a]}; fill: ${r["gitInv" + a]}; }
        .label${a}  { fill: ${r["git" + a]}; }
        .arrow${a} { stroke: ${r["git" + a]}; }
        `
).join(`
`)}

  .branch {
    stroke-width: 1;
    stroke: ${r.lineColor};
    stroke-dasharray: 2;
  }
  .commit-label { font-size: ${r.commitLabelFontSize}; fill: ${r.commitLabelColor};}
  .commit-label-bkg { font-size: ${r.commitLabelFontSize}; fill: ${r.commitLabelBackground}; opacity: 0.5; }
  .tag-label { font-size: ${r.tagLabelFontSize}; fill: ${r.tagLabelColor};}
  .tag-label-bkg { fill: ${r.tagLabelBackground}; stroke: ${r.tagLabelBorder}; }
  .tag-hole { fill: ${r.textColor}; }

  .commit-merge {
    stroke: ${r.primaryColor};
    fill: ${r.primaryColor};
  }
  .commit-reverse {
    stroke: ${r.primaryColor};
    fill: ${r.primaryColor};
    stroke-width: 3;
  }
  .commit-highlight-outer {
  }
  .commit-highlight-inner {
    stroke: ${r.primaryColor};
    fill: ${r.primaryColor};
  }

  .arrow { stroke-width: 8; stroke-linecap: round; fill: none}
  .gitTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${r.textColor};
  }
`, kt = dt, _t = {
  parser: Ye,
  db: lt,
  renderer: gt,
  styles: kt
};
export {
  _t as diagram
};
