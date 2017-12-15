Object.defineProperty(exports,"__esModule",{value:true});exports.RestClient=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Signer=require('../Common/Signer');var _Signer2=_interopRequireDefault(_Signer);
var _Common=require('../Common');

var _Auth=require('../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _awsSdk=require('aws-sdk');var AWS=_interopRequireWildcard(_awsSdk);
var _axios=require('axios');var _axios2=_interopRequireDefault(_axios);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj.default=obj;return newObj;}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}
var logger=new _Common.ConsoleLogger('RestClient');var














RestClient=exports.RestClient=function(){





function RestClient(options){_classCallCheck(this,RestClient);var
endpoints=options.endpoints;
this._options=options;
logger.debug('API Options',this._options);
}_createClass(RestClient,[{key:'ajax',value:function ajax(
















url,method,init){var _this=this;var parsed_url,params,libraryHeaders,credPromise;return regeneratorRuntime.async(function ajax$(_context){while(1){switch(_context.prev=_context.next){case 0:
logger.debug(method+' '+url);

parsed_url=this._parseUrl(url);

params={
method:method,
url:url,
host:parsed_url.host,
path:parsed_url.path,
headers:{},
data:null};


libraryHeaders={};

if(!init){
init={};
}

if(init.body){
libraryHeaders['content-type']='application/json';
params.data=JSON.stringify(init.body);
}



if(init.headers){
Object.keys(init.headers).map(function(key){
params.headers[key]=init.headers[key];
});
}

Object.keys(libraryHeaders).map(function(key){
params.headers[key]=libraryHeaders[key];
});if(!



params.headers['Authorization']){_context.next=10;break;}return _context.abrupt('return',this._request(params));case 10:

credPromise=new Promise(function(resolve,reject){
_Auth2.default.currentCredentials().
then(resolve).
catch(function(err){

_Auth2.default.guestCredentials().then(resolve).catch(reject);
});
});return _context.abrupt('return',

credPromise.then(function(credentials){
return _this._signed(params,credentials);
}));case 12:case'end':return _context.stop();}}},null,this);}},{key:'get',value:function get(








url,init){
return this.ajax(url,'GET',init);
}},{key:'put',value:function put(







url,init){
return this.ajax(url,'PUT',init);
}},{key:'post',value:function post(







url,init){
return this.ajax(url,'POST',init);
}},{key:'del',value:function del(







url,init){
return this.ajax(url,'DELETE',init);
}},{key:'head',value:function head(







url,init){
return this.ajax(url,'HEAD',init);
}},{key:'endpoint',value:function endpoint(






apiName){
var cloud_logic_array=this._options.endpoints;
var response='';
cloud_logic_array.forEach(function(v){
if(v.name===apiName){
response=v.endpoint;
}
});
return response;
}},{key:'_signed',value:function _signed(



params,credentials){

var signed_params=_Signer2.default.sign(params,{
secret_key:credentials.secretAccessKey,
access_key:credentials.accessKeyId,
session_token:credentials.sessionToken});

if(signed_params.data){
signed_params.body=signed_params.data;
}

logger.debug(signed_params);

delete signed_params.headers['host'];

return(0,_axios2.default)(signed_params).
then(function(response){return response.data;}).
catch(function(error){
logger.debug(error);
throw error;
});
}},{key:'_request',value:function _request(

params){
return(0,_axios2.default)(params).
then(function(response){return response.data;}).
catch(function(error){
logger.debug(error);
throw error;
});
}},{key:'_parseUrl',value:function _parseUrl(

url){
var parts=url.split('/');

return{
host:parts[2],
path:'/'+parts.slice(3).join('/')};

}}]);return RestClient;}();
;