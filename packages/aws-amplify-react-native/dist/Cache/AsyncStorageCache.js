Object.defineProperty(exports,"__esModule",{value:true});exports.AsyncStorage=undefined;var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _StorageCache2=require('./StorageCache');var _StorageCache3=_interopRequireDefault(_StorageCache2);
var _CacheUtils=require('./Utils/CacheUtils');
var _reactNative=require('react-native');

var _Common=require('../Common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('Cache');var




AsyncStorageCache=function(_StorageCache){_inherits(AsyncStorageCache,_StorageCache);






function AsyncStorageCache(config){_classCallCheck(this,AsyncStorageCache);
var cache_config=config?_extends({},_CacheUtils.defaultConfig,config):_CacheUtils.defaultConfig;return _possibleConstructorReturn(this,(AsyncStorageCache.__proto__||Object.getPrototypeOf(AsyncStorageCache)).call(this,
cache_config));
}_createClass(AsyncStorageCache,[{key:'_decreaseCurSizeInBytes',value:function _decreaseCurSizeInBytes(






amount){var curSize;return regeneratorRuntime.async(function _decreaseCurSizeInBytes$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(
this.getCacheCurSize());case 2:curSize=_context.sent;_context.next=5;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.setItem(this.cacheCurSizeKey,(curSize-amount).toString()));case 5:case'end':return _context.stop();}}},null,this);}},{key:'_increaseCurSizeInBytes',value:function _increaseCurSizeInBytes(







amount){var curSize;return regeneratorRuntime.async(function _increaseCurSizeInBytes$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:_context2.next=2;return regeneratorRuntime.awrap(
this.getCacheCurSize());case 2:curSize=_context2.sent;_context2.next=5;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.setItem(this.cacheCurSizeKey,(curSize+amount).toString()));case 5:case'end':return _context2.stop();}}},null,this);}},{key:'_refreshItem',value:function _refreshItem(










item,prefixedKey){return regeneratorRuntime.async(function _refreshItem$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:
item.visitedTime=(0,_CacheUtils.getCurrTime)();_context3.next=3;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.setItem(prefixedKey,JSON.stringify(item)));case 3:return _context3.abrupt('return',
item);case 4:case'end':return _context3.stop();}}},null,this);}},{key:'_isExpired',value:function _isExpired(










key){var text,item;return regeneratorRuntime.async(function _isExpired$(_context4){while(1){switch(_context4.prev=_context4.next){case 0:_context4.next=2;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.getItem(key));case 2:text=_context4.sent;
item=JSON.parse(text);if(!(
(0,_CacheUtils.getCurrTime)()>=item.expires)){_context4.next=6;break;}return _context4.abrupt('return',
true);case 6:return _context4.abrupt('return',

false);case 7:case'end':return _context4.stop();}}},null,this);}},{key:'_removeItem',value:function _removeItem(








prefixedKey,size){var itemSize;return regeneratorRuntime.async(function _removeItem$(_context5){while(1){switch(_context5.prev=_context5.next){case 0:if(!
size){_context5.next=4;break;}_context5.t0=size;_context5.next=9;break;case 4:_context5.t1=JSON;_context5.next=7;return regeneratorRuntime.awrap(_reactNative.AsyncStorage.getItem(prefixedKey));case 7:_context5.t2=_context5.sent;_context5.t0=_context5.t1.parse.call(_context5.t1,_context5.t2).byteSize;case 9:itemSize=_context5.t0;_context5.next=12;return regeneratorRuntime.awrap(

this._decreaseCurSizeInBytes(itemSize));case 12:_context5.prev=12;_context5.next=15;return regeneratorRuntime.awrap(



_reactNative.AsyncStorage.removeItem(prefixedKey));case 15:_context5.next=22;break;case 17:_context5.prev=17;_context5.t3=_context5['catch'](12);_context5.next=21;return regeneratorRuntime.awrap(


this._increaseCurSizeInBytes(itemSize));case 21:
logger.error('Failed to remove item: '+_context5.t3);case 22:case'end':return _context5.stop();}}},null,this,[[12,17]]);}},{key:'_setItem',value:function _setItem(










prefixedKey,item){return regeneratorRuntime.async(function _setItem$(_context6){while(1){switch(_context6.prev=_context6.next){case 0:_context6.next=2;return regeneratorRuntime.awrap(

this._increaseCurSizeInBytes(item.byteSize));case 2:_context6.prev=2;_context6.next=5;return regeneratorRuntime.awrap(



_reactNative.AsyncStorage.setItem(prefixedKey,JSON.stringify(item)));case 5:_context6.next=12;break;case 7:_context6.prev=7;_context6.t0=_context6['catch'](2);_context6.next=11;return regeneratorRuntime.awrap(


this._decreaseCurSizeInBytes(item.byteSize));case 11:
logger.error('Failed to set item '+_context6.t0);case 12:case'end':return _context6.stop();}}},null,this,[[2,7]]);}},{key:'_sizeToPop',value:function _sizeToPop(










itemSize){var spaceItemNeed,cacheThresholdSpace;return regeneratorRuntime.async(function _sizeToPop$(_context7){while(1){switch(_context7.prev=_context7.next){case 0:_context7.next=2;return regeneratorRuntime.awrap(
this.getCacheCurSize());case 2:_context7.t0=_context7.sent;_context7.t1=itemSize;_context7.t2=_context7.t0+_context7.t1;_context7.t3=this.config.capacityInBytes;spaceItemNeed=_context7.t2-_context7.t3;
cacheThresholdSpace=(1-this.config.warningThreshold)*this.config.capacityInBytes;return _context7.abrupt('return',
spaceItemNeed>cacheThresholdSpace?spaceItemNeed:cacheThresholdSpace);case 9:case'end':return _context7.stop();}}},null,this);}},{key:'_isCacheFull',value:function _isCacheFull(









itemSize){return regeneratorRuntime.async(function _isCacheFull$(_context8){while(1){switch(_context8.prev=_context8.next){case 0:_context8.t0=
itemSize;_context8.next=3;return regeneratorRuntime.awrap(this.getCacheCurSize());case 3:_context8.t1=_context8.sent;_context8.t2=_context8.t0+_context8.t1;_context8.t3=this.config.capacityInBytes;return _context8.abrupt('return',_context8.t2>_context8.t3);case 7:case'end':return _context8.stop();}}},null,this);}},{key:'_findValidKeys',value:function _findValidKeys(){var keys,keyInCache,i,key;return regeneratorRuntime.async(function _findValidKeys$(_context9){while(1){switch(_context9.prev=_context9.next){case 0:









keys=[];
keyInCache=[];_context9.next=4;return regeneratorRuntime.awrap(

_reactNative.AsyncStorage.getAllKeys());case 4:keyInCache=_context9.sent;

i=0;case 6:if(!(i<keyInCache.length)){_context9.next=20;break;}
key=keyInCache[i];if(!(
key.indexOf(this.config.keyPrefix)===0&&key!==this.cacheCurSizeKey)){_context9.next=17;break;}_context9.next=11;return regeneratorRuntime.awrap(
this._isExpired(key));case 11:if(!_context9.sent){_context9.next=16;break;}_context9.next=14;return regeneratorRuntime.awrap(
this._removeItem(key));case 14:_context9.next=17;break;case 16:

keys.push(key);case 17:i+=1;_context9.next=6;break;case 20:return _context9.abrupt('return',



keys);case 21:case'end':return _context9.stop();}}},null,this);}},{key:'_popOutItems',value:function _popOutItems(










keys,sizeToPop){var items,remainedSize,i,val,item,_i;return regeneratorRuntime.async(function _popOutItems$(_context10){while(1){switch(_context10.prev=_context10.next){case 0:
items=[];
remainedSize=sizeToPop;
i=0;case 3:if(!(i<keys.length)){_context10.next=11;break;}_context10.next=6;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.getItem(keys[i]));case 6:val=_context10.sent;
if(val!=null){
item=JSON.parse(val);
items.push(item);
}case 8:i+=1;_context10.next=3;break;case 11:




items.sort(function(a,b){
if(a.priority>b.priority){
return-1;
}else if(a.priority<b.priority){
return 1;
}else{
if(a.visitedTime<b.visitedTime){
return-1;
}else return 1;
}
});

_i=0;case 13:if(!(_i<items.length)){_context10.next=22;break;}_context10.next=16;return regeneratorRuntime.awrap(

this._removeItem(items[_i].key,items[_i].byteSize));case 16:
remainedSize-=items[_i].byteSize;if(!(
remainedSize<=0)){_context10.next=19;break;}return _context10.abrupt('return');case 19:_i+=1;_context10.next=13;break;case 22:case'end':return _context10.stop();}}},null,this);}},{key:'setItem',value:function setItem(























key,value,options){var prefixedKey,cacheItemOptions,item,val,validKeys,sizeToPop;return regeneratorRuntime.async(function setItem$(_context11){while(1){switch(_context11.prev=_context11.next){case 0:
logger.log('Set item: key is '+key+', value is '+value+' with options: '+options);
prefixedKey=this.config.keyPrefix+key;if(!(

prefixedKey===this.config.keyPrefix||prefixedKey===this.cacheCurSizeKey)){_context11.next=5;break;}
logger.warn('Invalid key: should not be empty or \'CurSize\'');return _context11.abrupt('return');case 5:if(!(



typeof value==='undefined')){_context11.next=8;break;}
logger.warn('The value of item should not be undefined!');return _context11.abrupt('return');case 8:



cacheItemOptions={
priority:options&&options.priority!==undefined?options.priority:this.config.defaultPriority,
expires:options&&options.expires!==undefined?options.expires:this.config.defaultTTL+(0,_CacheUtils.getCurrTime)()};if(!(


cacheItemOptions.priority<1||cacheItemOptions.priority>5)){_context11.next=12;break;}
logger.warn('Invalid parameter: priority due to out or range. It should be within 1 and 5.');return _context11.abrupt('return');case 12:



item=this.fillCacheItem(prefixedKey,value,cacheItemOptions);if(!(


item.byteSize>this.config.itemMaxSize)){_context11.next=16;break;}
logger.warn('Item with key: '+key+' you are trying to put into is too big!');return _context11.abrupt('return');case 16:_context11.prev=16;_context11.next=19;return regeneratorRuntime.awrap(





_reactNative.AsyncStorage.getItem(prefixedKey));case 19:val=_context11.sent;if(!
val){_context11.next=23;break;}_context11.next=23;return regeneratorRuntime.awrap(
this._removeItem(prefixedKey,JSON.parse(val).byteSize));case 23:_context11.next=25;return regeneratorRuntime.awrap(




this._isCacheFull(item.byteSize));case 25:if(!_context11.sent){_context11.next=37;break;}_context11.next=28;return regeneratorRuntime.awrap(
this._findValidKeys());case 28:validKeys=_context11.sent;_context11.next=31;return regeneratorRuntime.awrap(
this._isCacheFull(item.byteSize));case 31:if(!_context11.sent){_context11.next=37;break;}_context11.next=34;return regeneratorRuntime.awrap(
this._sizeToPop(item.byteSize));case 34:sizeToPop=_context11.sent;_context11.next=37;return regeneratorRuntime.awrap(
this._popOutItems(validKeys,sizeToPop));case 37:_context11.next=39;return regeneratorRuntime.awrap(




this._setItem(prefixedKey,item));case 39:_context11.next=44;break;case 41:_context11.prev=41;_context11.t0=_context11['catch'](16);

logger.warn('setItem failed! '+_context11.t0);case 44:case'end':return _context11.stop();}}},null,this,[[16,41]]);}},{key:'getItem',value:function getItem(

















key,options){var ret,prefixedKey,item,val;return regeneratorRuntime.async(function getItem$(_context12){while(1){switch(_context12.prev=_context12.next){case 0:
logger.log('Get item: key is '+key+' with options '+options);
ret=null;
prefixedKey=this.config.keyPrefix+key;if(!(

prefixedKey===this.config.keyPrefix||prefixedKey===this.cacheCurSizeKey)){_context12.next=6;break;}
logger.warn('Invalid key: should not be empty or \'CurSize\'');return _context12.abrupt('return',
null);case 6:_context12.prev=6;_context12.next=9;return regeneratorRuntime.awrap(



_reactNative.AsyncStorage.getItem(prefixedKey));case 9:ret=_context12.sent;if(!(
ret!=null)){_context12.next=23;break;}_context12.next=13;return regeneratorRuntime.awrap(
this._isExpired(prefixedKey));case 13:if(!_context12.sent){_context12.next=18;break;}_context12.next=16;return regeneratorRuntime.awrap(

this._removeItem(prefixedKey,JSON.parse(ret).byteSize));case 16:_context12.next=23;break;case 18:


item=JSON.parse(ret);_context12.next=21;return regeneratorRuntime.awrap(
this._refreshItem(item,prefixedKey));case 21:item=_context12.sent;return _context12.abrupt('return',
JSON.parse(item.data));case 23:if(!(



options&&options.callback!==undefined)){_context12.next=27;break;}
val=options.callback();
if(val!==null){
this.setItem(key,val,options);
}return _context12.abrupt('return',
val);case 27:return _context12.abrupt('return',

null);case 30:_context12.prev=30;_context12.t0=_context12['catch'](6);

logger.warn('getItem failed! '+_context12.t0);return _context12.abrupt('return',
null);case 34:case'end':return _context12.stop();}}},null,this,[[6,30]]);}},{key:'removeItem',value:function removeItem(










key){var prefixedKey,val;return regeneratorRuntime.async(function removeItem$(_context13){while(1){switch(_context13.prev=_context13.next){case 0:
logger.log('Remove item: key is '+key);
prefixedKey=this.config.keyPrefix+key;if(!(

prefixedKey===this.config.keyPrefix||prefixedKey===this.cacheCurSizeKey)){_context13.next=4;break;}return _context13.abrupt('return');case 4:_context13.prev=4;_context13.next=7;return regeneratorRuntime.awrap(




_reactNative.AsyncStorage.getItem(prefixedKey));case 7:val=_context13.sent;if(!
val){_context13.next=11;break;}_context13.next=11;return regeneratorRuntime.awrap(
this._removeItem(prefixedKey,JSON.parse(val).byteSize));case 11:_context13.next=16;break;case 13:_context13.prev=13;_context13.t0=_context13['catch'](4);


logger.warn('removeItem failed! '+_context13.t0);case 16:case'end':return _context13.stop();}}},null,this,[[4,13]]);}},{key:'clear',value:function clear(){var keys,keysToRemove,i,_i2;return regeneratorRuntime.async(function clear$(_context14){while(1){switch(_context14.prev=_context14.next){case 0:










logger.log('Clear Cache');_context14.prev=1;_context14.next=4;return regeneratorRuntime.awrap(

_reactNative.AsyncStorage.getAllKeys());case 4:keys=_context14.sent;

keysToRemove=[];
for(i=0;i<keys.length;i+=1){
if(keys[i].indexOf(this.config.keyPrefix)===0){
keysToRemove.push(keys[i]);
}
}


_i2=0;case 8:if(!(_i2<keysToRemove.length)){_context14.next=14;break;}_context14.next=11;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.removeItem(keysToRemove[_i2]));case 11:_i2+=1;_context14.next=8;break;case 14:_context14.next=19;break;case 16:_context14.prev=16;_context14.t0=_context14['catch'](1);


logger.warn('clear failed! '+_context14.t0);case 19:case'end':return _context14.stop();}}},null,this,[[1,16]]);}},{key:'getCacheCurSize',value:function getCacheCurSize(){var ret;return regeneratorRuntime.async(function getCacheCurSize$(_context15){while(1){switch(_context15.prev=_context15.next){case 0:_context15.next=2;return regeneratorRuntime.awrap(








_reactNative.AsyncStorage.getItem(this.cacheCurSizeKey));case 2:ret=_context15.sent;if(
ret){_context15.next=7;break;}_context15.next=6;return regeneratorRuntime.awrap(
_reactNative.AsyncStorage.setItem(this.cacheCurSizeKey,'0'));case 6:
ret='0';case 7:return _context15.abrupt('return',

Number(ret));case 8:case'end':return _context15.stop();}}},null,this);}},{key:'getAllKeys',value:function getAllKeys(){var keys,retKeys,i;return regeneratorRuntime.async(function getAllKeys$(_context16){while(1){switch(_context16.prev=_context16.next){case 0:_context16.prev=0;_context16.next=3;return regeneratorRuntime.awrap(










_reactNative.AsyncStorage.getAllKeys());case 3:keys=_context16.sent;

retKeys=[];
for(i=0;i<keys.length;i+=1){
if(keys[i].indexOf(this.config.keyPrefix)===0&&keys[i]!==this.cacheCurSizeKey){
retKeys.push(keys[i].substring(this.config.keyPrefix.length));
}
}return _context16.abrupt('return',
retKeys);case 9:_context16.prev=9;_context16.t0=_context16['catch'](0);

logger.warn('getALlkeys failed! '+_context16.t0);return _context16.abrupt('return',
[]);case 13:case'end':return _context16.stop();}}},null,this,[[0,9]]);}},{key:'createInstance',value:function createInstance(








config){
if(config.keyPrefix===_CacheUtils.defaultConfig.keyPrefix){
logger.error('invalid keyPrefix, setting keyPrefix with timeStamp');
config.keyPrefix=_CacheUtils.getCurrTime.toString();
}
return new AsyncStorageCache(config);
}}]);return AsyncStorageCache;}(_StorageCache3.default);


var instance=new AsyncStorageCache();exports.
AsyncStorage=_reactNative.AsyncStorage;exports.default=
instance;