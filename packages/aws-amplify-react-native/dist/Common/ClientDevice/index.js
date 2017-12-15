Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _reactNative=require('react-native');
var _ios=require('./ios');var iOS=_interopRequireWildcard(_ios);
var _android=require('./android');var Android=_interopRequireWildcard(_android);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj.default=obj;return newObj;}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var

OS=_reactNative.Platform.OS;var

ClientDevice=function(){function ClientDevice(){_classCallCheck(this,ClientDevice);}_createClass(ClientDevice,null,[{key:'clientInfo',value:function clientInfo()
{
if(OS==='ios'){
return iOS.clientInfo();
}else{
return Android.clientInfo();
}
}}]);return ClientDevice;}();exports.default=ClientDevice;