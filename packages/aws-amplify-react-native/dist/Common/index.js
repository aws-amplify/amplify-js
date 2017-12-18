Object.defineProperty(exports,"__esModule",{value:true});exports.Constants=exports.JS=exports.Hub=exports.ClientDevice=undefined;












var _Facet=require('./Facet');


Object.keys(_Facet).forEach(function(key){if(key==="default"||key==="__esModule")return;Object.defineProperty(exports,key,{enumerable:true,get:function get(){return _Facet[key];}});});var _ClientDevice=require('./ClientDevice');Object.defineProperty(exports,'ClientDevice',{enumerable:true,get:function get(){return _interopRequireDefault(_ClientDevice).
default;}});var _Logger=require('./Logger');
Object.keys(_Logger).forEach(function(key){if(key==="default"||key==="__esModule")return;Object.defineProperty(exports,key,{enumerable:true,get:function get(){return _Logger[key];}});});var _Hub=require('./Hub');Object.defineProperty(exports,'Hub',{enumerable:true,get:function get(){return _interopRequireDefault(_Hub).
default;}});var _JS=require('./JS');Object.defineProperty(exports,'JS',{enumerable:true,get:function get(){return _interopRequireDefault(_JS).
default;}});function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var Constants=exports.Constants={
userAgent:'aws-amplify/1.0.0 react-native'};


var logger=new _Logger.ConsoleLogger('Common');

if(_Facet.AWS['util']){
_Facet.AWS['util'].userAgent=function(){
return Constants.userAgent;
};
}else if(_Facet.AWS.config){
_Facet.AWS.config.update({customUserAgent:Constants.userAgent});
}else{
logger.warn('No AWS.config');
}