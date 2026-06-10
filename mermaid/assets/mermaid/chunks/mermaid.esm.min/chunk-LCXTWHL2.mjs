import{a as Qt}from"./chunk-6764PJDD.mjs";import{a as te}from"./chunk-ZXARS5L4.mjs";import{b as Zt}from"./chunk-VU6ZFW4Y.mjs";import{g as Jt,p as qt}from"./chunk-QA3QBVWF.mjs";import{G as Y,S as Ut,T as Ht,U as jt,V as Wt,W as zt,X as Kt,Y as Xt,_ as L}from"./chunk-67TQ5CYL.mjs";import{b as _}from"./chunk-7W6UQGC5.mjs";import{a as c}from"./chunk-AQ6EADP3.mjs";var Ct=(function(){var t=c(function(F,o,d,n){for(d=d||{},n=F.length;n--;d[F[n]]=o);return d},"o"),e=[1,2],s=[1,3],a=[1,4],r=[2,4],u=[1,9],S=[1,11],f=[1,16],p=[1,17],m=[1,18],E=[1,19],b=[1,33],I=[1,20],D=[1,21],h=[1,22],R=[1,23],x=[1,24],G=[1,26],N=[1,27],$=[1,28],v=[1,29],Z=[1,30],st=[1,31],it=[1,32],rt=[1,35],nt=[1,36],at=[1,37],ot=[1,38],K=[1,34],g=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],lt=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],Ft=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],Et={trace:c(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:c(function(o,d,n,y,T,i,X){var l=i.length-1;switch(T){case 3:return y.setRootDoc(i[l]),i[l];break;case 4:this.$=[];break;case 5:i[l]!="nl"&&(i[l-1].push(i[l]),this.$=i[l-1]);break;case 6:case 7:this.$=i[l];break;case 8:this.$="nl";break;case 12:this.$=i[l];break;case 13:let ct=i[l-1];ct.description=y.trimColon(i[l]),this.$=ct;break;case 14:this.$={stmt:"relation",state1:i[l-2],state2:i[l]};break;case 15:let dt=y.trimColon(i[l]);this.$={stmt:"relation",state1:i[l-3],state2:i[l-1],description:dt};break;case 19:this.$={stmt:"state",id:i[l-3],type:"default",description:"",doc:i[l-1]};break;case 20:var P=i[l],M=i[l-2].trim();if(i[l].match(":")){var tt=i[l].split(":");P=tt[0],M=[M,tt[1]]}this.$={stmt:"state",id:P,type:"default",description:M};break;case 21:this.$={stmt:"state",id:i[l-3],type:"default",description:i[l-5],doc:i[l-1]};break;case 22:this.$={stmt:"state",id:i[l],type:"fork"};break;case 23:this.$={stmt:"state",id:i[l],type:"join"};break;case 24:this.$={stmt:"state",id:i[l],type:"choice"};break;case 25:this.$={stmt:"state",id:y.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:i[l-1].trim(),note:{position:i[l-2].trim(),text:i[l].trim()}};break;case 29:this.$=i[l].trim(),y.setAccTitle(this.$);break;case 30:case 31:this.$=i[l].trim(),y.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:i[l-3],url:i[l-2],tooltip:i[l-1]};break;case 33:this.$={stmt:"click",id:i[l-3],url:i[l-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:i[l-1].trim(),classes:i[l].trim()};break;case 36:this.$={stmt:"style",id:i[l-1].trim(),styleClass:i[l].trim()};break;case 37:this.$={stmt:"applyClass",id:i[l-1].trim(),styleClass:i[l].trim()};break;case 38:y.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:y.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:y.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:y.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:i[l].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:i[l-2].trim(),classes:[i[l].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:i[l-2].trim(),classes:[i[l].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:e,5:s,6:a},{1:[3]},{3:5,4:e,5:s,6:a},{3:6,4:e,5:s,6:a},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],r,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:u,5:S,8:8,9:10,10:12,11:13,12:14,13:15,16:f,17:p,19:m,22:E,24:b,25:I,26:D,27:h,28:R,29:x,32:25,33:G,35:N,37:$,38:v,41:Z,45:st,48:it,51:rt,52:nt,53:at,54:ot,57:K},t(g,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:f,17:p,19:m,22:E,24:b,25:I,26:D,27:h,28:R,29:x,32:25,33:G,35:N,37:$,38:v,41:Z,45:st,48:it,51:rt,52:nt,53:at,54:ot,57:K},t(g,[2,7]),t(g,[2,8]),t(g,[2,9]),t(g,[2,10]),t(g,[2,11]),t(g,[2,12],{14:[1,40],15:[1,41]}),t(g,[2,16]),{18:[1,42]},t(g,[2,18],{20:[1,43]}),{23:[1,44]},t(g,[2,22]),t(g,[2,23]),t(g,[2,24]),t(g,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(g,[2,28]),{34:[1,49]},{36:[1,50]},t(g,[2,31]),{13:51,24:b,57:K},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(lt,[2,44],{58:[1,56]}),t(lt,[2,45],{58:[1,57]}),t(g,[2,38]),t(g,[2,39]),t(g,[2,40]),t(g,[2,41]),t(g,[2,6]),t(g,[2,13]),{13:58,24:b,57:K},t(g,[2,17]),t(Ft,r,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(g,[2,29]),t(g,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(g,[2,14],{14:[1,71]}),{4:u,5:S,8:8,9:10,10:12,11:13,12:14,13:15,16:f,17:p,19:m,21:[1,72],22:E,24:b,25:I,26:D,27:h,28:R,29:x,32:25,33:G,35:N,37:$,38:v,41:Z,45:st,48:it,51:rt,52:nt,53:at,54:ot,57:K},t(g,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(g,[2,34]),t(g,[2,35]),t(g,[2,36]),t(g,[2,37]),t(lt,[2,46]),t(lt,[2,47]),t(g,[2,15]),t(g,[2,19]),t(Ft,r,{7:78}),t(g,[2,26]),t(g,[2,27]),{5:[1,79]},{5:[1,80]},{4:u,5:S,8:8,9:10,10:12,11:13,12:14,13:15,16:f,17:p,19:m,21:[1,81],22:E,24:b,25:I,26:D,27:h,28:R,29:x,32:25,33:G,35:N,37:$,38:v,41:Z,45:st,48:it,51:rt,52:nt,53:at,54:ot,57:K},t(g,[2,32]),t(g,[2,33]),t(g,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:c(function(o,d){if(d.recoverable)this.trace(o);else{var n=new Error(o);throw n.hash=d,n}},"parseError"),parse:c(function(o){var d=this,n=[0],y=[],T=[null],i=[],X=this.table,l="",P=0,M=0,tt=0,ct=2,dt=1,ke=i.slice.call(arguments,1),k=Object.create(this.lexer),H={yy:{}};for(var bt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,bt)&&(H.yy[bt]=this.yy[bt]);k.setInput(o,H.yy),H.yy.lexer=k,H.yy.parser=this,typeof k.yylloc>"u"&&(k.yylloc={});var kt=k.yylloc;i.push(kt);var De=k.options&&k.options.ranges;typeof H.yy.parseError=="function"?this.parseError=H.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Me(O){n.length=n.length-2*O,T.length=T.length-O,i.length=i.length-O}c(Me,"popStack");function xe(){var O;return O=y.pop()||k.lex()||dt,typeof O!="number"&&(O instanceof Array&&(y=O,O=y.pop()),O=d.symbols_[O]||O),O}c(xe,"lex");for(var A,Dt,j,w,Be,xt,J={},ht,B,Vt,ut;;){if(j=n[n.length-1],this.defaultActions[j]?w=this.defaultActions[j]:((A===null||typeof A>"u")&&(A=xe()),w=X[j]&&X[j][A]),typeof w>"u"||!w.length||!w[0]){var At="";ut=[];for(ht in X[j])this.terminals_[ht]&&ht>ct&&ut.push("'"+this.terminals_[ht]+"'");k.showPosition?At="Parse error on line "+(P+1)+`:
`+k.showPosition()+`
Expecting `+ut.join(", ")+", got '"+(this.terminals_[A]||A)+"'":At="Parse error on line "+(P+1)+": Unexpected "+(A==dt?"end of input":"'"+(this.terminals_[A]||A)+"'"),this.parseError(At,{text:k.match,token:this.terminals_[A]||A,line:k.yylineno,loc:kt,expected:ut})}if(w[0]instanceof Array&&w.length>1)throw new Error("Parse Error: multiple actions possible at state: "+j+", token: "+A);switch(w[0]){case 1:n.push(A),T.push(k.yytext),i.push(k.yylloc),n.push(w[1]),A=null,Dt?(A=Dt,Dt=null):(M=k.yyleng,l=k.yytext,P=k.yylineno,kt=k.yylloc,tt>0&&tt--);break;case 2:if(B=this.productions_[w[1]][1],J.$=T[T.length-B],J._$={first_line:i[i.length-(B||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(B||1)].first_column,last_column:i[i.length-1].last_column},De&&(J._$.range=[i[i.length-(B||1)].range[0],i[i.length-1].range[1]]),xt=this.performAction.apply(J,[l,M,P,H.yy,w[1],T,i].concat(ke)),typeof xt<"u")return xt;B&&(n=n.slice(0,-1*B*2),T=T.slice(0,-1*B),i=i.slice(0,-1*B)),n.push(this.productions_[w[1]][0]),T.push(J.$),i.push(J._$),Vt=X[n[n.length-2]][n[n.length-1]],n.push(Vt);break;case 3:return!0}}return!0},"parse")},be=(function(){var F={EOF:1,parseError:c(function(d,n){if(this.yy.parser)this.yy.parser.parseError(d,n);else throw new Error(d)},"parseError"),setInput:c(function(o,d){return this.yy=d||this.yy||{},this._input=o,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:c(function(){var o=this._input[0];this.yytext+=o,this.yyleng++,this.offset++,this.match+=o,this.matched+=o;var d=o.match(/(?:\r\n?|\n).*/g);return d?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),o},"input"),unput:c(function(o){var d=o.length,n=o.split(/(?:\r\n?|\n)/g);this._input=o+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-d),this.offset-=d;var y=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var T=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===y.length?this.yylloc.first_column:0)+y[y.length-n.length].length-n[0].length:this.yylloc.first_column-d},this.options.ranges&&(this.yylloc.range=[T[0],T[0]+this.yyleng-d]),this.yyleng=this.yytext.length,this},"unput"),more:c(function(){return this._more=!0,this},"more"),reject:c(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:c(function(o){this.unput(this.match.slice(o))},"less"),pastInput:c(function(){var o=this.matched.substr(0,this.matched.length-this.match.length);return(o.length>20?"...":"")+o.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:c(function(){var o=this.match;return o.length<20&&(o+=this._input.substr(0,20-o.length)),(o.substr(0,20)+(o.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:c(function(){var o=this.pastInput(),d=new Array(o.length+1).join("-");return o+this.upcomingInput()+`
`+d+"^"},"showPosition"),test_match:c(function(o,d){var n,y,T;if(this.options.backtrack_lexer&&(T={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(T.yylloc.range=this.yylloc.range.slice(0))),y=o[0].match(/(?:\r\n?|\n).*/g),y&&(this.yylineno+=y.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:y?y[y.length-1].length-y[y.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],n=this.performAction.call(this,this.yy,this,d,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var i in T)this[i]=T[i];return!1}return!1},"test_match"),next:c(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var o,d,n,y;this._more||(this.yytext="",this.match="");for(var T=this._currentRules(),i=0;i<T.length;i++)if(n=this._input.match(this.rules[T[i]]),n&&(!d||n[0].length>d[0].length)){if(d=n,y=i,this.options.backtrack_lexer){if(o=this.test_match(n,T[i]),o!==!1)return o;if(this._backtrack){d=!1;continue}else return!1}else if(!this.options.flex)break}return d?(o=this.test_match(d,T[y]),o!==!1?o:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:c(function(){var d=this.next();return d||this.lex()},"lex"),begin:c(function(d){this.conditionStack.push(d)},"begin"),popState:c(function(){var d=this.conditionStack.length-1;return d>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:c(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:c(function(d){return d=this.conditionStack.length-1-Math.abs(d||0),d>=0?this.conditionStack[d]:"INITIAL"},"topState"),pushState:c(function(d){this.begin(d)},"pushState"),stateStackSize:c(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:c(function(d,n,y,T){function i(){let l=n.yytext.indexOf("%%");if(l===0)return!1;if(l>0){let P=n.yytext.slice(0,l),M=n.yytext.slice(l);M&&d.lexer.unput(M),n.yytext=P}return!0}c(i,"processId");var X=T;switch(y){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;break;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;break;case 17:return this.popState(),"acc_title_value";break;case 18:return this.begin("acc_descr"),35;break;case 19:return this.popState(),"acc_descr_value";break;case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;break;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";break;case 25:return this.popState(),this.pushState("CLASSDEFID"),42;break;case 26:return this.popState(),43;break;case 27:return this.pushState("CLASS"),48;break;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;break;case 29:return this.popState(),50;break;case 30:return this.pushState("STYLE"),45;break;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;break;case 32:return this.popState(),47;break;case 33:return this.pushState("SCALE"),17;break;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),n.yytext=n.yytext.slice(0,-8).trim(),25;break;case 38:return this.popState(),n.yytext=n.yytext.slice(0,-8).trim(),26;break;case 39:return this.popState(),n.yytext=n.yytext.slice(0,-10).trim(),27;break;case 40:return this.popState(),n.yytext=n.yytext.slice(0,-8).trim(),25;break;case 41:return this.popState(),n.yytext=n.yytext.slice(0,-8).trim(),26;break;case 42:return this.popState(),n.yytext=n.yytext.slice(0,-10).trim(),27;break;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";break;case 49:if(!i())return;return this.popState(),"ID";break;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:return 19;case 53:this.popState();break;case 54:return this.popState(),this.pushState("struct"),20;break;case 55:return this.popState(),21;break;case 56:break;case 57:return this.begin("NOTE"),29;break;case 58:return this.popState(),this.pushState("NOTE_ID"),59;break;case 59:return this.popState(),this.pushState("NOTE_ID"),60;break;case 60:this.popState(),this.pushState("FLOATING_NOTE");break;case 61:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";break;case 62:break;case 63:return"NOTE_TEXT";case 64:if(!i())return;return this.popState(),"ID";break;case 65:if(!i())return;return this.popState(),this.pushState("NOTE_TEXT"),24;break;case 66:return this.popState(),n.yytext=n.yytext.substr(2).trim(),31;break;case 67:return this.popState(),n.yytext=n.yytext.slice(0,-8).trim(),31;break;case 68:return 6;case 69:return 6;case 70:return 16;case 71:return 57;case 72:return i()?24:void 0;case 73:return n.yytext=n.yytext.trim(),14;break;case 74:return 15;case 75:return 28;case 76:return 58;case 77:return 5;case 78:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,55,56,57,71,72,73,74,75,76],inclusive:!1},FLOATING_NOTE_ID:{rules:[64],inclusive:!1},FLOATING_NOTE:{rules:[61,62,63],inclusive:!1},NOTE_TEXT:{rules:[66,67],inclusive:!1},NOTE_ID:{rules:[65],inclusive:!1},NOTE:{rules:[58,59,60],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,54,57,68,69,70,71,72,73,74,76,77,78],inclusive:!0}}};return F})();Et.lexer=be;function _t(){this.yy={}}return c(_t,"Parser"),_t.prototype=Et,Et.Parser=_t,new _t})();Ct.parser=Ct;var Ye=Ct;var V="state",W="root",et="relation",ee="classDef",se="style",ie="applyClass",z="default",St="divider",Lt="fill:none",It="fill: #333";var Rt="markdown",Nt="normal",pt="rect",ft="rectWithTitle",re="stateStart",ne="stateEnd",vt="divider",Ot="roundedWithTitle",ae="note",oe="noteGroup",q="statediagram",Ae="state",le=`${q}-${Ae}`,wt="transition",Ce="note",Le="note-edge",ce=`${wt} ${Le}`,de=`${q}-${Ce}`,Ie="cluster",he=`${q}-${Ie}`,Re="cluster-alt",ue=`${q}-${Re}`,Gt="parent",$t="note",Se="state",gt="----",pe=`${gt}${$t}`,Pt=`${gt}${Gt}`;var Bt=c((t,e="TB")=>{if(!t.doc)return e;let s=e;for(let a of t.doc)a.stmt==="dir"&&(s=a.value);return s},"getDir"),Ne=c(function(t,e){return e.db.getClasses()},"getClasses"),ve=c(async function(t,e,s,a){_.info("REF0:"),_.info("Drawing state diagram (v2)",e);let{securityLevel:r,state:u,layout:S}=L();a.db.extract(a.db.getRootDocV2());let f=a.db.getData(),p=Qt(e,r);f.type=a.type,f.layoutAlgorithm=S,f.nodeSpacing=u?.nodeSpacing||50,f.rankSpacing=u?.rankSpacing||50,L().look==="neo"?f.markers=["barbNeo"]:f.markers=["barb"],f.diagramId=e,await Zt(f,p);let E=8;try{(typeof a.db.getLinks=="function"?a.db.getLinks():new Map).forEach((I,D)=>{let h=typeof D=="string"?D:typeof D?.id=="string"?D.id:"";if(!h){_.warn("\u26A0\uFE0F Invalid or missing stateId from key:",JSON.stringify(D));return}let R=p.node()?.querySelectorAll("g"),x;if(R?.forEach(v=>{v.textContent?.trim()===h&&(x=v)}),!x){_.warn("\u26A0\uFE0F Could not find node matching text:",h);return}let G=x.parentNode;if(!G){_.warn("\u26A0\uFE0F Node has no parent, cannot wrap:",h);return}let N=document.createElementNS("http://www.w3.org/2000/svg","a"),$=I.url.replace(/^"+|"+$/g,"");if(N.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",$),N.setAttribute("target","_blank"),I.tooltip){let v=I.tooltip.replace(/^"+|"+$/g,"");N.setAttribute("title",v)}G.replaceChild(N,x),N.appendChild(x),_.info("\u{1F517} Wrapped node in <a> tag for:",h,I.url)})}catch(b){_.error("\u274C Error injecting clickable links:",b)}qt.insertTitle(p,"statediagramTitleText",u?.titleTopMargin??25,a.db.getDiagramTitle()),te(p,E,q,u?.useMaxWidth??!0)},"draw"),qe={getClasses:Ne,draw:ve,getDir:Bt};var mt=new Map,U=0;function Yt(t="",e=0,s="",a=gt){let r=s!==null&&s.length>0?`${a}${s}`:"";return`${Se}-${t}${r}-${e}`}c(Yt,"stateDomId");var Oe=c((t,e,s,a,r,u,S,f)=>{_.trace("items",e),e.forEach(p=>{switch(p.stmt){case V:Q(t,p,s,a,r,u,S,f);break;case z:Q(t,p,s,a,r,u,S,f);break;case et:{Q(t,p.state1,s,a,r,u,S,f),Q(t,p.state2,s,a,r,u,S,f);let m=S==="neo",E={id:"edge"+U,start:p.state1.id,end:p.state2.id,arrowhead:"normal",arrowTypeEnd:m?"arrow_barb_neo":"arrow_barb",style:Lt,labelStyle:"",label:Y.sanitizeText(p.description??"",L()),arrowheadStyle:It,labelpos:"c",labelType:Rt,thickness:Nt,classes:wt,look:S};r.push(E),U++}break}})},"setupDoc"),fe=c((t,e="TB")=>{let s=e;if(t.doc)for(let a of t.doc)a.stmt==="dir"&&(s=a.value);return s},"getDir");function yt(t,e,s){if(!e.id||e.id==="</join></fork>"||e.id==="</choice>")return;e.cssClasses&&(Array.isArray(e.cssCompiledStyles)||(e.cssCompiledStyles=[]),e.cssClasses.split(" ").forEach(r=>{let u=s.get(r);u&&(e.cssCompiledStyles=[...e.cssCompiledStyles??[],...u.styles])}));let a=t.find(r=>r.id===e.id);a?Object.assign(a,e):t.push(e)}c(yt,"insertOrUpdateNode");function we(t){return t?.classes?.join(" ")??""}c(we,"getClassesFromDbInfo");function Ge(t){return t?.styles??[]}c(Ge,"getStylesFromDbInfo");var Q=c((t,e,s,a,r,u,S,f)=>{let p=e.id,m=s.get(p),E=we(m),b=Ge(m),I=L();if(_.info("dataFetcher parsedItem",e,m,b),p!=="root"){let D=pt;e.start===!0?D=re:e.start===!1&&(D=ne),e.type!==z&&(D=e.type),mt.get(p)||mt.set(p,{id:p,shape:D,description:Y.sanitizeText(p,I),cssClasses:`${E} ${le}`,cssStyles:b});let h=mt.get(p);e.description&&(Array.isArray(h.description)?(h.shape=ft,h.description.push(e.description)):h.description?.length&&h.description.length>0?(h.shape=ft,h.description===p?h.description=[e.description]:h.description=[h.description,e.description]):(h.shape=pt,h.description=e.description),h.description=Y.sanitizeTextOrArray(h.description,I)),h.description?.length===1&&h.shape===ft&&(h.type==="group"?h.shape=Ot:h.shape=pt),!h.type&&e.doc&&(_.info("Setting cluster for XCX",p,fe(e)),h.type="group",h.isGroup=!0,h.dir=fe(e),h.shape=e.type===St?vt:Ot,h.cssClasses=`${h.cssClasses} ${he} ${u?ue:""}`);let R={labelStyle:"",shape:h.shape,label:h.description,cssClasses:h.cssClasses,cssCompiledStyles:[],cssStyles:h.cssStyles,id:p,dir:h.dir,domId:Yt(p,U),type:h.type,isGroup:h.type==="group",padding:8,rx:10,ry:10,look:S,labelType:"markdown"};if(R.shape===vt&&(R.label=""),t&&t.id!=="root"&&(_.trace("Setting node ",p," to be child of its parent ",t.id),R.parentId=t.id),R.centerLabel=!0,e.note){let x={labelStyle:"",shape:ae,label:e.note.text,labelType:"markdown",cssClasses:de,cssStyles:[],cssCompiledStyles:[],id:p+pe+"-"+U,domId:Yt(p,U,$t),type:h.type,isGroup:h.type==="group",padding:I.flowchart?.padding,look:S,position:e.note.position},G=p+Pt,N={labelStyle:"",shape:oe,label:e.note.text,cssClasses:h.cssClasses,cssStyles:[],id:p+Pt,domId:Yt(p,U,Gt),type:"group",isGroup:!0,padding:16,look:S,position:e.note.position};U++,N.id=G,x.parentId=G,yt(a,N,f),yt(a,x,f),yt(a,R,f);let $=p,v=x.id;e.note.position==="left of"&&($=x.id,v=p),r.push({id:$+"-"+v,start:$,end:v,arrowhead:"none",arrowTypeEnd:"",style:Lt,labelStyle:"",classes:ce,arrowheadStyle:It,labelpos:"c",labelType:Rt,thickness:Nt,look:S})}else yt(a,R,f)}e.doc&&(_.trace("Adding nodes children "),Oe(e,e.doc,s,a,r,!u,S,f))},"dataFetcher"),ye=c(()=>{mt.clear(),U=0},"reset");var C={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Te=c(()=>new Map,"newClassesList"),Ee=c(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),Tt=c(t=>JSON.parse(JSON.stringify(t)),"clone"),_e=class{constructor(e){this.version=e;this.nodes=[];this.edges=[];this.rootDoc=[];this.classes=Te();this.documents={root:Ee()};this.currentDocument=this.documents.root;this.startEndCount=0;this.dividerCnt=0;this.links=new Map;this.getAccTitle=jt;this.setAccTitle=Ht;this.getAccDescription=zt;this.setAccDescription=Wt;this.setDiagramTitle=Kt;this.getDiagramTitle=Xt;this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this)}static{c(this,"StateDB")}static{this.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3}}extract(e){this.clear(!0);for(let r of Array.isArray(e)?e:e.doc)switch(r.stmt){case V:this.addState(r.id.trim(),r.type,r.doc,r.description,r.note);break;case et:this.addRelation(r.state1,r.state2,r.description);break;case ee:this.addStyleClass(r.id.trim(),r.classes);break;case se:this.handleStyleDef(r);break;case ie:this.setCssClass(r.id.trim(),r.styleClass);break;case"click":this.addLink(r.id,r.url,r.tooltip);break}let s=this.getStates(),a=L();ye(),Q(void 0,this.getRootDocV2(),s,this.nodes,this.edges,!0,a.look,this.classes);for(let r of this.nodes)if(Array.isArray(r.label)){if(r.description=r.label.slice(1),r.isGroup&&r.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${r.id}]`);r.label=r.label[0]}}handleStyleDef(e){let s=e.id.trim().split(","),a=e.styleClass.split(",");for(let r of s){let u=this.getState(r);if(!u){let S=r.trim();this.addState(S),u=this.getState(S)}u&&(u.styles=a.map(S=>S.replace(/;/g,"")?.trim()))}}setRootDoc(e){_.info("Setting root doc",e),this.rootDoc=e,this.version===1?this.extract(e):this.extract(this.getRootDocV2())}docTranslator(e,s,a){if(s.stmt===et){this.docTranslator(e,s.state1,!0),this.docTranslator(e,s.state2,!1);return}if(s.stmt===V&&(s.id===C.START_NODE?(s.id=e.id+(a?"_start":"_end"),s.start=a):s.id=s.id.trim()),s.stmt!==W&&s.stmt!==V||!s.doc)return;let r=[],u=[];for(let S of s.doc)if(S.type===St){let f=Tt(S);f.doc=Tt(u),r.push(f),u=[]}else u.push(S);if(r.length>0&&u.length>0){let S={stmt:V,id:Jt(),type:"divider",doc:Tt(u)};r.push(Tt(S)),s.doc=r}s.doc.forEach(S=>this.docTranslator(s,S,!0))}getRootDocV2(){return this.docTranslator({id:W,stmt:W},{id:W,stmt:W,doc:this.rootDoc},!0),{id:W,doc:this.rootDoc}}addState(e,s=z,a=void 0,r=void 0,u=void 0,S=void 0,f=void 0,p=void 0){let m=e?.trim();if(!this.currentDocument.states.has(m))_.info("Adding state ",m,r),this.currentDocument.states.set(m,{stmt:V,id:m,descriptions:[],type:s,doc:a,note:u,classes:[],styles:[],textStyles:[]});else{let E=this.currentDocument.states.get(m);if(!E)throw new Error(`State not found: ${m}`);E.doc||(E.doc=a),E.type||(E.type=s)}if(r&&(_.info("Setting state description",m,r),(Array.isArray(r)?r:[r]).forEach(b=>this.addDescription(m,b.trim()))),u){let E=this.currentDocument.states.get(m);if(!E)throw new Error(`State not found: ${m}`);E.note=u,E.note.text=Y.sanitizeText(E.note.text,L())}S&&(_.info("Setting state classes",m,S),(Array.isArray(S)?S:[S]).forEach(b=>this.setCssClass(m,b.trim()))),f&&(_.info("Setting state styles",m,f),(Array.isArray(f)?f:[f]).forEach(b=>this.setStyle(m,b.trim()))),p&&(_.info("Setting state styles",m,f),(Array.isArray(p)?p:[p]).forEach(b=>this.setTextStyle(m,b.trim())))}clear(e){this.nodes=[],this.edges=[],this.documents={root:Ee()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Te(),e||(this.links=new Map,Ut())}getState(e){return this.currentDocument.states.get(e)}getStates(){return this.currentDocument.states}logDocuments(){_.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(e,s,a){this.links.set(e,{url:s,tooltip:a}),_.warn("Adding link",e,s,a)}getLinks(){return this.links}startIdIfNeeded(e=""){return e===C.START_NODE?(this.startEndCount++,`${C.START_TYPE}${this.startEndCount}`):e}startTypeIfNeeded(e="",s=z){return e===C.START_NODE?C.START_TYPE:s}endIdIfNeeded(e=""){return e===C.END_NODE?(this.startEndCount++,`${C.END_TYPE}${this.startEndCount}`):e}endTypeIfNeeded(e="",s=z){return e===C.END_NODE?C.END_TYPE:s}addRelationObjs(e,s,a=""){let r=this.startIdIfNeeded(e.id.trim()),u=this.startTypeIfNeeded(e.id.trim(),e.type),S=this.startIdIfNeeded(s.id.trim()),f=this.startTypeIfNeeded(s.id.trim(),s.type);this.addState(r,u,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.addState(S,f,s.doc,s.description,s.note,s.classes,s.styles,s.textStyles),this.currentDocument.relations.push({id1:r,id2:S,relationTitle:Y.sanitizeText(a,L())})}addRelation(e,s,a){if(typeof e=="object"&&typeof s=="object")this.addRelationObjs(e,s,a);else if(typeof e=="string"&&typeof s=="string"){let r=this.startIdIfNeeded(e.trim()),u=this.startTypeIfNeeded(e),S=this.endIdIfNeeded(s.trim()),f=this.endTypeIfNeeded(s);this.addState(r,u),this.addState(S,f),this.currentDocument.relations.push({id1:r,id2:S,relationTitle:a?Y.sanitizeText(a,L()):void 0})}}addDescription(e,s){let a=this.currentDocument.states.get(e),r=s.startsWith(":")?s.replace(":","").trim():s;a?.descriptions?.push(Y.sanitizeText(r,L()))}cleanupLabel(e){return e.startsWith(":")?e.slice(2).trim():e.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(e,s=""){this.classes.has(e)||this.classes.set(e,{id:e,styles:[],textStyles:[]});let a=this.classes.get(e);s&&a&&s.split(C.STYLECLASS_SEP).forEach(r=>{let u=r.replace(/([^;]*);/,"$1").trim();if(RegExp(C.COLOR_KEYWORD).exec(r)){let f=u.replace(C.FILL_KEYWORD,C.BG_FILL).replace(C.COLOR_KEYWORD,C.FILL_KEYWORD);a.textStyles.push(f)}a.styles.push(u)})}getClasses(){return this.classes}setCssClass(e,s){e.split(",").forEach(a=>{let r=this.getState(a);if(!r){let u=a.trim();this.addState(u),r=this.getState(u)}r?.classes?.push(s)})}setStyle(e,s){this.getState(e)?.styles?.push(s)}setTextStyle(e,s){this.getState(e)?.textStyles?.push(s)}getDirectionStatement(){return this.rootDoc.find(e=>e.stmt==="dir")}getDirection(){return this.getDirectionStatement()?.value??"TB"}setDirection(e){let s=this.getDirectionStatement();s?s.value=e:this.rootDoc.unshift({stmt:"dir",value:e})}trimColon(e){return e.startsWith(":")?e.slice(1).trim():e.trim()}getData(){let e=L();return{nodes:this.nodes,edges:this.edges,other:{},config:e,direction:Bt(this.getRootDocV2())}}getConfig(){return L().state}};var Pe=c(t=>`
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
`,"getStyles"),gs=Pe;export{Ye as a,qe as b,_e as c,gs as d};
