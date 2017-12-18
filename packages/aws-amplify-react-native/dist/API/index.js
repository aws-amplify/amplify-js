Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _RestClient=require('./RestClient');

var _Auth=require('../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _Logger=require('../Common/Logger');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Logger.ConsoleLogger('API');

var _config=null;
var _api=null;var




API=function(){function API(){_classCallCheck(this,API);}_createClass(API,null,[{key:'configure',value:function configure(





config){
logger.debug('configure API');
var conf=config?config.API||config:{};

if(conf['aws_project_region']){
if(conf['aws_cloud_logic_custom']){
var custom=conf['aws_cloud_logic_custom'];
conf.endpoints=typeof custom==='string'?JSON.parse(custom):
custom;
}
conf=_extends({},conf,{
region:conf['aws_project_region'],
header:{}});

};
_config=_extends({},_config,conf);

API.createInstance();

return _config;
}},{key:'createInstance',value:function createInstance()





{
logger.debug('create API instance');
if(_config){
_api=new _RestClient.RestClient(_config);
return true;
}else{
return Promise.reject('API no configured');
}
}},{key:'get',value:function get(








apiName,path,init){var endpoint;return regeneratorRuntime.async(function get$(_context){while(1){switch(_context.prev=_context.next){case 0:if(
_api){_context.next=9;break;}_context.prev=1;_context.next=4;return regeneratorRuntime.awrap(

this.createInstance());case 4:_context.next=9;break;case 6:_context.prev=6;_context.t0=_context['catch'](1);

Promise.reject(_context.t0);case 9:


endpoint=_api.endpoint(apiName);if(!(
endpoint.length===0)){_context.next=12;break;}return _context.abrupt('return',
Promise.reject('Api '+apiName+' does not exist'));case 12:return _context.abrupt('return',

_api.get(endpoint+path,init));case 13:case'end':return _context.stop();}}},null,this,[[1,6]]);}},{key:'post',value:function post(









apiName,path,init){var endpoint;return regeneratorRuntime.async(function post$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:if(
_api){_context2.next=9;break;}_context2.prev=1;_context2.next=4;return regeneratorRuntime.awrap(

this.createInstance());case 4:_context2.next=9;break;case 6:_context2.prev=6;_context2.t0=_context2['catch'](1);

Promise.reject(_context2.t0);case 9:


endpoint=_api.endpoint(apiName);if(!(
endpoint.length===0)){_context2.next=12;break;}return _context2.abrupt('return',
Promise.reject('Api '+apiName+' does not exist'));case 12:return _context2.abrupt('return',

_api.post(endpoint+path,init));case 13:case'end':return _context2.stop();}}},null,this,[[1,6]]);}},{key:'put',value:function put(









apiName,path,init){var endpoint;return regeneratorRuntime.async(function put$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:if(
_api){_context3.next=9;break;}_context3.prev=1;_context3.next=4;return regeneratorRuntime.awrap(

this.createInstance());case 4:_context3.next=9;break;case 6:_context3.prev=6;_context3.t0=_context3['catch'](1);

Promise.reject(_context3.t0);case 9:


endpoint=_api.endpoint(apiName);if(!(
endpoint.length===0)){_context3.next=12;break;}return _context3.abrupt('return',
Promise.reject('Api '+apiName+' does not exist'));case 12:return _context3.abrupt('return',

_api.put(endpoint+path,init));case 13:case'end':return _context3.stop();}}},null,this,[[1,6]]);}},{key:'del',value:function del(









apiName,path,init){var endpoint;return regeneratorRuntime.async(function del$(_context4){while(1){switch(_context4.prev=_context4.next){case 0:if(
_api){_context4.next=9;break;}_context4.prev=1;_context4.next=4;return regeneratorRuntime.awrap(

this.createInstance());case 4:_context4.next=9;break;case 6:_context4.prev=6;_context4.t0=_context4['catch'](1);

Promise.reject(_context4.t0);case 9:


endpoint=_api.endpoint(apiName);if(!(
endpoint.length===0)){_context4.next=12;break;}return _context4.abrupt('return',
Promise.reject('Api '+apiName+' does not exist'));case 12:return _context4.abrupt('return',(

_api.del(endpoint+path),init));case 13:case'end':return _context4.stop();}}},null,this,[[1,6]]);}},{key:'head',value:function head(









apiName,path,init){var endpoint;return regeneratorRuntime.async(function head$(_context5){while(1){switch(_context5.prev=_context5.next){case 0:if(
_api){_context5.next=9;break;}_context5.prev=1;_context5.next=4;return regeneratorRuntime.awrap(

this.createInstance());case 4:_context5.next=9;break;case 6:_context5.prev=6;_context5.t0=_context5['catch'](1);

Promise.reject(_context5.t0);case 9:


endpoint=_api.endpoint(apiName);if(!(
endpoint.length===0)){_context5.next=12;break;}return _context5.abrupt('return',
Promise.reject('Api '+apiName+' does not exist'));case 12:return _context5.abrupt('return',

_api.head(endpoint+path,init));case 13:case'end':return _context5.stop();}}},null,this,[[1,6]]);}},{key:'endpoint',value:function endpoint(







apiName){return regeneratorRuntime.async(function endpoint$(_context6){while(1){switch(_context6.prev=_context6.next){case 0:if(
_api){_context6.next=9;break;}_context6.prev=1;_context6.next=4;return regeneratorRuntime.awrap(

this.createInstance());case 4:_context6.next=9;break;case 6:_context6.prev=6;_context6.t0=_context6['catch'](1);

Promise.reject(_context6.t0);case 9:return _context6.abrupt('return',


_api.endpoint(apiName));case 10:case'end':return _context6.stop();}}},null,this,[[1,6]]);}}]);return API;}();exports.default=



API;