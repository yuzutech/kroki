import{q as Ye}from"./chunk-YF46JFGZ.mjs";import{a as rn}from"./chunk-ZZ52EIBP.mjs";import{$ as rt,H as oe,P as ce,T as le,U as ue,V as de,W as fe,X as he,Y as me,Z as ke}from"./chunk-VSAMGZVZ.mjs";import{A as Me,B as Ot,C as Ft,D as Ee,a as ae,b as J,d as ye,e as pe,f as ge,g as xe,h as xt,i as be,o as Te,p as Yt,q as $t,r as It,s as Lt,t as At,u as ve,v as we,w as _e,x as De,y as Se,z as Ce}from"./chunk-L2B47AAZ.mjs";import{a,c as wt,e as ot}from"./chunk-QVIEFLGF.mjs";var Ie=wt((Vt,Pt)=>{"use strict";(function(t,e){typeof Vt=="object"&&typeof Pt<"u"?Pt.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_isoWeek=e()})(Vt,(function(){"use strict";var t="day";return function(e,r,i){var s=a(function(_){return _.add(4-_.isoWeekday(),t)},"a"),f=r.prototype;f.isoWeekYear=function(){return s(this).year()},f.isoWeek=function(_){if(!this.$utils().u(_))return this.add(7*(_-this.isoWeek()),t);var D,R,$,V,P=s(this),H=(D=this.isoWeekYear(),R=this.$u,$=(R?i.utc:i)().year(D).startOf("year"),V=4-$.isoWeekday(),$.isoWeekday()>4&&(V+=7),$.add(V,t));return P.diff(H,"week")+1},f.isoWeekday=function(_){return this.$utils().u(_)?this.day()||7:this.day(this.day()%7?_:_-7)};var y=f.startOf;f.startOf=function(_,D){var R=this.$utils(),$=!!R.u(D)||D;return R.p(_)==="isoweek"?$?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):y.bind(this)(_,D)}}}))});var Le=wt((Nt,zt)=>{"use strict";(function(t,e){typeof Nt=="object"&&typeof zt<"u"?zt.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_customParseFormat=e()})(Nt,(function(){"use strict";var t={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},e=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,r=/\d/,i=/\d\d/,s=/\d\d?/,f=/\d*[^-_:/,()\s\d]+/,y={},_=a(function(T){return(T=+T)+(T>68?1900:2e3)},"a"),D=a(function(T){return function(w){this[T]=+w}},"f"),R=[/[+-]\d\d:?(\d\d)?|Z/,function(T){(this.zone||(this.zone={})).offset=(function(w){if(!w||w==="Z")return 0;var v=w.match(/([+-]|\d\d)/g),A=60*v[1]+(+v[2]||0);return A===0?0:v[0]==="+"?-A:A})(T)}],$=a(function(T){var w=y[T];return w&&(w.indexOf?w:w.s.concat(w.f))},"u"),V=a(function(T,w){var v,A=y.meridiem;if(A){for(var X=1;X<=24;X+=1)if(T.indexOf(A(X,0,w))>-1){v=X>12;break}}else v=T===(w?"pm":"PM");return v},"d"),P={A:[f,function(T){this.afternoon=V(T,!1)}],a:[f,function(T){this.afternoon=V(T,!0)}],Q:[r,function(T){this.month=3*(T-1)+1}],S:[r,function(T){this.milliseconds=100*+T}],SS:[i,function(T){this.milliseconds=10*+T}],SSS:[/\d{3}/,function(T){this.milliseconds=+T}],s:[s,D("seconds")],ss:[s,D("seconds")],m:[s,D("minutes")],mm:[s,D("minutes")],H:[s,D("hours")],h:[s,D("hours")],HH:[s,D("hours")],hh:[s,D("hours")],D:[s,D("day")],DD:[i,D("day")],Do:[f,function(T){var w=y.ordinal,v=T.match(/\d+/);if(this.day=v[0],w)for(var A=1;A<=31;A+=1)w(A).replace(/\[|\]/g,"")===T&&(this.day=A)}],w:[s,D("week")],ww:[i,D("week")],M:[s,D("month")],MM:[i,D("month")],MMM:[f,function(T){var w=$("months"),v=($("monthsShort")||w.map((function(A){return A.slice(0,3)}))).indexOf(T)+1;if(v<1)throw new Error;this.month=v%12||v}],MMMM:[f,function(T){var w=$("months").indexOf(T)+1;if(w<1)throw new Error;this.month=w%12||w}],Y:[/[+-]?\d+/,D("year")],YY:[i,function(T){this.year=_(T)}],YYYY:[/\d{4}/,D("year")],Z:R,ZZ:R};function H(T){var w,v;w=T,v=y&&y.formats;for(var A=(T=w.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(W,O,k){var g=k&&k.toUpperCase();return O||v[k]||t[k]||v[g].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(x,b,o){return b||o.slice(1)}))}))).match(e),X=A.length,U=0;U<X;U+=1){var I=A[U],p=P[I],m=p&&p[0],Y=p&&p[1];A[U]=Y?{regex:m,parser:Y}:I.replace(/^\[|\]$/g,"")}return function(W){for(var O={},k=0,g=0;k<X;k+=1){var x=A[k];if(typeof x=="string")g+=x.length;else{var b=x.regex,o=x.parser,h=W.slice(g),d=b.exec(h)[0];o.call(O,d),W=W.replace(d,"")}}return(function(u){var C=u.afternoon;if(C!==void 0){var n=u.hours;C?n<12&&(u.hours+=12):n===12&&(u.hours=0),delete u.afternoon}})(O),O}}return a(H,"l"),function(T,w,v){v.p.customParseFormat=!0,T&&T.parseTwoDigitYear&&(_=T.parseTwoDigitYear);var A=w.prototype,X=A.parse;A.parse=function(U){var I=U.date,p=U.utc,m=U.args;this.$u=p;var Y=m[1];if(typeof Y=="string"){var W=m[2]===!0,O=m[3]===!0,k=W||O,g=m[2];O&&(g=m[2]),y=this.$locale(),!W&&g&&(y=v.Ls[g]),this.$d=(function(h,d,u,C){try{if(["x","X"].indexOf(d)>-1)return new Date((d==="X"?1e3:1)*h);var n=H(d)(h),M=n.year,l=n.month,j=n.day,c=n.hours,S=n.minutes,E=n.seconds,N=n.milliseconds,z=n.zone,L=n.week,F=new Date,et=j||(M||l?1:F.getDate()),nt=M||F.getFullYear(),lt=0;M&&!l||(lt=l>0?l-1:F.getMonth());var pt,gt=c||0,B=S||0,at=E||0,K=N||0;return z?new Date(Date.UTC(nt,lt,et,gt,B,at,K+60*z.offset*1e3)):u?new Date(Date.UTC(nt,lt,et,gt,B,at,K)):(pt=new Date(nt,lt,et,gt,B,at,K),L&&(pt=C(pt).week(L).toDate()),pt)}catch{return new Date("")}})(I,Y,p,v),this.init(),g&&g!==!0&&(this.$L=this.locale(g).$L),k&&I!=this.format(Y)&&(this.$d=new Date("")),y={}}else if(Y instanceof Array)for(var x=Y.length,b=1;b<=x;b+=1){m[1]=Y[b-1];var o=v.apply(this,m);if(o.isValid()){this.$d=o.$d,this.$L=o.$L,this.init();break}b===x&&(this.$d=new Date(""))}else X.call(this,U)}}}))});var Ae=wt((Rt,Ht)=>{"use strict";(function(t,e){typeof Rt=="object"&&typeof Ht<"u"?Ht.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_advancedFormat=e()})(Rt,(function(){"use strict";return function(t,e){var r=e.prototype,i=r.format;r.format=function(s){var f=this,y=this.$locale();if(!this.isValid())return i.bind(this)(s);var _=this.$utils(),D=(s||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(R){switch(R){case"Q":return Math.ceil((f.$M+1)/3);case"Do":return y.ordinal(f.$D);case"gggg":return f.weekYear();case"GGGG":return f.isoWeekYear();case"wo":return y.ordinal(f.week(),"W");case"w":case"ww":return _.s(f.week(),R==="w"?1:2,"0");case"W":case"WW":return _.s(f.isoWeek(),R==="W"?1:2,"0");case"k":case"kk":return _.s(String(f.$H===0?24:f.$H),R==="k"?1:2,"0");case"X":return Math.floor(f.$d.getTime()/1e3);case"x":return f.$d.getTime();case"z":return"["+f.offsetName()+"]";case"zzz":return"["+f.offsetName("long")+"]";default:return R}}));return i.bind(this)(D)}}}))});var Je=wt((ne,ie)=>{"use strict";(function(t,e){typeof ne=="object"&&typeof ie<"u"?ie.exports=e():typeof define=="function"&&define.amd?define(e):(t=typeof globalThis<"u"?globalThis:t||self).dayjs_plugin_duration=e()})(ne,(function(){"use strict";var t,e,r=1e3,i=6e4,s=36e5,f=864e5,y=31536e6,_=2628e6,D=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,R=/\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g,$={years:y,months:_,days:f,hours:s,minutes:i,seconds:r,milliseconds:1,weeks:6048e5},V=a(function(I){return I instanceof X},"c"),P=a(function(I,p,m){return new X(I,m,p.$l)},"f"),H=a(function(I){return e.p(I)+"s"},"m"),T=a(function(I){return I<0},"l"),w=a(function(I){return T(I)?Math.ceil(I):Math.floor(I)},"$"),v=a(function(I){return Math.abs(I)},"y"),A=a(function(I,p){return I?T(I)?{negative:!0,format:""+v(I)+p}:{negative:!1,format:""+I+p}:{negative:!1,format:""}},"v"),X=(function(){function I(m,Y,W){var O=this;if(this.$d={},this.$l=W,m===void 0&&(this.$ms=0,this.parseFromMilliseconds()),Y)return P(m*$[H(Y)],this);if(typeof m=="number")return this.$ms=m,this.parseFromMilliseconds(),this;if(typeof m=="object")return Object.keys(m).forEach((function(x){O.$d[H(x)]=m[x]})),this.calMilliseconds(),this;if(typeof m=="string"){var k=m.match(D);if(k){var g=k.slice(2).map((function(x){return x!=null?Number(x):0}));return this.$d.years=g[0],this.$d.months=g[1],this.$d.weeks=g[2],this.$d.days=g[3],this.$d.hours=g[4],this.$d.minutes=g[5],this.$d.seconds=g[6],this.calMilliseconds(),this}}return this}a(I,"l");var p=I.prototype;return p.calMilliseconds=function(){var m=this;this.$ms=Object.keys(this.$d).reduce((function(Y,W){return Y+(m.$d[W]||0)*$[W]}),0)},p.parseFromMilliseconds=function(){var m=this.$ms;this.$d.years=w(m/y),m%=y,this.$d.months=w(m/_),m%=_,this.$d.days=w(m/f),m%=f,this.$d.hours=w(m/s),m%=s,this.$d.minutes=w(m/i),m%=i,this.$d.seconds=w(m/r),m%=r,this.$d.milliseconds=m},p.toISOString=function(){var m=A(this.$d.years,"Y"),Y=A(this.$d.months,"M"),W=+this.$d.days||0;this.$d.weeks&&(W+=7*this.$d.weeks);var O=A(W,"D"),k=A(this.$d.hours,"H"),g=A(this.$d.minutes,"M"),x=this.$d.seconds||0;this.$d.milliseconds&&(x+=this.$d.milliseconds/1e3,x=Math.round(1e3*x)/1e3);var b=A(x,"S"),o=m.negative||Y.negative||O.negative||k.negative||g.negative||b.negative,h=k.format||g.format||b.format?"T":"",d=(o?"-":"")+"P"+m.format+Y.format+O.format+h+k.format+g.format+b.format;return d==="P"||d==="-P"?"P0D":d},p.toJSON=function(){return this.toISOString()},p.format=function(m){var Y=m||"YYYY-MM-DDTHH:mm:ss",W={Y:this.$d.years,YY:e.s(this.$d.years,2,"0"),YYYY:e.s(this.$d.years,4,"0"),M:this.$d.months,MM:e.s(this.$d.months,2,"0"),D:this.$d.days,DD:e.s(this.$d.days,2,"0"),H:this.$d.hours,HH:e.s(this.$d.hours,2,"0"),m:this.$d.minutes,mm:e.s(this.$d.minutes,2,"0"),s:this.$d.seconds,ss:e.s(this.$d.seconds,2,"0"),SSS:e.s(this.$d.milliseconds,3,"0")};return Y.replace(R,(function(O,k){return k||String(W[O])}))},p.as=function(m){return this.$ms/$[H(m)]},p.get=function(m){var Y=this.$ms,W=H(m);return W==="milliseconds"?Y%=1e3:Y=W==="weeks"?w(Y/$[W]):this.$d[W],Y||0},p.add=function(m,Y,W){var O;return O=Y?m*$[H(Y)]:V(m)?m.$ms:P(m,this).$ms,P(this.$ms+O*(W?-1:1),this)},p.subtract=function(m,Y){return this.add(m,Y,!0)},p.locale=function(m){var Y=this.clone();return Y.$l=m,Y},p.clone=function(){return P(this.$ms,this)},p.humanize=function(m){return t().add(this.$ms,"ms").locale(this.$l).fromNow(!m)},p.valueOf=function(){return this.asMilliseconds()},p.milliseconds=function(){return this.get("milliseconds")},p.asMilliseconds=function(){return this.as("milliseconds")},p.seconds=function(){return this.get("seconds")},p.asSeconds=function(){return this.as("seconds")},p.minutes=function(){return this.get("minutes")},p.asMinutes=function(){return this.as("minutes")},p.hours=function(){return this.get("hours")},p.asHours=function(){return this.as("hours")},p.days=function(){return this.get("days")},p.asDays=function(){return this.as("days")},p.weeks=function(){return this.get("weeks")},p.asWeeks=function(){return this.as("weeks")},p.months=function(){return this.get("months")},p.asMonths=function(){return this.as("months")},p.years=function(){return this.get("years")},p.asYears=function(){return this.as("years")},I})(),U=a(function(I,p,m){return I.add(p.years()*m,"y").add(p.months()*m,"M").add(p.days()*m,"d").add(p.hours()*m,"h").add(p.minutes()*m,"m").add(p.seconds()*m,"s").add(p.milliseconds()*m,"ms")},"p");return function(I,p,m){t=m,e=m().$utils(),m.duration=function(O,k){var g=m.locale();return P(O,{$l:g},k)},m.isDuration=V;var Y=p.prototype.add,W=p.prototype.subtract;p.prototype.add=function(O,k){return V(O)?U(this,O,1):Y.bind(this)(O,k)},p.prototype.subtract=function(O,k){return V(O)?U(this,O,-1):W.bind(this)(O,k)}}}))});var Wt=(function(){var t=a(function(b,o,h,d){for(h=h||{},d=b.length;d--;h[b[d]]=o);return h},"o"),e=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],r=[1,26],i=[1,27],s=[1,28],f=[1,29],y=[1,30],_=[1,31],D=[1,32],R=[1,33],$=[1,34],V=[1,9],P=[1,10],H=[1,11],T=[1,12],w=[1,13],v=[1,14],A=[1,15],X=[1,16],U=[1,19],I=[1,20],p=[1,21],m=[1,22],Y=[1,23],W=[1,25],O=[1,35],k={trace:a(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:a(function(o,h,d,u,C,n,M){var l=n.length-1;switch(C){case 1:return n[l-1];case 2:this.$=[];break;case 3:n[l-1].push(n[l]),this.$=n[l-1];break;case 4:case 5:this.$=n[l];break;case 6:case 7:this.$=[];break;case 8:u.setWeekday("monday");break;case 9:u.setWeekday("tuesday");break;case 10:u.setWeekday("wednesday");break;case 11:u.setWeekday("thursday");break;case 12:u.setWeekday("friday");break;case 13:u.setWeekday("saturday");break;case 14:u.setWeekday("sunday");break;case 15:u.setWeekend("friday");break;case 16:u.setWeekend("saturday");break;case 17:u.setDateFormat(n[l].substr(11)),this.$=n[l].substr(11);break;case 18:u.enableInclusiveEndDates(),this.$=n[l].substr(18);break;case 19:u.TopAxis(),this.$=n[l].substr(8);break;case 20:u.setAxisFormat(n[l].substr(11)),this.$=n[l].substr(11);break;case 21:u.setTickInterval(n[l].substr(13)),this.$=n[l].substr(13);break;case 22:u.setExcludes(n[l].substr(9)),this.$=n[l].substr(9);break;case 23:u.setIncludes(n[l].substr(9)),this.$=n[l].substr(9);break;case 24:u.setTodayMarker(n[l].substr(12)),this.$=n[l].substr(12);break;case 27:u.setDiagramTitle(n[l].substr(6)),this.$=n[l].substr(6);break;case 28:this.$=n[l].trim(),u.setAccTitle(this.$);break;case 29:case 30:this.$=n[l].trim(),u.setAccDescription(this.$);break;case 31:u.addSection(n[l].substr(8)),this.$=n[l].substr(8);break;case 33:u.addTask(n[l-1],n[l]),this.$="task";break;case 34:this.$=n[l-1],u.setClickEvent(n[l-1],n[l],null);break;case 35:this.$=n[l-2],u.setClickEvent(n[l-2],n[l-1],n[l]);break;case 36:this.$=n[l-2],u.setClickEvent(n[l-2],n[l-1],null),u.setLink(n[l-2],n[l]);break;case 37:this.$=n[l-3],u.setClickEvent(n[l-3],n[l-2],n[l-1]),u.setLink(n[l-3],n[l]);break;case 38:this.$=n[l-2],u.setClickEvent(n[l-2],n[l],null),u.setLink(n[l-2],n[l-1]);break;case 39:this.$=n[l-3],u.setClickEvent(n[l-3],n[l-1],n[l]),u.setLink(n[l-3],n[l-2]);break;case 40:this.$=n[l-1],u.setLink(n[l-1],n[l]);break;case 41:case 47:this.$=n[l-1]+" "+n[l];break;case 42:case 43:case 45:this.$=n[l-2]+" "+n[l-1]+" "+n[l];break;case 44:case 46:this.$=n[l-3]+" "+n[l-2]+" "+n[l-1]+" "+n[l];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:r,13:i,14:s,15:f,16:y,17:_,18:D,19:18,20:R,21:$,22:V,23:P,24:H,25:T,26:w,27:v,28:A,29:X,30:U,31:I,33:p,35:m,36:Y,37:24,38:W,40:O},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:36,11:17,12:r,13:i,14:s,15:f,16:y,17:_,18:D,19:18,20:R,21:$,22:V,23:P,24:H,25:T,26:w,27:v,28:A,29:X,30:U,31:I,33:p,35:m,36:Y,37:24,38:W,40:O},t(e,[2,5]),t(e,[2,6]),t(e,[2,17]),t(e,[2,18]),t(e,[2,19]),t(e,[2,20]),t(e,[2,21]),t(e,[2,22]),t(e,[2,23]),t(e,[2,24]),t(e,[2,25]),t(e,[2,26]),t(e,[2,27]),{32:[1,37]},{34:[1,38]},t(e,[2,30]),t(e,[2,31]),t(e,[2,32]),{39:[1,39]},t(e,[2,8]),t(e,[2,9]),t(e,[2,10]),t(e,[2,11]),t(e,[2,12]),t(e,[2,13]),t(e,[2,14]),t(e,[2,15]),t(e,[2,16]),{41:[1,40],43:[1,41]},t(e,[2,4]),t(e,[2,28]),t(e,[2,29]),t(e,[2,33]),t(e,[2,34],{42:[1,42],43:[1,43]}),t(e,[2,40],{41:[1,44]}),t(e,[2,35],{43:[1,45]}),t(e,[2,36]),t(e,[2,38],{42:[1,46]}),t(e,[2,37]),t(e,[2,39])],defaultActions:{},parseError:a(function(o,h){if(h.recoverable)this.trace(o);else{var d=new Error(o);throw d.hash=h,d}},"parseError"),parse:a(function(o){var h=this,d=[0],u=[],C=[null],n=[],M=this.table,l="",j=0,c=0,S=0,E=2,N=1,z=n.slice.call(arguments,1),L=Object.create(this.lexer),F={yy:{}};for(var et in this.yy)Object.prototype.hasOwnProperty.call(this.yy,et)&&(F.yy[et]=this.yy[et]);L.setInput(o,F.yy),F.yy.lexer=L,F.yy.parser=this,typeof L.yylloc>"u"&&(L.yylloc={});var nt=L.yylloc;n.push(nt);var lt=L.options&&L.options.ranges;typeof F.yy.parseError=="function"?this.parseError=F.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function pt(Z){d.length=d.length-2*Z,C.length=C.length-Z,n.length=n.length-Z}a(pt,"popStack");function gt(){var Z;return Z=u.pop()||L.lex()||N,typeof Z!="number"&&(Z instanceof Array&&(u=Z,Z=u.pop()),Z=h.symbols_[Z]||Z),Z}a(gt,"lex");for(var B,at,K,q,Gn,Mt,ut={},Tt,it,re,vt;;){if(K=d[d.length-1],this.defaultActions[K]?q=this.defaultActions[K]:((B===null||typeof B>"u")&&(B=gt()),q=M[K]&&M[K][B]),typeof q>"u"||!q.length||!q[0]){var Et="";vt=[];for(Tt in M[K])this.terminals_[Tt]&&Tt>E&&vt.push("'"+this.terminals_[Tt]+"'");L.showPosition?Et="Parse error on line "+(j+1)+`:
`+L.showPosition()+`
Expecting `+vt.join(", ")+", got '"+(this.terminals_[B]||B)+"'":Et="Parse error on line "+(j+1)+": Unexpected "+(B==N?"end of input":"'"+(this.terminals_[B]||B)+"'"),this.parseError(Et,{text:L.match,token:this.terminals_[B]||B,line:L.yylineno,loc:nt,expected:vt})}if(q[0]instanceof Array&&q.length>1)throw new Error("Parse Error: multiple actions possible at state: "+K+", token: "+B);switch(q[0]){case 1:d.push(B),C.push(L.yytext),n.push(L.yylloc),d.push(q[1]),B=null,at?(B=at,at=null):(c=L.yyleng,l=L.yytext,j=L.yylineno,nt=L.yylloc,S>0&&S--);break;case 2:if(it=this.productions_[q[1]][1],ut.$=C[C.length-it],ut._$={first_line:n[n.length-(it||1)].first_line,last_line:n[n.length-1].last_line,first_column:n[n.length-(it||1)].first_column,last_column:n[n.length-1].last_column},lt&&(ut._$.range=[n[n.length-(it||1)].range[0],n[n.length-1].range[1]]),Mt=this.performAction.apply(ut,[l,c,j,F.yy,q[1],C,n].concat(z)),typeof Mt<"u")return Mt;it&&(d=d.slice(0,-1*it*2),C=C.slice(0,-1*it),n=n.slice(0,-1*it)),d.push(this.productions_[q[1]][0]),C.push(ut.$),n.push(ut._$),re=M[d[d.length-2]][d[d.length-1]],d.push(re);break;case 3:return!0}}return!0},"parse")},g=(function(){var b={EOF:1,parseError:a(function(h,d){if(this.yy.parser)this.yy.parser.parseError(h,d);else throw new Error(h)},"parseError"),setInput:a(function(o,h){return this.yy=h||this.yy||{},this._input=o,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:a(function(){var o=this._input[0];this.yytext+=o,this.yyleng++,this.offset++,this.match+=o,this.matched+=o;var h=o.match(/(?:\r\n?|\n).*/g);return h?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),o},"input"),unput:a(function(o){var h=o.length,d=o.split(/(?:\r\n?|\n)/g);this._input=o+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-h),this.offset-=h;var u=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),d.length-1&&(this.yylineno-=d.length-1);var C=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:d?(d.length===u.length?this.yylloc.first_column:0)+u[u.length-d.length].length-d[0].length:this.yylloc.first_column-h},this.options.ranges&&(this.yylloc.range=[C[0],C[0]+this.yyleng-h]),this.yyleng=this.yytext.length,this},"unput"),more:a(function(){return this._more=!0,this},"more"),reject:a(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:a(function(o){this.unput(this.match.slice(o))},"less"),pastInput:a(function(){var o=this.matched.substr(0,this.matched.length-this.match.length);return(o.length>20?"...":"")+o.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:a(function(){var o=this.match;return o.length<20&&(o+=this._input.substr(0,20-o.length)),(o.substr(0,20)+(o.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:a(function(){var o=this.pastInput(),h=new Array(o.length+1).join("-");return o+this.upcomingInput()+`
`+h+"^"},"showPosition"),test_match:a(function(o,h){var d,u,C;if(this.options.backtrack_lexer&&(C={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(C.yylloc.range=this.yylloc.range.slice(0))),u=o[0].match(/(?:\r\n?|\n).*/g),u&&(this.yylineno+=u.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:u?u[u.length-1].length-u[u.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],d=this.performAction.call(this,this.yy,this,h,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),d)return d;if(this._backtrack){for(var n in C)this[n]=C[n];return!1}return!1},"test_match"),next:a(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var o,h,d,u;this._more||(this.yytext="",this.match="");for(var C=this._currentRules(),n=0;n<C.length;n++)if(d=this._input.match(this.rules[C[n]]),d&&(!h||d[0].length>h[0].length)){if(h=d,u=n,this.options.backtrack_lexer){if(o=this.test_match(d,C[n]),o!==!1)return o;if(this._backtrack){h=!1;continue}else return!1}else if(!this.options.flex)break}return h?(o=this.test_match(h,C[u]),o!==!1?o:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:a(function(){var h=this.next();return h||this.lex()},"lex"),begin:a(function(h){this.conditionStack.push(h)},"begin"),popState:a(function(){var h=this.conditionStack.length-1;return h>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:a(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:a(function(h){return h=this.conditionStack.length-1-Math.abs(h||0),h>=0?this.conditionStack[h]:"INITIAL"},"topState"),pushState:a(function(h){this.begin(h)},"pushState"),stateStackSize:a(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:a(function(h,d,u,C){var n=C;switch(u){case 0:return this.begin("open_directive"),"open_directive";break;case 1:return this.begin("acc_title"),31;break;case 2:return this.popState(),"acc_title_value";break;case 3:return this.begin("acc_descr"),33;break;case 4:return this.popState(),"acc_descr_value";break;case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return b})();k.lexer=g;function x(){this.yy={}}return a(x,"Parser"),x.prototype=k,k.Parser=x,new x})();Wt.parser=Wt;var $e=Wt;var We=ot(rn(),1),Q=ot(ae(),1),Ve=ot(Ie(),1),Pe=ot(Le(),1),Ne=ot(Ae(),1);Q.default.extend(Ve.default);Q.default.extend(Pe.default);Q.default.extend(Ne.default);var Oe={friday:5,saturday:6},tt="",Xt="",Ut,qt="",ht=[],mt=[],Zt=new Map,Qt=[],St=[],kt="",Kt="",ze=["active","done","crit","milestone","vert"],Jt=[],dt="",bt=!1,te=!1,ee="sunday",Ct="saturday",jt=0,an=a(function(){Qt=[],St=[],kt="",Jt=[],_t=0,Gt=void 0,Dt=void 0,G=[],tt="",Xt="",Kt="",Ut=void 0,qt="",ht=[],mt=[],bt=!1,te=!1,jt=0,Zt=new Map,dt="",le(),ee="sunday",Ct="saturday"},"clear"),on=a(function(t){dt=t},"setDiagramId"),cn=a(function(t){Xt=t},"setAxisFormat"),ln=a(function(){return Xt},"getAxisFormat"),un=a(function(t){Ut=t},"setTickInterval"),dn=a(function(){return Ut},"getTickInterval"),fn=a(function(t){qt=t},"setTodayMarker"),hn=a(function(){return qt},"getTodayMarker"),mn=a(function(t){tt=t},"setDateFormat"),kn=a(function(){bt=!0},"enableInclusiveEndDates"),yn=a(function(){return bt},"endDatesAreInclusive"),pn=a(function(){te=!0},"enableTopAxis"),gn=a(function(){return te},"topAxisEnabled"),xn=a(function(t){Kt=t},"setDisplayMode"),bn=a(function(){return Kt},"getDisplayMode"),Tn=a(function(){return tt},"getDateFormat"),Re=a((t,e)=>{let r=e.toLowerCase().split(/[\s,]+/).filter(i=>i!=="");return[...new Set([...t,...r])]},"mergeTokens"),vn=a(function(t){ht=Re(ht,t)},"setIncludes"),wn=a(function(){return ht},"getIncludes"),_n=a(function(t){mt=Re(mt,t)},"setExcludes"),Dn=a(function(){return mt},"getExcludes"),Sn=a(function(){return Zt},"getLinks"),Cn=a(function(t){kt=t,Qt.push(t)},"addSection"),Mn=a(function(){return Qt},"getSections"),En=a(function(){let t=Fe(),e=10,r=0;for(;!t&&r<e;)t=Fe(),r++;return St=G,St},"getTasks"),He=a(function(t,e,r,i){let s=t.format(e.trim()),f=t.format("YYYY-MM-DD");return i.includes(s)||i.includes(f)?!1:r.includes("weekends")&&(t.isoWeekday()===Oe[Ct]||t.isoWeekday()===Oe[Ct]+1)||r.includes(t.format("dddd").toLowerCase())?!0:r.includes(s)||r.includes(f)},"isInvalidDate"),Yn=a(function(t){ee=t},"setWeekday"),$n=a(function(){return ee},"getWeekday"),In=a(function(t){Ct=t},"setWeekend"),je=a(function(t,e,r,i){if(!r.length||t.manualEndTime)return;let s;t.startTime instanceof Date?s=(0,Q.default)(t.startTime):s=(0,Q.default)(t.startTime,e,!0),s=s.add(1,"d");let f;t.endTime instanceof Date?f=(0,Q.default)(t.endTime):f=(0,Q.default)(t.endTime,e,!0);let[y,_]=Ln(s,f,e,r,i);t.endTime=y.toDate(),t.renderEndTime=_},"checkTaskDates"),Ln=a(function(t,e,r,i,s){let f=!1,y=null,_=e.add(1e4,"d");for(;t<=e;){if(f||(y=e.toDate()),f=He(t,r,i,s),f&&(e=e.add(1,"d"),e>_))throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");t=t.add(1,"d")}return[e,y]},"fixTaskDates"),Be=a(function(t,e){J.warn(`Gantt: the "${t}" statement references unknown task id(s): ${e.join(", ")}. Make sure the referenced tasks exist and declare an id. Milestones need both an id and a duration, e.g. "Milestone :milestone, m1, 2023-01-01, 0d".`)},"warnAboutUnknownTaskIds"),Bt=a(function(t,e,r){if(r=r.trim(),a(_=>{let D=_.trim();return D==="x"||D==="X"},"isTimestampFormat")(e)&&/^\d+$/.test(r))return new Date(Number(r));let f=/^after\s+(?<ids>[\d\w- ]+)/.exec(r);if(f!==null){let _=null,D=[],R=f.groups.ids.split(" ").filter(V=>V!=="");for(let V of R){let P=ct(V);if(P===void 0){D.push(V);continue}(!_||P.endTime>_.endTime)&&(_=P)}if(D.length>0&&Be("after",D),_)return _.endTime;let $=new Date;return $.setHours(0,0,0,0),$}let y=(0,Q.default)(r,e.trim(),!0);if(y.isValid())return y.toDate();{J.debug("Invalid date:"+r),J.debug("With date format:"+e.trim());let _=new Date(r);if(_===void 0||isNaN(_.getTime())||_.getFullYear()<-1e4||_.getFullYear()>1e4)throw new Error("Invalid date:"+r);return _}},"getStartDate"),Ge=a(function(t){let e=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return e!==null?[Number.parseFloat(e[1]),e[2]]:[NaN,"ms"]},"parseDuration"),Xe=a(function(t,e,r,i=!1){r=r.trim();let f=/^until\s+(?<ids>[\d\w- ]+)/.exec(r);if(f!==null){let $=null,V=[],P=f.groups.ids.split(" ").filter(T=>T!=="");for(let T of P){let w=ct(T);if(w===void 0){V.push(T);continue}(!$||w.startTime<$.startTime)&&($=w)}if(V.length>0&&Be("until",V),$)return $.startTime;let H=new Date;return H.setHours(0,0,0,0),H}let y=(0,Q.default)(r,e.trim(),!0);if(y.isValid())return i&&(y=y.add(1,"d")),y.toDate();let _=(0,Q.default)(t),[D,R]=Ge(r);if(Number.isNaN(D))J.warn(`Gantt: "${r}" is neither a valid date for the "${e.trim()}" date format nor a valid duration (e.g. "3d"), so it is ignored and the task gets a zero duration. Milestones need a duration too, e.g. "Milestone :milestone, m1, 2023-01-01, 0d".`);else{let $=_.add(D,R);$.isValid()&&(_=$)}return _.toDate()},"getEndDate"),_t=0,ft=a(function(t){return t===void 0?(_t=_t+1,"task"+_t):t},"parseId"),An=a(function(t,e){let r;e.substr(0,1)===":"?r=e.substr(1,e.length):r=e;let i=r.split(","),s={};Ke(i,s,ze);for(let y=0;y<i.length;y++)i[y]=i[y].trim();let f="";switch(i.length){case 1:s.id=ft(),s.startTime=t.endTime,f=i[0];break;case 2:s.id=ft(),s.startTime=Bt(void 0,tt,i[0]),f=i[1];break;case 3:s.id=ft(i[0]),s.startTime=Bt(void 0,tt,i[1]),f=i[2];break;default:}return f&&(s.endTime=Xe(s.startTime,tt,f,bt),s.manualEndTime=(0,Q.default)(f,"YYYY-MM-DD",!0).isValid(),je(s,tt,mt,ht)),s},"compileData"),On=a(function(t,e){let r;e.substr(0,1)===":"?r=e.substr(1,e.length):r=e;let i=r.split(","),s={};Ke(i,s,ze);for(let f=0;f<i.length;f++)i[f]=i[f].trim();switch(i.length){case 1:s.id=ft(),s.startTime={type:"prevTaskEnd",id:t},s.endTime={data:i[0]};break;case 2:s.id=ft(),s.startTime={type:"getStartDate",startData:i[0]},s.endTime={data:i[1]};break;case 3:s.id=ft(i[0]),s.startTime={type:"getStartDate",startData:i[1]},s.endTime={data:i[2]};break;default:}return s},"parseData"),Gt,Dt,G=[],Ue={},Fn=a(function(t,e){let r={section:kt,type:kt,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:e},task:t,classes:[]},i=On(Dt,e);r.raw.startTime=i.startTime,r.raw.endTime=i.endTime,r.id=i.id,r.prevTaskId=Dt,r.active=i.active,r.done=i.done,r.crit=i.crit,r.milestone=i.milestone,r.vert=i.vert,r.vert?r.order=-1:(r.order=jt,jt++);let s=G.push(r);Dt=r.id,Ue[r.id]=s-1},"addTask"),ct=a(function(t){let e=Ue[t];return G[e]},"findTaskById"),Wn=a(function(t,e){let r={section:kt,type:kt,description:t,task:t,classes:[]},i=An(Gt,e);r.startTime=i.startTime,r.endTime=i.endTime,r.id=i.id,r.active=i.active,r.done=i.done,r.crit=i.crit,r.milestone=i.milestone,r.vert=i.vert,Gt=r,St.push(r)},"addTaskOrg"),Fe=a(function(){let t=a(function(r){let i=G[r],s="";switch(G[r].raw.startTime.type){case"prevTaskEnd":{let f=ct(i.prevTaskId);i.startTime=f.endTime;break}case"getStartDate":s=Bt(void 0,tt,G[r].raw.startTime.startData),s&&(G[r].startTime=s);break}return G[r].startTime&&(G[r].endTime=Xe(G[r].startTime,tt,G[r].raw.endTime.data,bt),G[r].endTime&&(G[r].processed=!0,G[r].manualEndTime=(0,Q.default)(G[r].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),je(G[r],tt,mt,ht))),G[r].processed},"compileTask"),e=!0;for(let[r,i]of G.entries())t(r),e=e&&i.processed;return e},"compileTasks"),Vn=a(function(t,e){let r=e;rt().securityLevel!=="loose"&&(r=(0,We.sanitizeUrl)(e)),t.split(",").forEach(function(i){ct(i)!==void 0&&(Ze(i,()=>{window.open(r,"_self")}),Zt.set(i,r))}),qe(t,"clickable")},"setLink"),qe=a(function(t,e){t.split(",").forEach(function(r){let i=ct(r);i!==void 0&&i.classes.push(e)})},"setClass"),Pn=a(function(t,e,r){if(rt().securityLevel!=="loose"||e===void 0)return;let i=[];if(typeof r=="string"){i=r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let f=0;f<i.length;f++){let y=i[f].trim();y.startsWith('"')&&y.endsWith('"')&&(y=y.substr(1,y.length-2)),i[f]=y}}i.length===0&&i.push(t),ct(t)!==void 0&&Ze(t,()=>{Ye.runFunc(e,...i)})},"setClickFun"),Ze=a(function(t,e){Jt.push(function(){let r=dt?`${dt}-${t}`:t,i=document.querySelector(`[id="${r}"]`);i!==null&&i.addEventListener("click",function(){e()})},function(){let r=dt?`${dt}-${t}`:t,i=document.querySelector(`[id="${r}-text"]`);i!==null&&i.addEventListener("click",function(){e()})})},"pushFun"),Nn=a(function(t,e,r){t.split(",").forEach(function(i){Pn(i,e,r)}),qe(t,"clickable")},"setClickEvent"),zn=a(function(t){Jt.forEach(function(e){e(t)})},"bindFunctions"),Qe={getConfig:a(()=>rt().gantt,"getConfig"),clear:an,setDateFormat:mn,getDateFormat:Tn,enableInclusiveEndDates:kn,endDatesAreInclusive:yn,enableTopAxis:pn,topAxisEnabled:gn,setAxisFormat:cn,getAxisFormat:ln,setTickInterval:un,getTickInterval:dn,setTodayMarker:fn,getTodayMarker:hn,setAccTitle:ue,getAccTitle:de,setDiagramTitle:me,getDiagramTitle:ke,setDiagramId:on,setDisplayMode:xn,getDisplayMode:bn,setAccDescription:fe,getAccDescription:he,addSection:Cn,getSections:Mn,getTasks:En,addTask:Fn,findTaskById:ct,addTaskOrg:Wn,setIncludes:vn,getIncludes:wn,setExcludes:_n,getExcludes:Dn,setClickEvent:Nn,setLink:Vn,getLinks:Sn,bindFunctions:zn,parseDuration:Ge,isInvalidDate:He,setWeekday:Yn,getWeekday:$n,setWeekend:In};function Ke(t,e,r){let i=!0;for(;i;)i=!1,r.forEach(function(s){let f="^\\s*"+s+"\\s*$",y=new RegExp(f);t[0].match(y)&&(e[s]=!0,t.shift(1),i=!0)})}a(Ke,"getTaskTags");var yt=ot(ae(),1),en=ot(Je(),1);yt.default.extend(en.default);var Rn=a(function(){J.debug("Something is calling, setConf, remove the call")},"setConf"),tn={monday:we,tuesday:_e,wednesday:De,thursday:Se,friday:Ce,saturday:Me,sunday:ve},Hn=a((t,e)=>{let r=[...t].map(()=>-1/0),i=[...t].sort((f,y)=>f.startTime-y.startTime||f.order-y.order),s=0;for(let f of i)for(let y=0;y<r.length;y++)if(f.startTime>=r[y]){r[y]=f.endTime,f.order=y+e,y>s&&(s=y);break}return s},"getMaxIntersections"),st,se=1e4,jn=a(function(t,e,r,i){let s=rt().gantt;i.db.setDiagramId(e);let f=rt().securityLevel,y;f==="sandbox"&&(y=xt("#i"+e));let _=f==="sandbox"?xt(y.nodes()[0].contentDocument.body):xt("body"),D=f==="sandbox"?y.nodes()[0].contentDocument:document,R=D.getElementById(e);st=R.parentElement.offsetWidth,st===void 0&&(st=1200),s.useWidth!==void 0&&(st=s.useWidth);let $=i.db.getTasks(),V=$.filter(k=>!k.vert),P=[];for(let k of V)P.push(k.type);P=O(P);let H={},T=2*s.topPadding;if(i.db.getDisplayMode()==="compact"||s.displayMode==="compact"){let k={};for(let x of V)k[x.section]===void 0?k[x.section]=[x]:k[x.section].push(x);let g=0;for(let x of Object.keys(k)){let b=Hn(k[x],g)+1;g+=b,T+=b*(s.barHeight+s.barGap),H[x]=b}}else{T+=V.length*(s.barHeight+s.barGap);for(let k of P)H[k]=V.filter(g=>g.type===k).length}R.setAttribute("viewBox","0 0 "+st+" "+T);let w=_.select(`[id="${e}"]`),v=Ee().domain([pe($,function(k){return k.startTime}),ye($,function(k){return k.endTime})]).rangeRound([0,st-s.leftPadding-s.rightPadding]);function A(k,g){let x=k.startTime,b=g.startTime,o=0;return x>b?o=1:x<b&&(o=-1),o}a(A,"taskCompare"),$.sort(A),X($,st,T),ce(w,T,st,s.useMaxWidth),w.append("text").text(i.db.getDiagramTitle()).attr("x",st/2).attr("y",s.titleTopMargin).attr("class","titleText");function X(k,g,x){let b=s.barHeight,o=b+s.barGap,h=s.topPadding,d=s.leftPadding,u=Te().domain([0,P.length]).range(["#00B9FA","#F95002"]).interpolate(be);I(o,h,d,g,x,k,i.db.getExcludes(),i.db.getIncludes()),m(d,h,g,x),U(k,o,h,d,b,u,g,x),Y(o,h,d,b,u),W(d,h,g,x)}a(X,"makeGantt");function U(k,g,x,b,o,h,d){k.sort((c,S)=>c.vert===S.vert?0:c.vert?1:-1);let u=k.filter(c=>!c.vert),n=[...new Set(u.map(c=>c.order))].map(c=>u.find(S=>S.order===c));w.append("g").selectAll("rect").data(n).enter().append("rect").attr("x",0).attr("y",function(c,S){return S=c.order,S*g+x-2}).attr("width",function(){return d-s.rightPadding/2}).attr("height",g).attr("class",function(c){for(let[S,E]of P.entries())if(c.type===E)return"section section"+S%s.numberSectionStyles;return"section section0"}).enter();let M=w.append("g").selectAll("rect").data(k).enter(),l=i.db.getLinks();if(M.append("rect").attr("id",function(c){return e+"-"+c.id}).attr("rx",3).attr("ry",3).attr("x",function(c){return c.milestone?v(c.startTime)+b+.5*(v(c.endTime)-v(c.startTime))-.5*o:v(c.startTime)+b}).attr("y",function(c,S){return S=c.order,c.vert?s.gridLineStartPadding:S*g+x}).attr("width",function(c){return c.milestone?o:c.vert?.08*o:v(c.renderEndTime||c.endTime)-v(c.startTime)}).attr("height",function(c){return c.vert?u.length*(s.barHeight+s.barGap)+s.barHeight*2:o}).attr("transform-origin",function(c,S){return S=c.order,(v(c.startTime)+b+.5*(v(c.endTime)-v(c.startTime))).toString()+"px "+(S*g+x+.5*o).toString()+"px"}).attr("class",function(c){let S="task",E="";c.classes.length>0&&(E=c.classes.join(" "));let N=0;for(let[L,F]of P.entries())c.type===F&&(N=L%s.numberSectionStyles);let z="";return c.active?c.crit?z+=" activeCrit":z=" active":c.done?c.crit?z=" doneCrit":z=" done":c.crit&&(z+=" crit"),z.length===0&&(z=" task"),c.milestone&&(z=" milestone "+z),c.vert&&(z=" vert "+z),z+=N,z+=" "+E,S+z}),M.append("text").attr("id",function(c){return e+"-"+c.id+"-text"}).text(function(c){return c.task}).attr("font-size",s.fontSize).attr("x",function(c){let S=v(c.startTime),E=v(c.renderEndTime||c.endTime);if(c.milestone&&(S+=.5*(v(c.endTime)-v(c.startTime))-.5*o,E=S+o),c.vert)return v(c.startTime)+b;let N=this.getBBox().width;return N>E-S?E+N+1.5*s.leftPadding>d?S+b-5:E+b+5:(E-S)/2+S+b}).attr("y",function(c,S){return c.vert?s.gridLineStartPadding+u.length*(s.barHeight+s.barGap)+60:(S=c.order,S*g+s.barHeight/2+(s.fontSize/2-2)+x)}).attr("text-height",o).attr("class",function(c){let S=v(c.startTime),E=v(c.endTime);c.milestone&&(E=S+o);let N=this.getBBox().width,z="";c.classes.length>0&&(z=c.classes.join(" "));let L=0;for(let[et,nt]of P.entries())c.type===nt&&(L=et%s.numberSectionStyles);let F="";return c.active&&(c.crit?F="activeCritText"+L:F="activeText"+L),c.done?c.crit?F=F+" doneCritText"+L:F=F+" doneText"+L:c.crit&&(F=F+" critText"+L),c.milestone&&(F+=" milestoneText"),c.vert&&(F+=" vertText"),N>E-S?E+N+1.5*s.leftPadding>d?z+" taskTextOutsideLeft taskTextOutside"+L+" "+F:z+" taskTextOutsideRight taskTextOutside"+L+" "+F+" width-"+N:z+" taskText taskText"+L+" "+F+" width-"+N}),rt().securityLevel==="sandbox"){let c;c=xt("#i"+e);let S=c.nodes()[0].contentDocument;M.filter(function(E){return l.has(E.id)}).each(function(E){var N=S.querySelector("#"+CSS.escape(e+"-"+E.id)),z=S.querySelector("#"+CSS.escape(e+"-"+E.id+"-text"));let L=N.parentNode;var F=S.createElement("a");F.setAttribute("xlink:href",l.get(E.id)),F.setAttribute("target","_top"),L.appendChild(F),F.appendChild(N),F.appendChild(z)})}}a(U,"drawRects");function I(k,g,x,b,o,h,d,u){if(d.length===0&&u.length===0)return;let C,n;for(let{startTime:E,endTime:N}of h)(C===void 0||E<C)&&(C=E),(n===void 0||N>n)&&(n=N);if(!C||!n)return;if((0,yt.default)(n).diff((0,yt.default)(C),"year")>5){J.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}let M=i.db.getDateFormat(),l=[],j=null,c=(0,yt.default)(C);for(;c.valueOf()<=n;)i.db.isInvalidDate(c,M,d,u)?j?j.end=c:j={start:c,end:c}:j&&(l.push(j),j=null),c=c.add(1,"d");w.append("g").selectAll("rect").data(l).enter().append("rect").attr("id",E=>e+"-exclude-"+E.start.format("YYYY-MM-DD")).attr("x",E=>v(E.start.startOf("day"))+x).attr("y",s.gridLineStartPadding).attr("width",E=>v(E.end.endOf("day"))-v(E.start.startOf("day"))).attr("height",o-g-s.gridLineStartPadding).attr("transform-origin",function(E,N){return(v(E.start)+x+.5*(v(E.end)-v(E.start))).toString()+"px "+(N*k+.5*o).toString()+"px"}).attr("class","exclude-range")}a(I,"drawExcludeDays");function p(k,g,x,b){if(x<=0||k>g)return 1/0;let o=g-k,h=yt.default.duration({[b??"day"]:x}).asMilliseconds();return h<=0?1/0:Math.ceil(o/h)}a(p,"getEstimatedTickCount");function m(k,g,x,b){let o=i.db.getDateFormat(),h=i.db.getAxisFormat(),d;h?d=h:o==="D"?d="%d":d=s.axisFormat??"%Y-%m-%d";let u=xe(v).tickSize(-b+g+s.gridLineStartPadding).tickFormat(Ft(d)),n=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(i.db.getTickInterval()||s.tickInterval);if(n!==null){let M=parseInt(n[1],10);if(isNaN(M)||M<=0)J.warn(`Invalid tick interval value: "${n[1]}". Skipping custom tick interval.`);else{let l=n[2],j=i.db.getWeekday()||s.weekday,c=v.domain(),S=c[0],E=c[1],N=p(S,E,M,l);if(N>se)J.warn(`The tick interval "${M}${l}" would generate ${N} ticks, which exceeds the maximum allowed (${se}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(l){case"millisecond":u.ticks(Yt.every(M));break;case"second":u.ticks($t.every(M));break;case"minute":u.ticks(It.every(M));break;case"hour":u.ticks(Lt.every(M));break;case"day":u.ticks(At.every(M));break;case"week":u.ticks(tn[j].every(M));break;case"month":u.ticks(Ot.every(M));break}}}if(w.append("g").attr("class","grid").attr("transform","translate("+k+", "+(b-50)+")").call(u).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),i.db.topAxisEnabled()||s.topAxis){let M=ge(v).tickSize(-b+g+s.gridLineStartPadding).tickFormat(Ft(d));if(n!==null){let l=parseInt(n[1],10);if(isNaN(l)||l<=0)J.warn(`Invalid tick interval value: "${n[1]}". Skipping custom tick interval.`);else{let j=n[2],c=i.db.getWeekday()||s.weekday,S=v.domain(),E=S[0],N=S[1];if(p(E,N,l,j)<=se)switch(j){case"millisecond":M.ticks(Yt.every(l));break;case"second":M.ticks($t.every(l));break;case"minute":M.ticks(It.every(l));break;case"hour":M.ticks(Lt.every(l));break;case"day":M.ticks(At.every(l));break;case"week":M.ticks(tn[c].every(l));break;case"month":M.ticks(Ot.every(l));break}}}w.append("g").attr("class","grid").attr("transform","translate("+k+", "+g+")").call(M).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}a(m,"makeGrid");function Y(k,g){let x=0,b=Object.keys(H).map(o=>[o,H[o]]);w.append("g").selectAll("text").data(b).enter().append(function(o){let h=o[0].split(oe.lineBreakRegex),d=-(h.length-1)/2,u=D.createElementNS("http://www.w3.org/2000/svg","text");u.setAttribute("dy",d+"em");for(let[C,n]of h.entries()){let M=D.createElementNS("http://www.w3.org/2000/svg","tspan");M.setAttribute("alignment-baseline","central"),M.setAttribute("x","10"),C>0&&M.setAttribute("dy","1em"),M.textContent=n,u.appendChild(M)}return u}).attr("x",10).attr("y",function(o,h){if(h>0)for(let d=0;d<h;d++)return x+=b[h-1][1],o[1]*k/2+x*k+g;else return o[1]*k/2+g}).attr("font-size",s.sectionFontSize).attr("class",function(o){for(let[h,d]of P.entries())if(o[0]===d)return"sectionTitle sectionTitle"+h%s.numberSectionStyles;return"sectionTitle"})}a(Y,"vertLabels");function W(k,g,x,b){let o=i.db.getTodayMarker();if(o==="off")return;let h=w.append("g").attr("class","today"),d=new Date,u=h.append("line");u.attr("x1",v(d)+k).attr("x2",v(d)+k).attr("y1",s.titleTopMargin).attr("y2",b-s.titleTopMargin).attr("class","today"),o!==""&&u.attr("style",o.replace(/,/g,";"))}a(W,"drawToday");function O(k){let g={},x=[];for(let b=0,o=k.length;b<o;++b)Object.prototype.hasOwnProperty.call(g,k[b])||(g[k[b]]=!0,x.push(k[b]));return x}a(O,"checkUnique")},"draw"),nn={setConf:Rn,draw:jn};var Bn=a(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar \u2014 same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,"getStyles"),sn=Bn;var pi={parser:$e,db:Qe,renderer:nn,styles:sn};export{pi as diagram};
