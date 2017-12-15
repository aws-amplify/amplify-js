Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _jsxFileName='src/components/storage/S3Image.js';var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Storage=require('../../Storage');var _Storage2=_interopRequireDefault(_Storage);
var _Common=require('../../Common');
var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('Storage.S3Image');var

S3Image=function(_Component){_inherits(S3Image,_Component);
function S3Image(props){_classCallCheck(this,S3Image);var _this=_possibleConstructorReturn(this,(S3Image.__proto__||Object.getPrototypeOf(S3Image)).call(this,
props));

_this.state={src:null};return _this;
}_createClass(S3Image,[{key:'getImageSource',value:function getImageSource()

{var _this2=this;var _props=
this.props,imgKey=_props.imgKey,level=_props.level;
_Storage2.default.get(imgKey,{level:level?level:'public'}).
then(function(url){
logger.debug(url);
_this2.setState({
src:{uri:url}});

}).
catch(function(err){return logger.warn(err);});
}},{key:'load',value:function load()

{var _props2=
this.props,imgKey=_props2.imgKey,body=_props2.body,contentType=_props2.contentType,level=_props2.level;
if(!imgKey){
logger.debug('empty imgKey');
return;
}

var that=this;
logger.debug('loading '+imgKey+'...');
if(body){
var type=contentType?contentType:'binary/octet-stream';
var opt={
contentType:type,
level:level?level:'public'};

var ret=_Storage2.default.put(imgKey,body,opt);
ret.then(function(data){
logger.debug(data);
that.getImageSource();
}).
catch(function(err){return logger.warn(err);});
}else{
that.getImageSource();
}
}},{key:'componentDidMount',value:function componentDidMount()

{
this.load();
}},{key:'componentDidUpdate',value:function componentDidUpdate(

prevProps){
if(prevProps.imgKey!==this.props.imgKey||prevProps.body!==this.props.body){
this.load();
}
}},{key:'render',value:function render()

{var
src=this.state.src;
if(!src){return null;}var _props3=

this.props,style=_props3.style,resizeMode=_props3.resizeMode;
var theme=this.props.theme||_AmplifyTheme2.default;
var photoStyle=_extends({},_reactNative.StyleSheet.flatten(theme.photo),style);

return _react2.default.createElement(_reactNative.Image,{source:src,resizeMode:resizeMode,style:photoStyle,__source:{fileName:_jsxFileName,lineNumber:86}});
}}]);return S3Image;}(_react.Component);exports.default=S3Image;