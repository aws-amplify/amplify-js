Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};












var _Storage=require('./Storage');var _Storage2=_interopRequireDefault(_Storage);

var _Hub=require('../Common/Hub');var _Hub2=_interopRequireDefault(_Hub);
var _Common=require('../Common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var logger=new _Common.ConsoleLogger('Storage');

var _instance=null;

if(!_instance){
logger.debug('Create Storage Instance');
_instance=new _Storage2.default();
_instance.vault=new _Storage2.default({level:'private'});

var _old_configure=_instance.configure;
_instance.configure=function(options){
logger.debug('configure called');
_old_configure.call(_instance,options);

var vault_options=_extends({},options,{level:'private'});
_instance.vault.configure(vault_options);
};
}exports.default=

Storage=_instance;

Storage.onHubCapsule=function(capsule){var
channel=capsule.channel,payload=capsule.payload,source=capsule.source;
logger.debug('on hub capsule channel '+channel);

if(channel==='credentials'){

}
};


_Hub2.default.listen('credentials',Storage);