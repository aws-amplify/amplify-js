Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _jsxFileName='src/components/auth/ForgotPassword.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyUI=require('../AmplifyUI');
var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('ForgotPassword');

var Footer=function Footer(props){var
theme=props.theme,onStateChange=props.onStateChange;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionFooter,__source:{fileName:_jsxFileName,lineNumber:30}},
_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('signIn');},__source:{fileName:_jsxFileName,lineNumber:31}},
_I18n2.default.get('Back to Sign In'))));



};var

ForgotPassword=function(_AuthPiece){_inherits(ForgotPassword,_AuthPiece);
function ForgotPassword(props){_classCallCheck(this,ForgotPassword);var _this=_possibleConstructorReturn(this,(ForgotPassword.__proto__||Object.getPrototypeOf(ForgotPassword)).call(this,
props));

_this.state={delivery:null};

_this.send=_this.send.bind(_this);
_this.submit=_this.submit.bind(_this);return _this;

}_createClass(ForgotPassword,[{key:'send',value:function send()

{var _this2=this;var
username=this.state.username;
if(!username){
this.error('Username cannot be empty');
return;
}
_Auth2.default.forgotPassword(username).
then(function(data){
logger.debug(data);
_this2.setState({delivery:data.CodeDeliveryDetails});
}).
catch(function(err){return _this2.error(err);});
}},{key:'submit',value:function submit()

{var _this3=this;var _state=
this.state,username=_state.username,code=_state.code,password=_state.password;
_Auth2.default.forgotPasswordSubmit(username,code,password).
then(function(data){
logger.debug(data);
_this3.changeState('signIn');
}).
catch(function(err){return _this3.error(err);});
}},{key:'forgotBody',value:function forgotBody(

theme){var _this4=this;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:75}},
_react2.default.createElement(_AmplifyUI.Username,{
theme:theme,
onChangeText:function onChangeText(text){return _this4.setState({username:text});},__source:{fileName:_jsxFileName,lineNumber:76}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:'Send Code',
style:theme.button,
onPress:this.send,
disabled:!this.state.username,__source:{fileName:_jsxFileName,lineNumber:80}})));



}},{key:'submitBody',value:function submitBody(

theme){var _this5=this;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:93}},
_react2.default.createElement(_AmplifyUI.ConfirmationCode,{
theme:theme,
onChangeText:function onChangeText(text){return _this5.setState({code:text});},__source:{fileName:_jsxFileName,lineNumber:94}}),

_react2.default.createElement(_AmplifyUI.Password,{
theme:theme,
placeholder:'New Password',
onChangeText:function onChangeText(text){return _this5.setState({password:text});},__source:{fileName:_jsxFileName,lineNumber:98}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Submit'),
style:theme.button,
onPress:this.submit,
disabled:!this.state.username,__source:{fileName:_jsxFileName,lineNumber:103}})));



}},{key:'render',value:function render()

{
if(!['forgotPassword'].includes(this.props.authState)){
return null;
}

var theme=this.props.theme||_AmplifyTheme2.default;

return(
_react2.default.createElement(_reactNative.View,{style:theme.section,__source:{fileName:_jsxFileName,lineNumber:122}},
_react2.default.createElement(_AmplifyUI.Header,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:123}},_I18n2.default.get('Forgot Password')),
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:124}},
!this.state.delivery&&this.forgotBody(theme),
this.state.delivery&&this.submitBody(theme)),

_react2.default.createElement(Footer,{theme:theme,onStateChange:this.changeState,__source:{fileName:_jsxFileName,lineNumber:128}}),
_react2.default.createElement(_AmplifyUI.ErrorRow,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:129}},this.state.error)));


}}]);return ForgotPassword;}(_AuthPiece3.default);exports.default=ForgotPassword;