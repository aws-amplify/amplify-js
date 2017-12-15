Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _jsxFileName='src/components/auth/Greetings.js';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _I18n=require('../../I18n');var _I18n2=_interopRequireDefault(_I18n);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyUI=require('../AmplifyUI');
var _AuthPiece2=require('./AuthPiece');var _AuthPiece3=_interopRequireDefault(_AuthPiece2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('Greetings');var

Greetings=function(_AuthPiece){_inherits(Greetings,_AuthPiece);
function Greetings(props){_classCallCheck(this,Greetings);var _this=_possibleConstructorReturn(this,(Greetings.__proto__||Object.getPrototypeOf(Greetings)).call(this,
props));

_this.signOut=_this.signOut.bind(_this);return _this;
}_createClass(Greetings,[{key:'signOut',value:function signOut()

{var _this2=this;
_Auth2.default.signOut().
then(function(){return _this2.changeState('signedOut');}).
catch(function(err){return _this2.error(err);});
}},{key:'signedInMessage',value:function signedInMessage(

username){return'Hello '+username;}},{key:'signedOutMessage',value:function signedOutMessage()
{return'Please Sign In / Sign Up';}},{key:'userGreetings',value:function userGreetings(

theme){
var user=this.props.authData||this.props.user;
var message=this.props.signedInMessage||this.signInMessage;
var greeting=typeof message==='function'?message(user.username):message;
return(
_react2.default.createElement(_reactNative.View,{style:theme.navRight,__source:{fileName:_jsxFileName,lineNumber:48}},
_react2.default.createElement(_reactNative.Text,{__source:{fileName:_jsxFileName,lineNumber:49}},greeting),
_react2.default.createElement(_AmplifyUI.Button,{
theme:theme,
title:_I18n2.default.get('Sign Out'),
style:theme.navButton,
onPress:this.signOut,__source:{fileName:_jsxFileName,lineNumber:50}})));



}},{key:'noUserGreetings',value:function noUserGreetings(

theme){
var message=this.props.signedOutMessage||this.signOutMessage;
var greeting=typeof message==='function'?message():message;
return _react2.default.createElement(_reactNative.Text,{style:theme.navRight,__source:{fileName:_jsxFileName,lineNumber:63}},message);
}},{key:'render',value:function render()

{var
authState=this.props.authState;
var signedIn=authState==='signedIn';
var theme=this.props.theme||_AmplifyTheme2.default;

return(
_react2.default.createElement(_reactNative.View,{style:theme.navBar,__source:{fileName:_jsxFileName,lineNumber:72}},
signedIn?this.userGreetings(theme):this.noUserGreetings(theme)));


}}]);return Greetings;}(_AuthPiece3.default);exports.default=Greetings;