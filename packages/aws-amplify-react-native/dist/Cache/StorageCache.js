Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Utils=require('./Utils');




var _Common=require('../Common');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Common.ConsoleLogger('StorageCache');var





StorageCache=function(){




function StorageCache(config){_classCallCheck(this,StorageCache);
this.config=_extends({},config);
this.cacheCurSizeKey=this.config.keyPrefix+'CurSize';
this.checkConfig();
}_createClass(StorageCache,[{key:'checkConfig',value:function checkConfig()




{

if(!Number.isInteger(this.config.capacityInBytes)){
logger.error('Invalid parameter: capacityInBytes. It should be an Integer. Setting back to default.');
this.config.capacityInBytes=_Utils.defaultConfig.capacityInBytes;
}

if(!Number.isInteger(this.config.itemMaxSize)){
logger.error('Invalid parameter: itemMaxSize. It should be an Integer. Setting back to default.');
this.config.itemMaxSize=_Utils.defaultConfig.itemMaxSize;
}

if(!Number.isInteger(this.config.defaultTTL)){
logger.error('Invalid parameter: defaultTTL. It should be an Integer. Setting back to default.');
this.config.defaultTTL=_Utils.defaultConfig.defaultTTL;
}

if(!Number.isInteger(this.config.defaultPriority)){
logger.error('Invalid parameter: defaultPriority. It should be an Integer. Setting back to default.');
this.config.defaultPriority=_Utils.defaultConfig.defaultPriority;
}

if(this.config.itemMaxSize>this.config.capacityInBytes){
logger.error('Invalid parameter: itemMaxSize. It should be smaller than capacityInBytes. Setting back to default.');
this.config.itemMaxSize=_Utils.defaultConfig.itemMaxSize;
}

if(this.config.defaultPriority>5||this.config.defaultPriority<1){
logger.error('Invalid parameter: defaultPriority. It should be between 1 and 5. Setting back to default.');
this.config.defaultPriority=_Utils.defaultConfig.defaultPriority;
}

if(Number(this.config.warningThreshold)>1||Number(this.config.warningThreshold)<0){
logger.error('Invalid parameter: warningThreshold. It should be between 0 and 1. Setting back to default.');
this.config.warningThreshold=_Utils.defaultConfig.warningThreshold;
}

var cacheLimit=5*1024*1024;
if(this.config.capacityInBytes>cacheLimit){
logger.error('Cache Capacity should be less than 5MB. Setting back to default. Setting back to default.');
this.config.capacityInBytes=_Utils.defaultConfig.capacityInBytes;
}
}},{key:'fillCacheItem',value:function fillCacheItem(









key,value,options){
var ret={
key:key,
data:JSON.stringify(value),
timestamp:(0,_Utils.getCurrTime)(),
visitedTime:(0,_Utils.getCurrTime)(),
priority:options.priority,
expires:options.expires,
type:typeof value,
byteSize:0};


ret.byteSize=(0,_Utils.getByteLength)(JSON.stringify(ret));


ret.byteSize=(0,_Utils.getByteLength)(JSON.stringify(ret));
return ret;
}},{key:'configure',value:function configure(






config){
if(!config){
return this.config;
}
if(config.keyPrefix){
logger.error('Don\'t try to configure keyPrefix!');
}
config.keyPrefix=this.config.keyPrefix;

this.config=_extends({},this.config,config);
this.checkConfig();
return this.config;
}}]);return StorageCache;}();exports.default=


StorageCache;