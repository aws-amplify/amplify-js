Object.defineProperty(exports,"__esModule",{value:true});












var _Auth=require('./Auth');var _Auth2=_interopRequireDefault(_Auth);

var _Common=require('../Common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var logger=new _Common.ConsoleLogger('Auth');

var _instance=null;

if(!_instance){
logger.debug('Create Auth Instance');
_instance=new _Auth2.default();
}exports.default=

Auth=_instance;