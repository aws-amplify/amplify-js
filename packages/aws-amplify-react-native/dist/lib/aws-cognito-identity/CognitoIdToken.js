Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;
















var _CognitoJwtToken2=require('./CognitoJwtToken');var _CognitoJwtToken3=_interopRequireDefault(_CognitoJwtToken2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var


CognitoIdToken=function(_CognitoJwtToken){_inherits(CognitoIdToken,_CognitoJwtToken);




function CognitoIdToken(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},IdToken=_ref.IdToken;_classCallCheck(this,CognitoIdToken);return _possibleConstructorReturn(this,(CognitoIdToken.__proto__||Object.getPrototypeOf(CognitoIdToken)).call(this,
IdToken||''));
}return CognitoIdToken;}(_CognitoJwtToken3.default);exports.default=CognitoIdToken;