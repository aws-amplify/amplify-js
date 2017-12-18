Object.defineProperty(exports,"__esModule",{value:true});exports.HubClass=undefined;var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Logger=require('./Logger');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Logger.ConsoleLogger('Hub');var

HubClass=exports.HubClass=function(){
function HubClass(name){_classCallCheck(this,HubClass);
this.name=name;
this.bus=[];
this.listeners={};
}_createClass(HubClass,[{key:'dispatch',value:function dispatch(

channel,payload){var source=arguments.length>2&&arguments[2]!==undefined?arguments[2]:'';
logger.debug(source+' dispatched '+channel);

var capsule={
channel:channel,
payload:_extends({},payload),
source:source};


this.bus.push(capsule);
this.toListeners(capsule);
}},{key:'listen',value:function listen(

channel,listener){var listener_name=arguments.length>2&&arguments[2]!==undefined?arguments[2]:'noname';
logger.debug(listener_name+' listening '+channel);

var holder=this.listeners[channel];
if(!holder){
holder=[];
this.listeners[channel]=holder;
}

holder.push({
name:listener_name,
listener:listener});

}},{key:'toListeners',value:function toListeners(

capsule){var
channel=capsule.channel,payload=capsule.payload,source=capsule.source;
var holder=this.listeners[channel];
if(!holder){return;}

holder.forEach(function(listener){
logger.debug(listener.name+' notified of capsule '+channel);
listener.listener.onHubCapsule(capsule);
});
}}]);return HubClass;}();


var Hub=new HubClass('__default__');exports.default=
Hub;

Hub.createHub=function(name){
return new HubClass(name);
};