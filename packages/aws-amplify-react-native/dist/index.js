Object.defineProperty(exports,"__esModule",{value:true});exports.S3Image=exports.S3Album=exports.withAuthenticator=exports.Components=exports.Logger=exports.I18n=exports.Storage=exports.Cache=exports.API=exports.Analytics=exports.Auth=exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Auth=require('./Auth');var _Auth2=_interopRequireDefault(_Auth);
var _Analytics=require('./Analytics');var _Analytics2=_interopRequireDefault(_Analytics);
var _API=require('./API');var _API2=_interopRequireDefault(_API);
var _Cache=require('./Cache');var _Cache2=_interopRequireDefault(_Cache);
var _Storage=require('./Storage');var _Storage2=_interopRequireDefault(_Storage);

var _I18n=require('./I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('./Common');

var _components=require('./components');var Components=_interopRequireWildcard(_components);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj.default=obj;return newObj;}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}


var logger=new _Common.ConsoleLogger('Amplify');var

Amplify=function(){function Amplify(){_classCallCheck(this,Amplify);}_createClass(Amplify,null,[{key:'configure',value:function configure(
config){
logger.info('configure Amplify');

_Auth2.default.configure(config);
_Analytics2.default.configure(config);
_I18n2.default.configure(config);
_Storage2.default.configure(config);

_API2.default.configure(config);
_API2.default.createInstance();
_Cache2.default.configure(config);
}}]);return Amplify;}();exports.default=Amplify;


Amplify.Auth=_Auth2.default;
Amplify.Analytics=_Analytics2.default;
Amplify.API=_API2.default;
Amplify.Cache=_Cache2.default;
Amplify.Storage=_Storage2.default;

Amplify.I18n=_I18n2.default;
Amplify.Logger=_Common.ConsoleLogger;

Amplify.Components=Components;
Amplify.withAuthenticator=_components.withAuthenticator;exports.


Auth=_Auth2.default;exports.
Analytics=_Analytics2.default;exports.
API=_API2.default;exports.
Cache=_Cache2.default;exports.
Storage=_Storage2.default;exports.

I18n=_I18n2.default;exports.
Logger=_Common.ConsoleLogger;exports.

Components=Components;exports.
withAuthenticator=_components.withAuthenticator;exports.
S3Album=_components.S3Album;exports.
S3Image=_components.S3Image;