Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _jsxFileName='src/components/auth/SignIn.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);
var _AmplifyUI=require('../AmplifyUI');
var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('SignIn');

var Footer=function Footer(props){var
theme=props.theme,onStateChange=props.onStateChange;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionFooter,__source:{fileName:_jsxFileName,lineNumber:30}},
_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('forgotPassword');},__source:{fileName:_jsxFileName,lineNumber:31}},
_I18n2.default.get('Forgot Password')),

_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('signUp');},__source:{fileName:_jsxFileName,lineNumber:34}},
_I18n2.default.get('Sign Up'))));



};var

SignIn=function(_AuthPiece){_inherits(SignIn,_AuthPiece);
function SignIn(props){_classCallCheck(this,SignIn);var _this=_possibleConstructorReturn(this,(SignIn.__proto__||Object.getPrototypeOf(SignIn)).call(this,
props));

_this.state={
username:null,
password:null,
error:null};


_this.checkContact=_this.checkContact.bind(_this);
_this.signIn=_this.signIn.bind(_this);return _this;
}_createClass(SignIn,[{key:'checkContact',value:function checkContact(

user){var _this2=this;
_Auth2.default.verifiedContact(user).
then(function(data){
logger.debug('verified user attributes',data);
if(!_Common.JS.isEmpty(data.verified)){
_this2.changeState('signedIn',user);
}else{
user=_extends(user,data);
_this2.changeState('verifyContact',user);
}
});
}},{key:'signIn',value:function signIn()

{var _this3=this;var _state=
this.state,username=_state.username,password=_state.password;
logger.debug('Sign In for '+username);
_Auth2.default.signIn(username,password).
then(function(user){
logger.debug(user);
var requireMFA=user.Session!==null;
if(user.challengeName==='SMS_MFA'){
_this3.changeState('confirmSignIn',user);
}else if(user.challengeName==='NEW_PASSWORD_REQUIRED'){
logger.debug('require new password',user.challengeParam);
_this3.changeState('requireNewPassword',user);
}else{
_this3.checkContact(user);
}
}).
catch(function(err){return _this3.error(err);});
}},{key:'render',value:function render()

{var _this4=this;
if(!['signIn','signedOut','signedUp'].includes(this.props.authState)){
return null;
}

var theme=this.props.theme||_AmplifyTheme2.default;
return(
_react2.default.createElement(_reactNative.View,{style:theme.section,__source:{fileName:_jsxFileName,lineNumber:94}},
_react2.default.createElement(_AmplifyUI.Header,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:95}},_I18n2.default.get('Sign In')),
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:96}},
_react2.default.createElement(_AmplifyUI.Username,{
theme:theme,
onChangeText:function onChangeText(text){return _this4.setState({username:text});},__source:{fileName:_jsxFileName,lineNumber:97}}),

_react2.default.createElement(_AmplifyUI.Password,{
theme:theme,
onChangeText:function onChangeText(text){return _this4.setState({password:text});},__source:{fileName:_jsxFileName,lineNumber:101}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Sign In'),
onPress:this.signIn,
disabled:!this.state.username||!this.state.password,__source:{fileName:_jsxFileName,lineNumber:105}})),


_react2.default.createElement(Footer,{theme:theme,onStateChange:this.changeState,__source:{fileName:_jsxFileName,lineNumber:112}}),
_react2.default.createElement(_AmplifyUI.ErrorRow,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:113}},this.state.error)));


}}]);return SignIn;}(_AuthPiece3.default);exports.default=SignIn;