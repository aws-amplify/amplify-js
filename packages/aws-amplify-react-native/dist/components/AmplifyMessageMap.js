Object.defineProperty(exports,"__esModule",{value:true});exports.MapEntries=undefined;












var _I18n=require('../I18n');var _I18n2=_interopRequireDefault(_I18n);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var MapEntries=exports.MapEntries=[
['User does not exist',/user.*not.*exist/i],
['User already exists',/user.*already.*exist/i],
['Incorrect username or password',/incorrect.*username.*password/i],
['Invalid password format',/validation.*password/i],
[
'Invalid phone number format',
/invalid.*phone/i,
'Invalid phone number format. Please use a phone number format of +12345678900']];exports.default=



AmplifyMessageMap=function AmplifyMessageMap(message){
var match=MapEntries.filter(function(entry){return entry[1].test(message);});
if(match.length===0){
return message;
}

var entry=match[0];
var msg=entry.length>2?entry[2]:entry[0];

return _I18n2.default.get(entry[0],msg);
};