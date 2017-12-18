Object.defineProperty(exports,"__esModule",{value:true});exports.Button=exports.ErrorRow=exports.Header=exports.LinkCell=exports.ConfirmationCode=exports.PhoneNumber=exports.Email=exports.Password=exports.Username=undefined;var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _jsxFileName='src/components/AmplifyUI.js';












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');
var _Platform=require('Platform');var _Platform2=_interopRequireDefault(_Platform);

var _I18n=require('../I18n');var _I18n2=_interopRequireDefault(_I18n);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var Username=exports.Username=function Username(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.TextInput,_extends({
style:theme.input,
placeholder:_I18n2.default.get('Username'),
autoFocus:true,
autoCapitalize:'none'},
props,{__source:{fileName:_jsxFileName,lineNumber:23}})));


};

var Password=exports.Password=function Password(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.TextInput,_extends({
style:theme.input,
placeholder:_I18n2.default.get('Password'),
secureTextEntry:true},
props,{__source:{fileName:_jsxFileName,lineNumber:36}})));


};

var Email=exports.Email=function Email(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.TextInput,_extends({
style:theme.input,
placeholder:_I18n2.default.get('Email'),
keyboardType:'email-address',
autoCapitalize:'none'},
props,{__source:{fileName:_jsxFileName,lineNumber:48}})));


};

var PhoneNumber=exports.PhoneNumber=function PhoneNumber(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.TextInput,_extends({
style:theme.input,
placeholder:_I18n2.default.get('Phone Number'),
keyboardType:'phone-pad'},
props,{__source:{fileName:_jsxFileName,lineNumber:61}})));


};

var ConfirmationCode=exports.ConfirmationCode=function ConfirmationCode(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.TextInput,_extends({
style:theme.input,
placeholder:_I18n2.default.get('Code'),
autoFocus:true},
props,{__source:{fileName:_jsxFileName,lineNumber:73}})));


};

var LinkCell=exports.LinkCell=function LinkCell(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.View,{style:theme.cell,__source:{fileName:_jsxFileName,lineNumber:85}},
_react2.default.createElement(_reactNative.TouchableHighlight,{
onPress:props.onPress,__source:{fileName:_jsxFileName,lineNumber:86}},

_react2.default.createElement(_reactNative.Text,{style:theme.sectionFooterLink,__source:{fileName:_jsxFileName,lineNumber:89}},props.children))));



};

var Header=exports.Header=function Header(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.View,{style:theme.sectionHeader,__source:{fileName:_jsxFileName,lineNumber:98}},
_react2.default.createElement(_reactNative.Text,{style:theme.sectionHeaderText,__source:{fileName:_jsxFileName,lineNumber:99}},props.children)));


};

var ErrorRow=exports.ErrorRow=function ErrorRow(props){
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(_reactNative.View,{style:theme.errorRow,__source:{fileName:_jsxFileName,lineNumber:107}},
_react2.default.createElement(_reactNative.Text,{__source:{fileName:_jsxFileName,lineNumber:108}},props.children)));


};

var Button=exports.Button=function Button(props){
var Touchable=_Platform2.default.OS==='android'?_reactNative.TouchableNativeFeedback:_reactNative.TouchableOpacity;
var theme=props.theme||AmplifyTheme;
return(
_react2.default.createElement(Touchable,{
accessibilityComponentType:'button',
disabled:props.disabled,
onPress:props.onPress,__source:{fileName:_jsxFileName,lineNumber:117}},

_react2.default.createElement(_reactNative.View,{style:props.disabled?theme.buttonDisaled:theme.button,__source:{fileName:_jsxFileName,lineNumber:122}},
_react2.default.createElement(_reactNative.Text,{style:props.disabled?theme.buttonTextDisabled:theme.buttonText,disabled:props.disabled,__source:{fileName:_jsxFileName,lineNumber:123}},props.title))));



};