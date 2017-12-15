Object.defineProperty(exports,"__esModule",{value:true});












var _I18n=require('./I18n');var _I18n2=_interopRequireDefault(_I18n);

var _Common=require('../Common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var logger=new _Common.ConsoleLogger('I18n');

var _instance=null;

console.log('Load I18n module');
if(!_instance){
logger.debug('Create I18n Instance');
_instance=new _I18n2.default();
}exports.default=

I18n=_instance;