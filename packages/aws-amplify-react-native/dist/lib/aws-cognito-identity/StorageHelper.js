Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}
















var dataMemory={};var


MemoryStorage=function(){function MemoryStorage(){_classCallCheck(this,MemoryStorage);}_createClass(MemoryStorage,null,[{key:'setItem',value:function setItem(







key,value){
dataMemory[key]=value;
return dataMemory[key];
}},{key:'getItem',value:function getItem(







key){
return Object.prototype.hasOwnProperty.call(dataMemory,key)?dataMemory[key]:undefined;
}},{key:'removeItem',value:function removeItem(






key){
return delete dataMemory[key];
}},{key:'clear',value:function clear()





{
dataMemory={};
return dataMemory;
}}]);return MemoryStorage;}();var



StorageHelper=function(){





function StorageHelper(){_classCallCheck(this,StorageHelper);
try{
this.storageWindow=window.localStorage;
this.storageWindow.setItem('aws.cognito.test-ls',1);
this.storageWindow.removeItem('aws.cognito.test-ls');
}catch(exception){
this.storageWindow=MemoryStorage;
}
}_createClass(StorageHelper,[{key:'getStorage',value:function getStorage()





{
return this.storageWindow;
}}]);return StorageHelper;}();exports.default=StorageHelper;