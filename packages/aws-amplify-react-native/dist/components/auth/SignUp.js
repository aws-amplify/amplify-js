Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _jsxFileName='src/components/auth/SignUp.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyUI=require('../AmplifyUI');
var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('SignUp');

var Footer=function Footer(props){var
theme=props.theme,onStateChange=props.onStateChange;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionFooter,__source:{fileName:_jsxFileName,lineNumber:30}},
_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('confirmSignUp');},__source:{fileName:_jsxFileName,lineNumber:31}},
_I18n2.default.get('Confirm a Code')),

_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('signIn');},__source:{fileName:_jsxFileName,lineNumber:34}},
_I18n2.default.get('Sign In'))));



};var

SignUp=function(_AuthPiece){_inherits(SignUp,_AuthPiece);
function SignUp(props){_classCallCheck(this,SignUp);var _this=_possibleConstructorReturn(this,(SignUp.__proto__||Object.getPrototypeOf(SignUp)).call(this,
props));

_this.state={
username:null,
password:null,
email:null,
phone_number:null};


_this.signUp=_this.signUp.bind(_this);return _this;
}_createClass(SignUp,[{key:'signUp',value:function signUp()

{var _this2=this;var _state=
this.state,username=_state.username,password=_state.password,email=_state.email,phone_number=_state.phone_number;
logger.debug('Sign Up for '+username);
_Auth2.default.signUp(username,password,email,phone_number).
then(function(data){
logger.debug(data);
_this2.changeState('confirmSignUp',username);
}).
catch(function(err){return _this2.error(err);});
}},{key:'render',value:function render()

{var _this3=this;
if(!['signUp'].includes(this.props.authState)){
return null;
}

var theme=this.props.theme||_AmplifyTheme2.default;
return(
_react2.default.createElement(_reactNative.View,{style:theme.section,__source:{fileName:_jsxFileName,lineNumber:73}},
_react2.default.createElement(_AmplifyUI.Header,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:74}},_I18n2.default.get('Sign Up')),
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:75}},
_react2.default.createElement(_AmplifyUI.Username,{
theme:theme,
onChangeText:function onChangeText(text){return _this3.setState({username:text});},__source:{fileName:_jsxFileName,lineNumber:76}}),

_react2.default.createElement(_AmplifyUI.Password,{
theme:theme,
onChangeText:function onChangeText(text){return _this3.setState({password:text});},__source:{fileName:_jsxFileName,lineNumber:80}}),

_react2.default.createElement(_AmplifyUI.Email,{
theme:theme,
onChangeText:function onChangeText(text){return _this3.setState({email:text});},__source:{fileName:_jsxFileName,lineNumber:84}}),

_react2.default.createElement(_AmplifyUI.PhoneNumber,{
theme:theme,
onChangeText:function onChangeText(text){return _this3.setState({phone_number:text});},__source:{fileName:_jsxFileName,lineNumber:88}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Sign Up'),
onPress:this.signUp,
disabled:!this.state.username||!this.state.password,__source:{fileName:_jsxFileName,lineNumber:92}})),


_react2.default.createElement(Footer,{theme:theme,onStateChange:this.changeState,__source:{fileName:_jsxFileName,lineNumber:99}}),
_react2.default.createElement(_AmplifyUI.ErrorRow,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:100}},this.state.error)));


}}]);return SignUp;}(_AuthPiece3.default);exports.default=SignUp;