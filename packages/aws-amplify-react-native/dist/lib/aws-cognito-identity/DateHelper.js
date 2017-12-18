Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}
















var monthNames=
['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var weekNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];var


DateHelper=function(){function DateHelper(){_classCallCheck(this,DateHelper);}_createClass(DateHelper,[{key:'getNowString',value:function getNowString()



{
var now=new Date();

var weekDay=weekNames[now.getUTCDay()];
var month=monthNames[now.getUTCMonth()];
var day=now.getUTCDate();

var hours=now.getUTCHours();
if(hours<10){
hours='0'+hours;
}

var minutes=now.getUTCMinutes();
if(minutes<10){
minutes='0'+minutes;
}

var seconds=now.getUTCSeconds();
if(seconds<10){
seconds='0'+seconds;
}

var year=now.getUTCFullYear();


var dateNow=weekDay+' '+month+' '+day+' '+hours+':'+minutes+':'+seconds+' UTC '+year;

return dateNow;
}}]);return DateHelper;}();exports.default=DateHelper;