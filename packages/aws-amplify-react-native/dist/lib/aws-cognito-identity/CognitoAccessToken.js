Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;
















var _CognitoJwtToken2=require('./CognitoJwtToken');var _CognitoJwtToken3=_interopRequireDefault(_CognitoJwtToken2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var


CognitoAccessToken=function(_CognitoJwtToken){_inherits(CognitoAccessToken,_CognitoJwtToken);




function CognitoAccessToken(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},AccessToken=_ref.AccessToken;_classCallCheck(this,CognitoAccessToken);return _possibleConstructorReturn(this,(CognitoAccessToken.__proto__||Object.getPrototypeOf(CognitoAccessToken)).call(this,
AccessToken||''));
}return CognitoAccessToken;}(_CognitoJwtToken3.default);exports.default=CognitoAccessToken;