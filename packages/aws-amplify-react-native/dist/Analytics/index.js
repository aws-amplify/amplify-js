Object.defineProperty(exports,"__esModule",{value:true});












var _Analytics=require('./Analytics');var _Analytics2=_interopRequireDefault(_Analytics);

var _Hub=require('../Common/Hub');var _Hub2=_interopRequireDefault(_Hub);
var _Common=require('../Common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var logger=new _Common.ConsoleLogger('Analytics');

var _instance=null;

if(!_instance){
logger.debug('Create Analytics Instance');
_instance=new _Analytics2.default();
}exports.default=

Analytics=_instance;

Analytics.onHubCapsule=function(capsule){var
channel=capsule.channel,payload=capsule.payload,source=capsule.source;
logger.debug('on hub capsule channel '+channel);

if(channel==='credentials'){
Analytics.restart(payload);
}
};

_Hub2.default.listen('credentials',Analytics);