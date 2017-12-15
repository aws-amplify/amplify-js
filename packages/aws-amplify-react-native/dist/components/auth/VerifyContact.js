Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _jsxFileName='src/components/auth/VerifyContact.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyUI=require('../AmplifyUI');
var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('SignIn');

var Footer=function Footer(props){var
theme=props.theme,onStateChange=props.onStateChange;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionFooter,__source:{fileName:_jsxFileName,lineNumber:30}},
_react2.default.createElement(_AmplifyUI.LinkCell,{theme:theme,onPress:function onPress(){return onStateChange('signedIn');},__source:{fileName:_jsxFileName,lineNumber:31}},
_I18n2.default.get('Skip'))));



};var

VerifyContact=function(_AuthPiece){_inherits(VerifyContact,_AuthPiece);
function VerifyContact(props){_classCallCheck(this,VerifyContact);var _this=_possibleConstructorReturn(this,(VerifyContact.__proto__||Object.getPrototypeOf(VerifyContact)).call(this,
props));

_this.state={
verifyAttr:null,
error:null};


_this.verify=_this.verify.bind(_this);
_this.submit=_this.submit.bind(_this);return _this;
}_createClass(VerifyContact,[{key:'verify',value:function verify()

{var _this2=this;
var user=this.props.authData;
var attr=this.state.pickAttr;
if(!attr){
this.error('Neither Email nor Phone Number selected');
return;
}

var that=this;
_Auth2.default.verifyCurrentUserAttribute(attr).
then(function(data){
logger.debug(data);
that.setState({verifyAttr:attr});
}).
catch(function(err){return _this2.error(err);});
}},{key:'submit',value:function submit()

{var _this3=this;
var attr=this.state.verifyAttr;var
code=this.state.code;
_Auth2.default.verifyCurrentUserAttributeSubmit(attr,code).
then(function(data){
logger.debug(data);
_this3.changeState('signedIn',_this3.props.authData);
}).
catch(function(err){return _this3.error(err);});
}},{key:'skip',value:function skip()

{
this.changeState('signedIn');
}},{key:'verifyBody',value:function verifyBody(

theme){var _this4=this;var
unverified=this.props.authData.unverified;
if(!unverified){
logger.debug('no unverified contact');
return null;
}var

email=unverified.email,phone_number=unverified.phone_number;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:92}},
_react2.default.createElement(_reactNative.Picker,{
selectedValue:this.state.pickAttr,
onValueChange:function onValueChange(value,index){return _this4.setState({pickAttr:value});},__source:{fileName:_jsxFileName,lineNumber:93}},

email?_react2.default.createElement(_reactNative.Picker.Item,{label:'Email',value:'email',__source:{fileName:_jsxFileName,lineNumber:97}}):null,
phone_number?_react2.default.createElement(_reactNative.Picker.Item,{label:'Phone Number',value:'phone_number',__source:{fileName:_jsxFileName,lineNumber:98}}):null),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Verify'),
onPress:this.verify,
disabled:!this.state.pickAttr,__source:{fileName:_jsxFileName,lineNumber:100}})));



}},{key:'submitBody',value:function submitBody(

theme){var _this5=this;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionBody,__source:{fileName:_jsxFileName,lineNumber:112}},
_react2.default.createElement(_AmplifyUI.ConfirmationCode,{
theme:theme,
onChangeText:function onChangeText(text){return _this5.setState({code:text});},__source:{fileName:_jsxFileName,lineNumber:113}}),

_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Submit'),
onPress:this.submit,
disabled:!this.state.code,__source:{fileName:_jsxFileName,lineNumber:117}})));



}},{key:'render',value:function render()

{
if(!['verifyContact'].includes(this.props.authState)){
return null;
}

var theme=this.props.theme||_AmplifyTheme2.default;
return(
_react2.default.createElement(_reactNative.View,{style:theme.section,__source:{fileName:_jsxFileName,lineNumber:134}},
_react2.default.createElement(_AmplifyUI.Header,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:135}},_I18n2.default.get('Verify Contact')),
!this.state.verifyAttr&&this.verifyBody(theme),
this.state.verifyAttr&&this.submitBody(theme),
_react2.default.createElement(Footer,{theme:theme,onStateChange:this.changeState,__source:{fileName:_jsxFileName,lineNumber:138}}),
_react2.default.createElement(_AmplifyUI.ErrorRow,{theme:theme,__source:{fileName:_jsxFileName,lineNumber:139}},this.state.error)));


}}]);return VerifyContact;}(_AuthPiece3.default);exports.default=VerifyContact;