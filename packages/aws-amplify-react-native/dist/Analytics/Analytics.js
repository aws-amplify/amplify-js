Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Common=require('../Common');








var _Auth=require('../Auth');var _Auth2=_interopRequireDefault(_Auth);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Common.ConsoleLogger('AnalyticsClass');
var ama_logger=new _Common.ConsoleLogger('AMA');
ama_logger.log=ama_logger.verbose;var




AnalyticsClass=function(){




function AnalyticsClass(config){_classCallCheck(this,AnalyticsClass);
this.configure(config);
logger.debug('Analytics Config',this._config);

var client_info=_Common.ClientDevice.clientInfo();
if(client_info.platform){this._config.platform=client_info.platform;}

this._buffer=[];
}_createClass(AnalyticsClass,[{key:'configure',value:function configure(





config){
logger.debug('configure Analytics');
var conf=config?config.Analytics||config:{};

if(conf['aws_mobile_analytics_app_id']){
conf={
appId:conf['aws_mobile_analytics_app_id'],
platform:'other',
region:conf['aws_project_region']};

}

this._config=_extends({},this._config,conf);

this._initClients();

return this._config;
}},{key:'startSession',value:function startSession()




{
if(this.amaClient){
this.amaClient.startSession();
}
}},{key:'stopSession',value:function stopSession()




{
if(this.amaClient){
this.amaClient.stopSession();
}
}},{key:'restart',value:function restart(





credentials){
try{
this.stopSession();
this._config.credentials=credentials;
this._initClients();
}catch(e){
logger.error(e);
}
}},{key:'record',value:function record(







name,attributes,metrics){
logger.debug('record event '+name);
if(!this.amaClient){
logger.debug('amaClient not ready, put in buffer');
this._buffer.push({
name:name,
attribtues:attributes,
metrics:metrics});

return;
}
this.amaClient.recordEvent(name,attributes,metrics);
}},{key:'recordMonetization',value:function recordMonetization(







event,attributes,metrics){
this.amaClient.recordMonetizationEvent(event,attributes,metrics);
}},{key:'_ensureCredentials',value:function _ensureCredentials()




{
var conf=this._config;
if(conf.credentials){return Promise.resolve(true);}

return _Auth2.default.currentCredentials().
then(function(credentials){
var cred=_Auth2.default.essentialCredentials(credentials);
logger.debug('set credentials for analytics',cred);
conf.credentials=cred;

if(!conf.clientId&&conf.credentials){
conf.clientId=conf.credentials.identityId;
}

return true;
}).
catch(function(err){
logger.error(err);
return false;
});
}},{key:'_checkConfig',value:function _checkConfig()




{
return!!this._config.appId;
}},{key:'_initClients',value:function _initClients(){var credentialsOK;return regeneratorRuntime.async(function _initClients$(_context){while(1){switch(_context.prev=_context.next){case 0:if(





this._checkConfig()){_context.next=2;break;}return _context.abrupt('return',false);case 2:_context.next=4;return regeneratorRuntime.awrap(

this._ensureCredentials());case 4:credentialsOK=_context.sent;if(
credentialsOK){_context.next=7;break;}return _context.abrupt('return',false);case 7:

this._initAMA();
this._initPinpoint();
this.startSession();return _context.abrupt('return',

true);case 11:case'end':return _context.stop();}}},null,this);}},{key:'_initAMA',value:function _initAMA()





{var _this=this;
logger.debug('init AMA');var _config=
this._config,appId=_config.appId,platform=_config.platform,clientId=_config.clientId,region=_config.region,credentials=_config.credentials;
this.amaClient=new _Common.AMA.Manager({
appId:appId,
platform:platform,
clientId:clientId,
logger:ama_logger,
clientOptions:{
region:region,
credentials:credentials}});



if(this._buffer.length>0){
logger.debug('something in buffer, flush it');
var buffer=this._buffer;
this._buffer=[];
buffer.forEach(function(event){
_this.amaClient.recordEvent(event.name,event.attributes,event.metrics);
});
}
}},{key:'_initPinpoint',value:function _initPinpoint()




{
logger.debug('init Pinpoint');var _config2=
this._config,region=_config2.region,appId=_config2.appId,clientId=_config2.clientId,credentials=_config2.credentials;
this.pinpointClient=new _Common.Pinpoint({
region:region,
credentials:credentials});


var request=this._endpointRequest();
var update_params={
ApplicationId:appId,
EndpointId:clientId,
EndpointRequest:request};

logger.debug(update_params);

this.pinpointClient.updateEndpoint(update_params,function(err,data){
if(err){
logger.debug('Pinpoint ERROR',err);
}else{
logger.debug('Pinpoint SUCCESS',data);
}
});
}},{key:'_endpointRequest',value:function _endpointRequest()




{
var client_info=_Common.ClientDevice.clientInfo();
var credentials=this._config.credentials;
var user_id=credentials.authenticated?credentials.identityId:null;
logger.debug('demographic user id: '+user_id);
return{
Demographic:{
AppVersion:this._config.appVersion||client_info.appVersion,
Make:client_info.make,
Model:client_info.model,
ModelVersion:client_info.version,
Platform:client_info.platform},

User:{UserId:user_id}};

}}]);return AnalyticsClass;}();exports.default=


AnalyticsClass;