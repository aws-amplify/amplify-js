Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Common=require('../Common');





var _Auth=require('../Auth');var _Auth2=_interopRequireDefault(_Auth);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Common.ConsoleLogger('StorageClass');var

S3=_Common.AWS.S3;var




StorageClass=function(){



function StorageClass(config){_classCallCheck(this,StorageClass);
this.configure(config);
}_createClass(StorageClass,[{key:'configure',value:function configure(






config){
logger.debug('configure Storage');
var conf=config?config.Storage||config:{};

if(conf['aws_user_files_s3_bucket']){
conf={
bucket:config['aws_user_files_s3_bucket'],
region:config['aws_user_files_s3_bucket_region']};

}

this._config=_extends({},this._config,conf);

return this._config;
}},{key:'get',value:function get(







key,options){var _config,bucket,region,credentialsOK,opt,prefix,path,s3,params;return regeneratorRuntime.async(function get$(_context){while(1){switch(_context.prev=_context.next){case 0:_config=
this._config,bucket=_config.bucket,region=_config.region;
if(!bucket){Promise.reject('No bucket in config');}_context.next=4;return regeneratorRuntime.awrap(

this._ensureCredentials());case 4:credentialsOK=_context.sent;if(
credentialsOK){_context.next=7;break;}return _context.abrupt('return',Promise.reject('No credentials'));case 7:

opt=_extends({},this._config,options);
prefix=this._prefix(opt);
path=prefix+key;
logger.debug('get '+key+' from '+path);

s3=this._createS3();
params={
Bucket:bucket,
Key:path};return _context.abrupt('return',


new Promise(function(resolve,reject){
try{
var url=s3.getSignedUrl('getObject',params);
logger.debug('url is '+url);
resolve(url);
}catch(e){
logger.error('get error',e);
reject(e);
}
}));case 14:case'end':return _context.stop();}}},null,this);}},{key:'put',value:function put(









key,obj,options){var _config2,bucket,region,credentialsOK,opt,contentType,prefix,path,s3,params;return regeneratorRuntime.async(function put$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:
logger.debug('put '+path);_config2=
this._config,bucket=_config2.bucket,region=_config2.region;
if(!bucket){Promise.reject('No bucket in config');}_context2.next=5;return regeneratorRuntime.awrap(

this._ensureCredentials());case 5:credentialsOK=_context2.sent;if(
credentialsOK){_context2.next=8;break;}return _context2.abrupt('return',Promise.reject('No credentials'));case 8:

opt=_extends({},this._config,options);
contentType=opt.contentType||'binary/octet-stream';
prefix=this._prefix(opt);
path=prefix+key;
logger.debug('put on to '+path,this._config.credentials);

s3=this._createS3();
params={
Bucket:bucket,
Key:path,
Body:obj,
ContentType:contentType};return _context2.abrupt('return',


new Promise(function(resolve,reject){
s3.upload(params,function(err,data){
if(err){
reject(err);
}else{
resolve(data);
}
});
}));case 16:case'end':return _context2.stop();}}},null,this);}},{key:'remove',value:function remove(








key,options){var _config3,bucket,region,credentialsOK,opt,prefix,path,s3,params;return regeneratorRuntime.async(function remove$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:_config3=
this._config,bucket=_config3.bucket,region=_config3.region;
if(!bucket){Promise.reject('No bucket in config');}_context3.next=4;return regeneratorRuntime.awrap(

this._ensureCredentials());case 4:credentialsOK=_context3.sent;if(
credentialsOK){_context3.next=7;break;}return _context3.abrupt('return',Promise.reject('No credentials'));case 7:

opt=_extends({},this._config,options);
prefix=this._prefix(opt);
path=prefix+key;

s3=this._createS3();
params={
Bucket:bucket,
Key:path};return _context3.abrupt('return',


new Promise(function(resolve,reject){
s3.deleteObject(params,function(err,data){
if(err){
reject(err);
}else{
resolve(data);
}
});
}));case 13:case'end':return _context3.stop();}}},null,this);}},{key:'list',value:function list(








path,options){var _config4,bucket,region,credentialsOK,opt,prefix,s3,params;return regeneratorRuntime.async(function list$(_context4){while(1){switch(_context4.prev=_context4.next){case 0:_config4=
this._config,bucket=_config4.bucket,region=_config4.region;
if(!bucket){Promise.reject('No bucket in config');}_context4.next=4;return regeneratorRuntime.awrap(

this._ensureCredentials());case 4:credentialsOK=_context4.sent;if(
credentialsOK){_context4.next=7;break;}return _context4.abrupt('return',Promise.reject('No credentials'));case 7:

opt=_extends({},this._config,options);
prefix=this._prefix(opt);
path=prefix+path;

s3=this._createS3();
params={
Bucket:bucket,
Prefix:path};return _context4.abrupt('return',


new Promise(function(resolve,reject){
s3.listObjects(params,function(err,data){
if(err){
reject(err);
}else{
var list=data.Contents.map(function(item){
return{
key:item.Key.substr(prefix.length),
eTag:item.ETag,
lastModified:item.LastModified,
size:item.Size};

});
resolve(list);
}
});
}));case 13:case'end':return _context4.stop();}}},null,this);}},{key:'_ensureCredentials',value:function _ensureCredentials()





{var _this=this;
var conf=this._config;
if(conf.credentials){return Promise.resolve(true);}

return _Auth2.default.currentCredentials().
then(function(credentials){
var cred=_Auth2.default.essentialCredentials(credentials);
logger.debug('set credentials for storage',cred);
conf.credentials=cred;
_this._setAWSConfig();

return true;
}).
catch(function(err){
logger.error('ensure credentials error',err);
return false;
});
}},{key:'_setAWSConfig',value:function _setAWSConfig()




{
if(_Common.AWS.config){
_Common.AWS.config.update({
region:this._config.region,
credentials:this._config.credentials});

}
}},{key:'_prefix',value:function _prefix(




options){
var opt=_extends({},{level:'public'},options);var
level=opt.level;var _config$credentials=
this._config.credentials,identityId=_config$credentials.identityId,authenticated=_config$credentials.authenticated;
return level==='private'?'private/'+identityId+'/':'public/';
}},{key:'_createS3',value:function _createS3()




{var _config5=
this._config,region=_config5.region,bucket=_config5.bucket;
return new S3({
apiVersion:'2006-03-01',
bucket:{Bucket:bucket},
region:region});

}},{key:'_base64ToArrayBuffer',value:function _base64ToArrayBuffer(




base64){
var binary_string=atob(base64);
var len=binary_string.length;
var bytes=new Uint8Array(len);
for(var i=0;i<len;i++){
bytes[i]=binary_string.charCodeAt(i);
}
return bytes.buffer;
}}]);return StorageClass;}();exports.default=


StorageClass;