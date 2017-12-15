Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _jsxFileName='src/components/auth/ConfirmSignIn.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyUI=require('../AmplifyUI');
var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('SignIn');

var Footer=function Footer(props){
var theme=props.theme||_AmplifyTheme2.default;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionFooter,__source:{fileName:_jsxFileName,lineNumber:30}},
_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('signIn');},__source:{fileName:_jsxFileName,lineNumber:31}},
_I18n2.default.get('Back to Sign In'))));



};var

ConfirmSignIn=function(_AuthPiece){_inherits(ConfirmSignIn,_AuthPiece);
function ConfirmSignIn(props){_classCallCheck(this,ConfirmSignIn);var _this=_possibleConstructorReturn(this,(ConfirmSignIn.__proto__||Object.getPrototypeOf(ConfirmSignIn)).call(this,
props));

_this.state={
code:null,
error:null};


_this.confirm=_this.confirm.bind(_this);return _this;
}_createClass(ConfirmSignIn,[{key:'confirm',value:function confirm()

{var _this2=this;
var user=this.props.authData;var
code=this.state.code;
logger.debug('Confirm Sign In for '+user.username);
_Auth2.default.confirmSignIn(user,code).
then(function(data){return _this2.changeState('signedIn');}).
catch(function(err){return _this2.error(err);});
}},{key:'render',value:function render()

{var _this3=this;
if(!['confirmSignIn'].includes(this.props.authState)){
return null;
}

var theme=this.props.theme||_AmplifyTheme2.default;
return(
_react2.default.createElement(_reactNative.View,{style:theme.section,__source:{fileName:_jsxFileName,lineNumber:66}},
_react2.default.createElement(_AmplifyUI.Header,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:67}},_I18n2.default.get('Confirm Sign In')),
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:68}},
_react2.default.createElement(_AmplifyUI.ConfirmationCode,{
theme:theme,
onChangeText:function onChangeText(text){return _this3.setState({code:text});},__source:{fileName:_jsxFileName,lineNumber:69}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Confirm'),
onPress:this.confirm,
disabled:!this.state.code,__source:{fileName:_jsxFileName,lineNumber:73}})),


_react2.default.createElement(Footer,{theme:theme,onStateChange:this.changeState,__source:{fileName:_jsxFileName,lineNumber:80}}),
_react2.default.createElement(_AmplifyUI.ErrorRow,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:81}},this.state.error)));


}}]);return ConfirmSignIn;}(_AuthPiece3.default);exports.default=ConfirmSignIn;