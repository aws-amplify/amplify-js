Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}












var LOG_LEVELS={
VERBOSE:1,
DEBUG:2,
INFO:3,
WARN:4,
ERROR:5};var





ConsoleLogger=exports.ConsoleLogger=function(){



function ConsoleLogger(name){var level=arguments.length>1&&arguments[1]!==undefined?arguments[1]:'INFO';_classCallCheck(this,ConsoleLogger);
this.name=name;
this.level=level;
}_createClass(ConsoleLogger,[{key:'_log',value:function _log(







type){
var logger_level_name=this.level;
if(ConsoleLogger.LOG_LEVEL){logger_level_name=ConsoleLogger.LOG_LEVEL;}
if(typeof window!='undefined'&&window.LOG_LEVEL){
logger_level_name=window.LOG_LEVEL;
}
var logger_level=LOG_LEVELS[logger_level_name];
var type_level=LOG_LEVELS[type];
if(!(type_level>=logger_level)){
return;
}

var log=console.log;for(var _len=arguments.length,msg=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){msg[_key-1]=arguments[_key];}

if(msg.length===1&&typeof msg[0]==='string'){
log('['+type+'] '+this.name+' - '+msg[0]);
}else if(msg.length===1){
var key='['+type+'] '+this.name;
var output={};
output[key]=msg[0];
log(output);
}else if(typeof msg[0]==='string'){
var obj=msg.slice(1);
if(obj.length===1){obj=obj[0];}
var _key2='['+type+'] '+this.name+' - '+msg[0];
var _output={};
_output[_key2]=obj;
log(_output);
}else{
var _key3='['+type+'] '+this.name;
var _output2={};
_output2[_key3]=msg;
log(_output2);
}
}},{key:'log',value:function log()





{for(var _len2=arguments.length,msg=Array(_len2),_key4=0;_key4<_len2;_key4++){msg[_key4]=arguments[_key4];}this._log.apply(this,['INFO'].concat(msg));}},{key:'info',value:function info()





{for(var _len3=arguments.length,msg=Array(_len3),_key5=0;_key5<_len3;_key5++){msg[_key5]=arguments[_key5];}this._log.apply(this,['INFO'].concat(msg));}},{key:'warn',value:function warn()





{for(var _len4=arguments.length,msg=Array(_len4),_key6=0;_key6<_len4;_key6++){msg[_key6]=arguments[_key6];}this._log.apply(this,['WARN'].concat(msg));}},{key:'error',value:function error()





{for(var _len5=arguments.length,msg=Array(_len5),_key7=0;_key7<_len5;_key7++){msg[_key7]=arguments[_key7];}this._log.apply(this,['ERROR'].concat(msg));}},{key:'debug',value:function debug()





{for(var _len6=arguments.length,msg=Array(_len6),_key8=0;_key8<_len6;_key8++){msg[_key8]=arguments[_key8];}this._log.apply(this,['DEBUG'].concat(msg));}},{key:'verbose',value:function verbose()





{for(var _len7=arguments.length,msg=Array(_len7),_key9=0;_key9<_len7;_key9++){msg[_key9]=arguments[_key9];}this._log.apply(this,['VERBOSE'].concat(msg));}}]);return ConsoleLogger;}();
;