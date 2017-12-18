Object.defineProperty(exports,"__esModule",{value:true});exports.AmplifyMessageMapEntries=exports.AmplifyTheme=undefined;var _AmplifyTheme=require('./AmplifyTheme');Object.defineProperty(exports,'AmplifyTheme',{enumerable:true,get:function get(){return _interopRequireDefault(_AmplifyTheme).















default;}});var _AmplifyMessageMap=require('./AmplifyMessageMap');Object.defineProperty(exports,'AmplifyMessageMapEntries',{enumerable:true,get:function get(){return _AmplifyMessageMap.
MapEntries;}});var _auth=require('./auth');
Object.keys(_auth).forEach(function(key){if(key==="default"||key==="__esModule")return;Object.defineProperty(exports,key,{enumerable:true,get:function get(){return _auth[key];}});});var _storage=require('./storage');
Object.keys(_storage).forEach(function(key){if(key==="default"||key==="__esModule")return;Object.defineProperty(exports,key,{enumerable:true,get:function get(){return _storage[key];}});});var _I18n=require('../I18n');var _I18n2=_interopRequireDefault(_I18n);var _AmplifyI18n=require('./AmplifyI18n');var _AmplifyI18n2=_interopRequireDefault(_AmplifyI18n);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

_I18n2.default.putVocabularies(_AmplifyI18n2.default);