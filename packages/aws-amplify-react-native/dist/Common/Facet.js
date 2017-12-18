Object.defineProperty(exports,"__esModule",{value:true});exports.ClientDevice=exports.Pinpoint=exports.AMA=exports.Cognito=exports.AWS=undefined;












var _awsSdkReactNative=require('aws-sdk/dist/aws-sdk-react-native');var AWS=_interopRequireWildcard(_awsSdkReactNative);
var _amazonCognitoIdentityJs=require('amazon-cognito-identity-js');var Cognito=_interopRequireWildcard(_amazonCognitoIdentityJs);
var _awsSdkMobileAnalytics=require('aws-sdk-mobile-analytics');var AMA=_interopRequireWildcard(_awsSdkMobileAnalytics);

var _ClientDevice=require('./ClientDevice');var _ClientDevice2=_interopRequireDefault(_ClientDevice);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj.default=obj;return newObj;}}

var Pinpoint=AWS.Pinpoint;exports.

AWS=AWS;exports.Cognito=Cognito;exports.AMA=AMA;exports.Pinpoint=Pinpoint;exports.ClientDevice=_ClientDevice2.default;