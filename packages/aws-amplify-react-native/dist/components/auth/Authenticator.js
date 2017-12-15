Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _jsxFileName='src/components/auth/Authenticator.js';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Auth=require('../../Auth');var _Auth2=_interopRequireDefault(_Auth);
var _Analytics=require('../../Analytics');var _Analytics2=_interopRequireDefault(_Analytics);
var _Common=require('../../Common');

var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _AmplifyMessageMap=require('../AmplifyMessageMap');var _AmplifyMessageMap2=_interopRequireDefault(_AmplifyMessageMap);

var _SignIn=require('./SignIn');var _SignIn2=_interopRequireDefault(_SignIn);
var _ConfirmSignIn=require('./ConfirmSignIn');var _ConfirmSignIn2=_interopRequireDefault(_ConfirmSignIn);
var _VerifyContact=require('./VerifyContact');var _VerifyContact2=_interopRequireDefault(_VerifyContact);
var _SignUp=require('./SignUp');var _SignUp2=_interopRequireDefault(_SignUp);
var _ConfirmSignUp=require('./ConfirmSignUp');var _ConfirmSignUp2=_interopRequireDefault(_ConfirmSignUp);
var _ForgotPassword=require('./ForgotPassword');var _ForgotPassword2=_interopRequireDefault(_ForgotPassword);
var _Greetings=require('./Greetings');var _Greetings2=_interopRequireDefault(_Greetings);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Common.ConsoleLogger('Authenticator');var

AuthDecorator=function(){
function AuthDecorator(onStateChange){_classCallCheck(this,AuthDecorator);
this.onStateChange=onStateChange;
}_createClass(AuthDecorator,[{key:'signIn',value:function signIn(

username,password){
var that=this;
return _Auth2.default.signIn(username,password).
then(function(data){
that.onStateChange('signedIn');
return data;
});
}},{key:'signOut',value:function signOut()

{
var that=this;
return _Auth2.default.signOut().
then(function(){
that.onStateChange('signedOut');
});
}}]);return AuthDecorator;}();var


Authenticator=function(_React$Component){_inherits(Authenticator,_React$Component);
function Authenticator(props){_classCallCheck(this,Authenticator);var _this=_possibleConstructorReturn(this,(Authenticator.__proto__||Object.getPrototypeOf(Authenticator)).call(this,
props));
_this.state={
authState:props.authState||'signIn',
authDate:props.authData};


_this.handleStateChange=_this.handleStateChange.bind(_this);
_this.checkUser=_this.checkUser.bind(_this);return _this;
}_createClass(Authenticator,[{key:'componentWillMount',value:function componentWillMount()

{
this.checkUser();
}},{key:'handleStateChange',value:function handleStateChange(

state,data){
logger.debug('authenticator state change '+state);
if(state===this.state.authState){return;}

if(state==='signedOut'){state='signIn';}
this.setState({authState:state,authData:data,error:null});
if(this.props.onStateChange){this.props.onStateChange(state,data);}

switch(state){
case'signedIn':
_Analytics2.default.record('_userauth.sign_in');
break;
case'signedUp':
_Analytics2.default.record('_userauth.sign_up');
break;}

}},{key:'checkUser',value:function checkUser()

{var _this2=this;
_Auth2.default.currentUser().
then(function(user){
var state=user?'signedIn':'signIn';
_this2.handleStateChange(state,user);
}).
catch(function(err){return logger.error(err);});
}},{key:'render',value:function render()

{var _this3=this;var _state=
this.state,authState=_state.authState,authData=_state.authData;
var theme=this.props.theme||_AmplifyTheme2.default;
var messageMap=this.props.errorMessage||_AmplifyMessageMap2.default;var

hideDefault=this.props.hideDefault;
var props_children=this.props.children||[];
var default_children=[
_react2.default.createElement(_SignIn2.default,{__source:{fileName:_jsxFileName,lineNumber:108}}),
_react2.default.createElement(_ConfirmSignIn2.default,{__source:{fileName:_jsxFileName,lineNumber:109}}),
_react2.default.createElement(_VerifyContact2.default,{__source:{fileName:_jsxFileName,lineNumber:110}}),
_react2.default.createElement(_SignUp2.default,{__source:{fileName:_jsxFileName,lineNumber:111}}),
_react2.default.createElement(_ConfirmSignUp2.default,{__source:{fileName:_jsxFileName,lineNumber:112}}),
_react2.default.createElement(_ForgotPassword2.default,{__source:{fileName:_jsxFileName,lineNumber:113}}),
_react2.default.createElement(_Greetings2.default,{__source:{fileName:_jsxFileName,lineNumber:114}})];

var children=(hideDefault?[]:default_children).
concat(props_children).
map(function(child,index){
return _react2.default.cloneElement(child,{
key:'auth_piece_'+index,
theme:theme,
messageMap:messageMap,
authState:authState,
authData:authData,
onStateChange:_this3.handleStateChange,
Auth:new AuthDecorator(_this3.handleStateChange)});

});
return(
_react2.default.createElement(_reactNative.View,{style:theme.container,__source:{fileName:_jsxFileName,lineNumber:130}},
children));


}}]);return Authenticator;}(_react2.default.Component);exports.default=Authenticator;