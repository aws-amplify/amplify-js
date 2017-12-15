Object.defineProperty(exports,"__esModule",{value:true});exports.Greetings=exports.VerifyContact=exports.ForgotPassword=exports.ConfirmSignUp=exports.SignUp=exports.ConfirmSignIn=exports.SignIn=exports.AuthPiece=exports.Authenticator=undefined;var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _jsxFileName='src/components/auth/index.js';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();exports.









































withAuthenticator=withAuthenticator;var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactNative=require('react-native');var _Common=require('../../Common');var _Authenticator=require('./Authenticator');var _Authenticator2=_interopRequireDefault(_Authenticator);var _AuthPiece=require('./AuthPiece');var _AuthPiece2=_interopRequireDefault(_AuthPiece);var _SignIn=require('./SignIn');var _SignIn2=_interopRequireDefault(_SignIn);var _ConfirmSignIn=require('./ConfirmSignIn');var _ConfirmSignIn2=_interopRequireDefault(_ConfirmSignIn);var _SignUp=require('./SignUp');var _SignUp2=_interopRequireDefault(_SignUp);var _ConfirmSignUp=require('./ConfirmSignUp');var _ConfirmSignUp2=_interopRequireDefault(_ConfirmSignUp);var _ForgotPassword=require('./ForgotPassword');var _ForgotPassword2=_interopRequireDefault(_ForgotPassword);var _VerifyContact=require('./VerifyContact');var _VerifyContact2=_interopRequireDefault(_VerifyContact);var _Greetings=require('./Greetings');var _Greetings2=_interopRequireDefault(_Greetings);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var logger=new _Common.ConsoleLogger('auth components');exports.Authenticator=_Authenticator2.default;exports.AuthPiece=_AuthPiece2.default;exports.SignIn=_SignIn2.default;exports.ConfirmSignIn=_ConfirmSignIn2.default;exports.SignUp=_SignUp2.default;exports.ConfirmSignUp=_ConfirmSignUp2.default;exports.ForgotPassword=_ForgotPassword2.default;exports.VerifyContact=_VerifyContact2.default;exports.Greetings=_Greetings2.default;function withAuthenticator(Comp){var includeGreetings=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var
Wrapper=function(_React$Component){_inherits(Wrapper,_React$Component);
function Wrapper(props){_classCallCheck(this,Wrapper);var _this=_possibleConstructorReturn(this,(Wrapper.__proto__||Object.getPrototypeOf(Wrapper)).call(this,
props));

_this.handleAuthStateChange=_this.handleAuthStateChange.bind(_this);

_this.state={authState:props.authState};return _this;
}_createClass(Wrapper,[{key:'handleAuthStateChange',value:function handleAuthStateChange(

state,data){
this.setState({authState:state,authData:data});
if(this.props.onStateChange){this.props.onStateChange(state,data);}
}},{key:'render',value:function render()

{var _state=
this.state,authState=_state.authState,authData=_state.authData;
var signedIn=authState==='signedIn';
if(signedIn){
if(!includeGreetings){
return(
_react2.default.createElement(Comp,_extends({},
this.props,{
authState:authState,
authData:authData,
onStateChange:this.handleAuthStateChange,__source:{fileName:_jsxFileName,lineNumber:64}})));


}

return(
_react2.default.createElement(_reactNative.View,{__source:{fileName:_jsxFileName,lineNumber:74}},
_react2.default.createElement(_Greetings2.default,{
authState:authState,
authData:authData,
onStateChange:this.handleAuthStateChange,__source:{fileName:_jsxFileName,lineNumber:75}}),

_react2.default.createElement(Comp,_extends({},
this.props,{
authState:authState,
authData:authData,
onStateChange:this.handleAuthStateChange,__source:{fileName:_jsxFileName,lineNumber:80}}))));



}

return _react2.default.createElement(_Authenticator2.default,_extends({},
this.props,{
onStateChange:this.handleAuthStateChange,__source:{fileName:_jsxFileName,lineNumber:90}}));

}}]);return Wrapper;}(_react2.default.Component);


Object.keys(Comp).forEach(function(key){


try{
var excludes=[
'displayName',
'childContextTypes'];

if(excludes.includes(key)){return;}

Wrapper[key]=Comp[key];
}catch(err){
logger.warn('not able to assign '+key,err);
}
});

return Wrapper;
}