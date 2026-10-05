import{a as oe}from"./chunk-SDIBIOXT.mjs";import{a as de}from"./chunk-R2KH53MI.mjs";import{b as le,c as ce}from"./chunk-52IMQVNL.mjs";import"./chunk-MFYRHTYG.mjs";import{h as te}from"./chunk-3SEI7E7V.mjs";import"./chunk-JCBDXJ5W.mjs";import"./chunk-OCMJQKYE.mjs";import"./chunk-MNT3HHAC.mjs";import"./chunk-TECWHJ6D.mjs";import"./chunk-F6PIGZHG.mjs";import"./chunk-JGXDHUYS.mjs";import"./chunk-TINYC7RT.mjs";import"./chunk-TDFULVG6.mjs";import{b as re,c as ie,d as ne,e as ae}from"./chunk-MIE3LDYP.mjs";import{g as ee,p as se}from"./chunk-QADHU5CF.mjs";import"./chunk-ZZ52EIBP.mjs";import{$ as v,H as F,T as zt,U as Kt,V as Xt,W as Jt,X as qt,Y as Qt,Z as Zt,z as Ht}from"./chunk-FE53TMRB.mjs";import{b,h as ft}from"./chunk-L2B47AAZ.mjs";import{a as u}from"./chunk-QVIEFLGF.mjs";var Rt=(function(){var t=u(function(V,o,f,a){for(f=f||{},a=V.length;a--;f[V[a]]=o);return f},"o"),e=[1,2],s=[1,3],n=[1,4],i=[2,4],d=[1,9],h=[1,11],p=[1,16],c=[1,17],y=[1,18],m=[1,19],_=[1,33],I=[1,20],O=[1,21],x=[1,22],S=[1,23],R=[1,24],C=[1,26],G=[1,27],w=[1,28],P=[1,29],D=[1,30],X=[1,31],it=[1,32],nt=[1,35],at=[1,36],ot=[1,37],lt=[1,38],J=[1,34],g=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],ct=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],Wt=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],Dt={trace:u(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:u(function(o,f,a,T,E,r,q){var l=r.length-1;switch(E){case 3:return T.setRootDoc(r[l]),r[l];break;case 4:this.$=[];break;case 5:r[l]!="nl"&&(r[l-1].push(r[l]),this.$=r[l-1]);break;case 6:case 7:this.$=r[l];break;case 8:this.$="nl";break;case 12:this.$=r[l];break;case 13:let dt=r[l-1];dt.description=T.trimColon(r[l]),this.$=dt;break;case 14:this.$={stmt:"relation",state1:r[l-2],state2:r[l]};break;case 15:let ht=T.trimColon(r[l]);this.$={stmt:"relation",state1:r[l-3],state2:r[l-1],description:ht};break;case 19:this.$={stmt:"state",id:r[l-3],type:"default",description:"",doc:r[l-1]};break;case 20:var M=r[l],B=r[l-2].trim();if(r[l].match(":")){var et=r[l].split(":");M=et[0],B=[B,et[1]]}this.$={stmt:"state",id:M,type:"default",description:B};break;case 21:this.$={stmt:"state",id:r[l-3],type:"default",description:r[l-5],doc:r[l-1]};break;case 22:this.$={stmt:"state",id:r[l],type:"fork"};break;case 23:this.$={stmt:"state",id:r[l],type:"join"};break;case 24:this.$={stmt:"state",id:r[l],type:"choice"};break;case 25:this.$={stmt:"state",id:T.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:r[l-1].trim(),note:{position:r[l-2].trim(),text:r[l].trim()}};break;case 29:this.$=r[l].trim(),T.setAccTitle(this.$);break;case 30:case 31:this.$=r[l].trim(),T.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:r[l-3],url:r[l-2],tooltip:r[l-1]};break;case 33:this.$={stmt:"click",id:r[l-3],url:r[l-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:r[l-1].trim(),classes:r[l].trim()};break;case 36:this.$={stmt:"style",id:r[l-1].trim(),styleClass:r[l].trim()};break;case 37:this.$={stmt:"applyClass",id:r[l-1].trim(),styleClass:r[l].trim()};break;case 38:T.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:T.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:T.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:T.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:r[l].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:r[l-2].trim(),classes:[r[l].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:r[l-2].trim(),classes:[r[l].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:e,5:s,6:n},{1:[3]},{3:5,4:e,5:s,6:n},{3:6,4:e,5:s,6:n},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],i,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:d,5:h,8:8,9:10,10:12,11:13,12:14,13:15,16:p,17:c,19:y,22:m,24:_,25:I,26:O,27:x,28:S,29:R,32:25,33:C,35:G,37:w,38:P,41:D,45:X,48:it,51:nt,52:at,53:ot,54:lt,57:J},t(g,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:p,17:c,19:y,22:m,24:_,25:I,26:O,27:x,28:S,29:R,32:25,33:C,35:G,37:w,38:P,41:D,45:X,48:it,51:nt,52:at,53:ot,54:lt,57:J},t(g,[2,7]),t(g,[2,8]),t(g,[2,9]),t(g,[2,10]),t(g,[2,11]),t(g,[2,12],{14:[1,40],15:[1,41]}),t(g,[2,16]),{18:[1,42]},t(g,[2,18],{20:[1,43]}),{23:[1,44]},t(g,[2,22]),t(g,[2,23]),t(g,[2,24]),t(g,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(g,[2,28]),{34:[1,49]},{36:[1,50]},t(g,[2,31]),{13:51,24:_,57:J},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(ct,[2,44],{58:[1,56]}),t(ct,[2,45],{58:[1,57]}),t(g,[2,38]),t(g,[2,39]),t(g,[2,40]),t(g,[2,41]),t(g,[2,6]),t(g,[2,13]),{13:58,24:_,57:J},t(g,[2,17]),t(Wt,i,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(g,[2,29]),t(g,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(g,[2,14],{14:[1,71]}),{4:d,5:h,8:8,9:10,10:12,11:13,12:14,13:15,16:p,17:c,19:y,21:[1,72],22:m,24:_,25:I,26:O,27:x,28:S,29:R,32:25,33:C,35:G,37:w,38:P,41:D,45:X,48:it,51:nt,52:at,53:ot,54:lt,57:J},t(g,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(g,[2,34]),t(g,[2,35]),t(g,[2,36]),t(g,[2,37]),t(ct,[2,46]),t(ct,[2,47]),t(g,[2,15]),t(g,[2,19]),t(Wt,i,{7:78}),t(g,[2,26]),t(g,[2,27]),{5:[1,79]},{5:[1,80]},{4:d,5:h,8:8,9:10,10:12,11:13,12:14,13:15,16:p,17:c,19:y,21:[1,81],22:m,24:_,25:I,26:O,27:x,28:S,29:R,32:25,33:C,35:G,37:w,38:P,41:D,45:X,48:it,51:nt,52:at,53:ot,54:lt,57:J},t(g,[2,32]),t(g,[2,33]),t(g,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:u(function(o,f){if(f.recoverable)this.trace(o);else{var a=new Error(o);throw a.hash=f,a}},"parseError"),parse:u(function(o){var f=this,a=[0],T=[],E=[null],r=[],q=this.table,l="",M=0,B=0,et=0,dt=2,ht=1,Ge=r.slice.call(arguments,1),k=Object.create(this.lexer),j={yy:{}};for(var Ct in this.yy)Object.prototype.hasOwnProperty.call(this.yy,Ct)&&(j.yy[Ct]=this.yy[Ct]);k.setInput(o,j.yy),j.yy.lexer=k,j.yy.parser=this,typeof k.yylloc>"u"&&(k.yylloc={});var At=k.yylloc;r.push(At);var Pe=k.options&&k.options.ranges;typeof j.yy.parseError=="function"?this.parseError=j.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Ze(N){a.length=a.length-2*N,E.length=E.length-N,r.length=r.length-N}u(Ze,"popStack");function Me(){var N;return N=T.pop()||k.lex()||ht,typeof N!="number"&&(N instanceof Array&&(T=N,N=T.pop()),N=f.symbols_[N]||N),N}u(Me,"lex");for(var A,Lt,H,$,ts,vt,Q={},ut,Y,jt,pt;;){if(H=a[a.length-1],this.defaultActions[H]?$=this.defaultActions[H]:((A===null||typeof A>"u")&&(A=Me()),$=q[H]&&q[H][A]),typeof $>"u"||!$.length||!$[0]){var It="";pt=[];for(ut in q[H])this.terminals_[ut]&&ut>dt&&pt.push("'"+this.terminals_[ut]+"'");k.showPosition?It="Parse error on line "+(M+1)+`:
`+k.showPosition()+`
Expecting `+pt.join(", ")+", got '"+(this.terminals_[A]||A)+"'":It="Parse error on line "+(M+1)+": Unexpected "+(A==ht?"end of input":"'"+(this.terminals_[A]||A)+"'"),this.parseError(It,{text:k.match,token:this.terminals_[A]||A,line:k.yylineno,loc:At,expected:pt})}if($[0]instanceof Array&&$.length>1)throw new Error("Parse Error: multiple actions possible at state: "+H+", token: "+A);switch($[0]){case 1:a.push(A),E.push(k.yytext),r.push(k.yylloc),a.push($[1]),A=null,Lt?(A=Lt,Lt=null):(B=k.yyleng,l=k.yytext,M=k.yylineno,At=k.yylloc,et>0&&et--);break;case 2:if(Y=this.productions_[$[1]][1],Q.$=E[E.length-Y],Q._$={first_line:r[r.length-(Y||1)].first_line,last_line:r[r.length-1].last_line,first_column:r[r.length-(Y||1)].first_column,last_column:r[r.length-1].last_column},Pe&&(Q._$.range=[r[r.length-(Y||1)].range[0],r[r.length-1].range[1]]),vt=this.performAction.apply(Q,[l,B,M,j.yy,$[1],E,r].concat(Ge)),typeof vt<"u")return vt;Y&&(a=a.slice(0,-1*Y*2),E=E.slice(0,-1*Y),r=r.slice(0,-1*Y)),a.push(this.productions_[$[1]][0]),E.push(Q.$),r.push(Q._$),jt=q[a[a.length-2]][a[a.length-1]],a.push(jt);break;case 3:return!0}}return!0},"parse")},$e=(function(){var V={EOF:1,parseError:u(function(f,a){if(this.yy.parser)this.yy.parser.parseError(f,a);else throw new Error(f)},"parseError"),setInput:u(function(o,f){return this.yy=f||this.yy||{},this._input=o,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:u(function(){var o=this._input[0];this.yytext+=o,this.yyleng++,this.offset++,this.match+=o,this.matched+=o;var f=o.match(/(?:\r\n?|\n).*/g);return f?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),o},"input"),unput:u(function(o){var f=o.length,a=o.split(/(?:\r\n?|\n)/g);this._input=o+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-f),this.offset-=f;var T=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),a.length-1&&(this.yylineno-=a.length-1);var E=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:a?(a.length===T.length?this.yylloc.first_column:0)+T[T.length-a.length].length-a[0].length:this.yylloc.first_column-f},this.options.ranges&&(this.yylloc.range=[E[0],E[0]+this.yyleng-f]),this.yyleng=this.yytext.length,this},"unput"),more:u(function(){return this._more=!0,this},"more"),reject:u(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:u(function(o){this.unput(this.match.slice(o))},"less"),pastInput:u(function(){var o=this.matched.substr(0,this.matched.length-this.match.length);return(o.length>20?"...":"")+o.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:u(function(){var o=this.match;return o.length<20&&(o+=this._input.substr(0,20-o.length)),(o.substr(0,20)+(o.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:u(function(){var o=this.pastInput(),f=new Array(o.length+1).join("-");return o+this.upcomingInput()+`
`+f+"^"},"showPosition"),test_match:u(function(o,f){var a,T,E;if(this.options.backtrack_lexer&&(E={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(E.yylloc.range=this.yylloc.range.slice(0))),T=o[0].match(/(?:\r\n?|\n).*/g),T&&(this.yylineno+=T.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:T?T[T.length-1].length-T[T.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],a=this.performAction.call(this,this.yy,this,f,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),a)return a;if(this._backtrack){for(var r in E)this[r]=E[r];return!1}return!1},"test_match"),next:u(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var o,f,a,T;this._more||(this.yytext="",this.match="");for(var E=this._currentRules(),r=0;r<E.length;r++)if(a=this._input.match(this.rules[E[r]]),a&&(!f||a[0].length>f[0].length)){if(f=a,T=r,this.options.backtrack_lexer){if(o=this.test_match(a,E[r]),o!==!1)return o;if(this._backtrack){f=!1;continue}else return!1}else if(!this.options.flex)break}return f?(o=this.test_match(f,E[T]),o!==!1?o:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:u(function(){var f=this.next();return f||this.lex()},"lex"),begin:u(function(f){this.conditionStack.push(f)},"begin"),popState:u(function(){var f=this.conditionStack.length-1;return f>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:u(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:u(function(f){return f=this.conditionStack.length-1-Math.abs(f||0),f>=0?this.conditionStack[f]:"INITIAL"},"topState"),pushState:u(function(f){this.begin(f)},"pushState"),stateStackSize:u(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:u(function(f,a,T,E){function r(){let l=a.yytext.indexOf("%%");if(l===0)return!1;if(l>0){let M=a.yytext.slice(0,l),B=a.yytext.slice(l);B&&f.lexer.unput(B),a.yytext=M}return!0}u(r,"processId");var q=E;switch(T){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;break;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;break;case 17:return this.popState(),"acc_title_value";break;case 18:return this.begin("acc_descr"),35;break;case 19:return this.popState(),"acc_descr_value";break;case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;break;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";break;case 25:return this.popState(),this.pushState("CLASSDEFID"),42;break;case 26:return this.popState(),43;break;case 27:return this.pushState("CLASS"),48;break;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;break;case 29:return this.popState(),50;break;case 30:return this.pushState("STYLE"),45;break;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;break;case 32:return this.popState(),47;break;case 33:return this.pushState("SCALE"),17;break;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),a.yytext=a.yytext.slice(0,-8).trim(),25;break;case 38:return this.popState(),a.yytext=a.yytext.slice(0,-8).trim(),26;break;case 39:return this.popState(),a.yytext=a.yytext.slice(0,-10).trim(),27;break;case 40:return this.popState(),a.yytext=a.yytext.slice(0,-8).trim(),25;break;case 41:return this.popState(),a.yytext=a.yytext.slice(0,-8).trim(),26;break;case 42:return this.popState(),a.yytext=a.yytext.slice(0,-10).trim(),27;break;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";break;case 49:if(!r())return;return this.popState(),"ID";break;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:throw new Error('Error: State name must be a single word. Found: "'+a.yytext.trim()+'"');case 53:return 19;case 54:this.popState();break;case 55:return this.popState(),this.pushState("struct"),20;break;case 56:return this.popState(),21;break;case 57:break;case 58:return this.begin("NOTE"),29;break;case 59:return this.popState(),this.pushState("NOTE_ID"),59;break;case 60:return this.popState(),this.pushState("NOTE_ID"),60;break;case 61:this.popState(),this.pushState("FLOATING_NOTE");break;case 62:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";break;case 63:break;case 64:return"NOTE_TEXT";case 65:if(!r())return;return this.popState(),"ID";break;case 66:if(!r())return;return this.popState(),this.pushState("NOTE_TEXT"),24;break;case 67:return this.popState(),a.yytext=a.yytext.substr(2).trim(),31;break;case 68:return this.popState(),a.yytext=a.yytext.slice(0,-8).trim(),31;break;case 69:return 6;case 70:return 6;case 71:return 16;case 72:return 57;case 73:return r()?24:void 0;case 74:return a.yytext=a.yytext.trim(),14;break;case 75:return 15;case 76:return 28;case 77:return 58;case 78:return 5;case 79:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:\w+\s+\w+.*?\{)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,56,57,58,72,73,74,75,76,77],inclusive:!1},FLOATING_NOTE_ID:{rules:[65],inclusive:!1},FLOATING_NOTE:{rules:[62,63,64],inclusive:!1},NOTE_TEXT:{rules:[67,68],inclusive:!1},NOTE_ID:{rules:[66],inclusive:!1},NOTE:{rules:[59,60,61],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54,55],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,55,58,69,70,71,72,73,74,75,77,78,79],inclusive:!0}}};return V})();Dt.lexer=$e;function xt(){this.yy={}}return u(xt,"Parser"),xt.prototype=Dt,Dt.Parser=xt,new xt})();Rt.parser=Rt;var he=Rt;var U="state",z="root",st="relation",ue="classDef",pe="style",fe="applyClass",K="default",St="divider",wt="fill:none",Nt="fill: #333";var Ot="markdown",$t="normal",gt="rect",mt="rectWithTitle",Se="stateStart",ge="stateEnd",yt="divider",Gt="roundedWithTitle",me="note",ye="noteGroup",Z="statediagram",Be="state",Te=`${Z}-${Be}`,Pt="transition",Ye="note",Fe="note-edge",Ee=`${Pt} ${Fe}`,be=`${Z}-${Ye}`,Ve="cluster",_e=`${Z}-${Ve}`,Ue="cluster-alt",ke=`${Z}-${Ue}`,Mt="parent",Bt="note",De="state",Tt="----",xe=`${Tt}${Bt}`,Yt=`${Tt}${Mt}`;var bt=new Map,W=0,Le=0,rt=new Map,We=u((t,e,s,n)=>{if(t===yt&&s?.id!==void 0&&rt.has(s.id)){let h=rt.get(s.id);return rt.set(e,h),h}let i=Le++,d=n?void 0:i;return rt.set(e,d),d},"colorSlotFor");function Ft(t="",e=0,s="",n=Tt){let i=s!==null&&s.length>0?`${n}${s}`:"";return`${De}-${t}${i}-${e}`}u(Ft,"stateDomId");var je=u((t,e,s,n,i,d,h,p)=>{b.trace("items",e),e.forEach(c=>{switch(c.stmt){case U:tt(t,c,s,n,i,d,h,p);break;case K:tt(t,c,s,n,i,d,h,p);break;case st:{tt(t,c.state1,s,n,i,d,h,p),tt(t,c.state2,s,n,i,d,h,p);let y=h==="neo",m={id:"edge"+W,start:c.state1.id,end:c.state2.id,arrowhead:"normal",arrowTypeEnd:y?"arrow_barb_neo":"arrow_barb",style:wt,labelStyle:"",label:F.sanitizeText(c.description??"",v()),arrowheadStyle:Nt,labelpos:"c",labelType:Ot,thickness:$t,classes:Pt,look:h};i.push(m),W++}break}})},"setupDoc"),Ce=u((t,e="TB")=>{let s=e;if(t.doc)for(let n of t.doc)n.stmt==="dir"&&(s=n.value);return s},"getDir");function Et(t,e,s){if(!e.id||e.id==="</join></fork>"||e.id==="</choice>")return;e.cssClasses&&(Array.isArray(e.cssCompiledStyles)||(e.cssCompiledStyles=[]),e.cssClasses.split(" ").forEach(i=>{let d=s.get(i);d&&(e.cssCompiledStyles=[...e.cssCompiledStyles??[],...d.styles])}));let n=t.find(i=>i.id===e.id);n?Object.assign(n,e):t.push(e)}u(Et,"insertOrUpdateNode");function He(t){return t?.classes?.join(" ")??""}u(He,"getClassesFromDbInfo");function ze(t){return t?.styles??[]}u(ze,"getStylesFromDbInfo");var tt=u((t,e,s,n,i,d,h,p)=>{let c=e.id,y=s.get(c),m=He(y),_=ze(y),I=v(),O=m.trim()!==""||_.length>0;if(b.info("dataFetcher parsedItem",e,y,_),c!=="root"){let x=gt;e.start===!0?x=Se:e.start===!1&&(x=ge),e.type!==K&&(x=e.type),bt.get(c)||bt.set(c,{id:c,shape:x,description:F.sanitizeText(c,I),cssClasses:`${m} ${Te}`,cssStyles:_});let S=bt.get(c);e.description&&(Array.isArray(S.description)?(S.shape=mt,S.description.push(e.description)):S.description?.length&&S.description.length>0?(S.shape=mt,S.description===c?S.description=[e.description]:S.description=[S.description,e.description]):(S.shape=gt,S.description=e.description),S.description=F.sanitizeTextOrArray(S.description,I)),S.description?.length===1&&S.shape===mt&&(S.type==="group"?S.shape=Gt:S.shape=gt),!S.type&&e.doc&&(b.info("Setting cluster for XCX",c,Ce(e)),S.type="group",S.isGroup=!0,S.dir=Ce(e),S.shape=e.type===St?yt:Gt,S.colorIndex=We(S.shape,c,t,O),S.cssClasses=`${S.cssClasses} ${_e} ${d?ke:""}`);let R={labelStyle:"",shape:S.shape,label:S.description,cssClasses:S.cssClasses,cssCompiledStyles:[],cssStyles:S.cssStyles,id:c,dir:S.dir,domId:Ft(c,W),type:S.type,isGroup:S.type==="group",colorIndex:S.colorIndex,padding:8,rx:10,ry:10,look:h,labelType:"markdown"};if(R.shape===yt&&(R.label=""),t&&t.id!=="root"&&(b.trace("Setting node ",c," to be child of its parent ",t.id),R.parentId=t.id),R.centerLabel=!0,e.note){let C={labelStyle:"",shape:me,label:e.note.text,labelType:"markdown",cssClasses:be,cssStyles:[],cssCompiledStyles:[],id:c+xe+"-"+W,domId:Ft(c,W,Bt),type:"node",isGroup:!1,padding:I.flowchart?.padding,look:h,position:e.note.position},G=c+Yt,w={labelStyle:"",shape:ye,label:e.note.text,cssClasses:S.cssClasses,cssStyles:[],id:c+Yt,domId:Ft(c,W,Mt),type:"group",isGroup:!0,padding:16,look:h,position:e.note.position};W++,w.id=G,C.parentId=G,Et(n,w,p),Et(n,C,p),Et(n,R,p);let P=c,D=C.id;e.note.position==="left of"&&(P=C.id,D=c),i.push({id:P+"-"+D,start:P,end:D,arrowhead:"none",arrowTypeEnd:"",style:wt,labelStyle:"",classes:Ee,pattern:"dashed",arrowheadStyle:Nt,labelpos:"c",labelType:Ot,thickness:$t,look:h})}else Et(n,R,p)}e.doc&&(b.trace("Adding nodes children "),je(e,e.doc,s,n,i,!d,h,p))},"dataFetcher"),ve=u(()=>{bt.clear(),W=0,Le=0,rt.clear()},"reset");var Ut=u((t,e="TB")=>{if(!t.doc)return e;let s=e;for(let n of t.doc)n.stmt==="dir"&&(s=n.value);return s},"getDir"),Ke=u(function(t,e){return e.db.getClasses()},"getClasses"),Xe=u(async function(t,e,s,n){b.info("REF0:"),b.info("Drawing state diagram (v2)",e);let{securityLevel:i,state:d,layout:h}=v();n.db.extract(n.db.getRootDocV2());let p=n.db.getData(),c=oe(e,i);p.type=n.type,p.layoutAlgorithm=ce(h),p.nodeSpacing=d?.nodeSpacing||50,p.rankSpacing=d?.rankSpacing||50,v().look==="neo"?p.markers=["barbNeo"]:p.markers=["barb"],p.diagramId=e,await le(p,c);let m=8;try{(typeof n.db.getLinks=="function"?n.db.getLinks():new Map).forEach((I,O)=>{let x=typeof O=="string"?O:typeof O?.id=="string"?O.id:"",S=p.nodes.find(D=>D.id===x);if(!x){b.warn("\u26A0\uFE0F Invalid or missing stateId from key:",JSON.stringify(O));return}let R=c.node()?.querySelectorAll("g.node, g.rough-node"),C;if(R?.forEach(D=>{let X=D.textContent?.trim();(D.id===S?.domId||X===x)&&(C=D)}),!C){b.warn("\u26A0\uFE0F Could not find node matching text:",x);return}let G=C.parentNode;if(!G){b.warn("\u26A0\uFE0F Node has no parent, cannot wrap:",x);return}let w=document.createElementNS("http://www.w3.org/2000/svg","a"),P=I.url.replace(/^"+|"+$/g,"");if(w.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",P),w.setAttribute("target","_blank"),I.tooltip){let D=I.tooltip.replace(/^"+|"+$/g,"");w.setAttribute("title",D),C.setAttribute("title",D)}G.replaceChild(w,C),w.appendChild(C),b.info("\u{1F517} Wrapped node in <a> tag for:",x,I.url)})}catch(_){b.error("\u274C Error injecting clickable links:",_)}se.insertTitle(c,"statediagramTitleText",d?.titleTopMargin??25,n.db.getDiagramTitle()),de(c,m,Z,d?.useMaxWidth??!0)},"draw"),Ie={getClasses:Ke,draw:Xe,getDir:Ut};var L={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},we=u(()=>new Map,"newClassesList"),Ne=u(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),_t=u(t=>JSON.parse(JSON.stringify(t)),"clone"),kt=class{constructor(e){this.version=e;this.nodes=[];this.edges=[];this.rootDoc=[];this.classes=we();this.documents={root:Ne()};this.currentDocument=this.documents.root;this.startEndCount=0;this.dividerCnt=0;this.links=new Map;this.funs=[];this.getAccTitle=Xt;this.setAccTitle=Kt;this.getAccDescription=qt;this.setAccDescription=Jt;this.setDiagramTitle=Qt;this.getDiagramTitle=Zt;this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this),this.bindFunctions=this.bindFunctions.bind(this)}static{u(this,"StateDB")}static{this.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3}}extract(e){this.clear(!0);for(let i of Array.isArray(e)?e:e.doc)switch(i.stmt){case U:this.addState(i.id.trim(),i.type,i.doc,i.description,i.note);break;case st:this.addRelation(i.state1,i.state2,i.description);break;case ue:this.addStyleClass(i.id.trim(),i.classes);break;case pe:this.handleStyleDef(i);break;case fe:this.setCssClass(i.id.trim(),i.styleClass);break;case"click":this.addLink(i.id,i.url,i.tooltip);break}let s=this.getStates(),n=v();ve(),tt(void 0,this.getRootDocV2(),s,this.nodes,this.edges,!0,n.look,this.classes);for(let i of this.nodes)if(Array.isArray(i.label)){if(i.description=i.label.slice(1),i.isGroup&&i.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${i.id}]`);i.label=i.label[0]}}handleStyleDef(e){let s=e.id.trim().split(","),n=e.styleClass.split(",");for(let i of s){let d=this.getState(i);if(!d){let h=i.trim();this.addState(h),d=this.getState(h)}d&&(d.styles=n.map(h=>h.replace(/;/g,"")?.trim()))}}setRootDoc(e){b.info("Setting root doc",e),this.rootDoc=e,this.version===1?this.extract(e):this.extract(this.getRootDocV2())}docTranslator(e,s,n){if(s.stmt===st){this.docTranslator(e,s.state1,!0),this.docTranslator(e,s.state2,!1);return}if(s.stmt===U&&(s.id===L.START_NODE?(s.id=e.id+(n?"_start":"_end"),s.start=n):s.id=s.id.trim()),s.stmt!==z&&s.stmt!==U||!s.doc)return;let i=[],d=[];for(let h of s.doc)if(h.type===St){let p=_t(h);p.doc=_t(d),i.push(p),d=[]}else d.push(h);if(i.length>0&&d.length>0){let h={stmt:U,id:ee(),type:"divider",doc:_t(d)};i.push(_t(h)),s.doc=i}s.doc.forEach(h=>this.docTranslator(s,h,!0))}getRootDocV2(){return this.docTranslator({id:z,stmt:z},{id:z,stmt:z,doc:this.rootDoc},!0),{id:z,doc:this.rootDoc}}addState(e,s=K,n=void 0,i=void 0,d=void 0,h=void 0,p=void 0,c=void 0){let y=e?.trim();if(!this.currentDocument.states.has(y))b.info("Adding state ",y,i),this.currentDocument.states.set(y,{stmt:U,id:y,descriptions:[],type:s,doc:n,note:d,classes:[],styles:[],textStyles:[]});else{let m=this.currentDocument.states.get(y);if(!m)throw new Error(`State not found: ${y}`);m.doc||(m.doc=n),m.type||(m.type=s)}if(i&&(b.info("Setting state description",y,i),(Array.isArray(i)?i:[i]).forEach(_=>this.addDescription(y,_.trim()))),d){let m=this.currentDocument.states.get(y);if(!m)throw new Error(`State not found: ${y}`);m.note=d,m.note.text=F.sanitizeText(m.note.text,v())}h&&(b.info("Setting state classes",y,h),(Array.isArray(h)?h:[h]).forEach(_=>this.setCssClass(y,_.trim()))),p&&(b.info("Setting state styles",y,p),(Array.isArray(p)?p:[p]).forEach(_=>this.setStyle(y,_.trim()))),c&&(b.info("Setting state styles",y,p),(Array.isArray(c)?c:[c]).forEach(_=>this.setTextStyle(y,_.trim())))}clear(e){this.nodes=[],this.edges=[],this.funs=[this.setupToolTips.bind(this)],this.documents={root:Ne()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=we(),e||(this.links=new Map,zt())}getState(e){return this.currentDocument.states.get(e)}getStates(){return this.currentDocument.states}logDocuments(){b.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(e,s,n){this.links.set(e,{url:s,tooltip:n}),b.warn("Adding link",e,s,n)}getLinks(){return this.links}startIdIfNeeded(e=""){return e===L.START_NODE?(this.startEndCount++,`${L.START_TYPE}${this.startEndCount}`):e}startTypeIfNeeded(e="",s=K){return e===L.START_NODE?L.START_TYPE:s}endIdIfNeeded(e=""){return e===L.END_NODE?(this.startEndCount++,`${L.END_TYPE}${this.startEndCount}`):e}endTypeIfNeeded(e="",s=K){return e===L.END_NODE?L.END_TYPE:s}addRelationObjs(e,s,n=""){let i=this.startIdIfNeeded(e.id.trim()),d=this.startTypeIfNeeded(e.id.trim(),e.type),h=this.startIdIfNeeded(s.id.trim()),p=this.startTypeIfNeeded(s.id.trim(),s.type);this.addState(i,d,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.addState(h,p,s.doc,s.description,s.note,s.classes,s.styles,s.textStyles),this.currentDocument.relations.push({id1:i,id2:h,relationTitle:F.sanitizeText(n,v())})}addRelation(e,s,n){if(typeof e=="object"&&typeof s=="object")this.addRelationObjs(e,s,n);else if(typeof e=="string"&&typeof s=="string"){let i=this.startIdIfNeeded(e.trim()),d=this.startTypeIfNeeded(e),h=this.endIdIfNeeded(s.trim()),p=this.endTypeIfNeeded(s);this.addState(i,d),this.addState(h,p),this.currentDocument.relations.push({id1:i,id2:h,relationTitle:n?F.sanitizeText(n,v()):void 0})}}addDescription(e,s){let n=this.currentDocument.states.get(e),i=s.startsWith(":")?s.replace(":","").trim():s;n?.descriptions?.push(F.sanitizeText(i,v()))}cleanupLabel(e){return e.startsWith(":")?e.slice(2).trim():e.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(e,s=""){this.classes.has(e)||this.classes.set(e,{id:e,styles:[],textStyles:[]});let n=this.classes.get(e);s&&n&&s.split(L.STYLECLASS_SEP).forEach(i=>{let d=i.replace(/([^;]*);/,"$1").trim();if(RegExp(L.COLOR_KEYWORD).exec(i)){let p=d.replace(L.FILL_KEYWORD,L.BG_FILL).replace(L.COLOR_KEYWORD,L.FILL_KEYWORD);n.textStyles.push(p)}n.styles.push(d)})}getClasses(){return this.classes}setupToolTips(e){let s=te();ft(e).select("svg").selectAll("g.node, g.rough-node").on("mouseover",d=>{let h=ft(d.currentTarget),p=h.attr("title");if(p===null)return;let c=d.currentTarget?.getBoundingClientRect();s.transition().duration(200).style("opacity",".9"),s.style("left",window.scrollX+c.left+(c.right-c.left)/2+"px").style("top",window.scrollY+c.bottom+"px"),s.html(Ht.sanitize(p)),h.classed("hover",!0)}).on("mouseout",d=>{s.transition().duration(500).style("opacity",0),ft(d.currentTarget).classed("hover",!1)})}setCssClass(e,s){e.split(",").forEach(n=>{let i=this.getState(n);if(!i){let d=n.trim();this.addState(d),i=this.getState(d)}i?.classes?.push(s)})}setStyle(e,s){this.getState(e)?.styles?.push(s)}setTextStyle(e,s){this.getState(e)?.textStyles?.push(s)}bindFunctions(e){this.funs.forEach(s=>{s(e)})}getDirectionStatement(){return this.rootDoc.find(e=>e.stmt==="dir")}getDirection(){return this.getDirectionStatement()?.value??"TB"}setDirection(e){let s=this.getDirectionStatement();s?s.value=e:this.rootDoc.unshift({stmt:"dir",value:e})}trimColon(e){return e.startsWith(":")?e.slice(1).trim():e.trim()}getData(){let e=v();for(let s of this.nodes)s.wrappingWidth??=e.state?.wrappingWidth,s.isGroup||(s.minWidth??=e.state?.minNodeWidth);return{nodes:this.nodes,edges:this.edges,other:{},config:e,direction:Ut(this.getRootDocV2())}}getConfig(){return v().state}};var qe=u(t=>{let{theme:e,bkgColorArray:s,borderColorArray:n}=t;if(!ie(e,n))return"";let i=ne(t.look),d=re(s),h="";for(let p=0;p<ae(n);p++){let c=n[p],y=d?`fill: ${s[p%s.length]};`:"",m=`[data-look="${i}"][data-color-id="color-${p}"]`;h+=`

    /* The title strip: \`rect.outer\` spans the whole composite and \`rect.inner\` covers
       the body, so what stays visible of \`outer\` is the band behind the label. */
    ${m}.statediagram-cluster rect.outer {
      stroke: ${c};
      ${y}
    }

    ${m}.statediagram-cluster rect.inner {
      stroke: ${c};
    }

    /* Concurrency regions. Siblings of one composite share a slot, so a divided composite
       reads as one thing split into parts rather than as several composites. */
    ${m}.statediagram-cluster rect.divider {
      stroke: ${c};
      ${y}
    }

    /* handDrawn draws the same container as roughjs shapes rather than plain rects, so it
       needs its own rules. \`roundedWithTitle\` and \`divider\` name those groups \`outer\`,
       \`inner\` and \`divider\` to match the classic branch, which is what lets these
       discriminate -- a bare \`.statediagram-cluster path\` rule reached the body as well and
       tinted the whole composite, losing \`compositeBackground\` and diverging from what
       classic and neo do.

       roughjs emits two paths per shape and marks them: the filled shape carries
       \`stroke="none"\` and the sketched outline carries \`fill="none"\`. Splitting on that is
       what keeps \`fill\` off the outline -- a rough outline is open squiggles, not a closed
       region, so filling it produces smears -- and keeps \`stroke\` off the fill shape, which
       would otherwise gain an edge it was drawn without. */
    ${m}.statediagram-cluster .outer path[stroke='none'] {
      ${y}
    }

    ${m}.statediagram-cluster .outer path[fill='none'] {
      stroke: ${c};
    }

    /* No \`.inner\` rule on purpose. The body shape is left entirely alone under handDrawn,
       where a rect's \`inner\` counterpart cannot be recoloured safely: roughjs draws a
       hachure fill as *stroked* lines, so its fill paths carry \`fill="none"\` exactly like
       the outline and no selector separates them. An \`.inner\` stroke rule therefore
       repainted the hatching of every alt composite in the palette colour instead of
       leaving it on \`altBackground\`. The container still reads as palette-coloured: the
       \`outer\` shape spans the whole composite, so its outline already frames the body. */

    /* Regions split the same way, which is why \`divider\` fills solid rather than taking
       roughjs's default hachure -- see the note on that call. Hatched, both of its paths
       carried \`fill="none"\` and these two rules degenerated: the tint matched nothing and
       the border rule repainted the hatching. */
    ${m}.statediagram-cluster .divider path[stroke='none'] {
      ${y}
    }

    ${m}.statediagram-cluster .divider path[fill='none'] {
      stroke: ${c};
    }
    `}return h},"genColor"),Qe=u(t=>`
${qe(t)}
defs [id$="-barbEnd"] {
    fill: ${t.transitionColor};
    stroke: ${t.transitionColor};
  }
g.stateGroup text {
  fill: ${t.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${t.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${t.stateLabelColor};
}

g.stateGroup rect {
  fill: ${t.mainBkg};
  stroke: ${t.nodeBorder};
}

g.stateGroup line {
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.transition {
  stroke: ${t.transitionColor};
  stroke-width: ${t.strokeWidth||1};
  fill: none;
}

.stateGroup .composit {
  fill: ${t.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${t.noteBorderColor};
  fill: ${t.noteBkgColor};

  text {
    fill: ${t.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${t.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${t.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
  background-color: ${t.edgeLabelBackground};
  p {
    background-color: ${t.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${t.edgeLabelBackground};
    fill: ${t.edgeLabelBackground};
  }
  text-align: center;
}
.edgeLabel .label text {
  fill: ${t.transitionLabelColor||t.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${t.transitionLabelColor||t.tertiaryTextColor};
}

.stateLabel text {
  fill: ${t.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node .fork-join {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node circle.state-end {
  fill: ${t.innerEndBackground};
  stroke: ${t.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${t.compositeBackground||t.background};
  // stroke: ${t.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${t.stateBkg||t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}
.node polygon {
  fill: ${t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};;
  stroke-width: ${t.strokeWidth||1}px;
}
[id$="-barbEnd"] {
  fill: ${t.lineColor};
}

.statediagram-cluster rect {
  fill: ${t.compositeTitleBackground};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}

.cluster-label, .nodeLabel {
  color: ${t.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${t.stateBorder||t.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${t.compositeBackground||t.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${t.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${t.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${t.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${t.lineColor};
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${t.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${t.mainBkg};
  stroke: ${t.useGradient?"url("+t.svgId+"-gradient)":t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth??1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${t.radius}px;
  ry: ${t.radius}px;
  filter: ${t.dropShadow?t.dropShadow.replace("url(#drop-shadow)",`url(${t.svgId}-drop-shadow)`):"none"}
}
`,"getStyles"),Oe=Qe;var Bs={parser:he,get db(){return new kt(2)},renderer:Ie,styles:Oe,init:u(t=>{t.state||(t.state={}),t.state.arrowMarkerAbsolute=t.arrowMarkerAbsolute},"init")};export{Bs as diagram};
