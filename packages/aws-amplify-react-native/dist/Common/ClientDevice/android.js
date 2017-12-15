Object.defineProperty(exports,"__esModule",{value:true});exports.clientInfo=undefined;












var _reactNative=require('react-native');
var _Logger=require('../Logger');

var logger=new _Logger.ConsoleLogger('DeviceInfo');

var clientInfo=exports.clientInfo=function clientInfo(){
var dim=_reactNative.Dimensions.get('screen');
logger.debug(_reactNative.Platform,dim);

var OS='android';var
Version=_reactNative.Platform.Version;

return{
platform:OS,
version:String(Version),
appVersion:[OS,String(Version)].join('/')};

};