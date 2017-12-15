Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _jsxFileName='src/components/storage/S3Album.js';var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Storage=require('../../Storage');var _Storage2=_interopRequireDefault(_Storage);
var _Common=require('../../Common');
var _AmplifyTheme=require('../AmplifyTheme');var _AmplifyTheme2=_interopRequireDefault(_AmplifyTheme);
var _S3Image=require('./S3Image');var _S3Image2=_interopRequireDefault(_S3Image);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var logger=new _Common.ConsoleLogger('Storage.S3Album');var

S3Album=function(_Component){_inherits(S3Album,_Component);
function S3Album(props){_classCallCheck(this,S3Album);var _this=_possibleConstructorReturn(this,(S3Album.__proto__||Object.getPrototypeOf(S3Album)).call(this,
props));

_this.state={images:[]};return _this;
}_createClass(S3Album,[{key:'componentDidMount',value:function componentDidMount()

{var _this2=this;var _props=
this.props,path=_props.path,level=_props.level,filter=_props.filter;
logger.debug(path);
_Storage2.default.list(path,{level:level?level:'public'}).
then(function(data){
logger.debug(data);
if(filter){data=filter(data);}
_this2.setState({images:data});
}).
catch(function(err){return logger.warn(err);});
}},{key:'render',value:function render()

{var
images=this.state.images;
if(!images){return null;}var _Dimensions$get=

_reactNative.Dimensions.get('window'),width=_Dimensions$get.width,height=_Dimensions$get.height;
var theme=this.props.theme||_AmplifyTheme2.default;
var albumStyle=_extends(
{},
_reactNative.StyleSheet.flatten(theme.album),
{width:'100%',height:height});

var list=this.state.images.map(function(image){
return _react2.default.createElement(_S3Image2.default,{
key:image.key,
imgKey:image.key,
resizeMode:'cover',
style:{width:'100%',height:width},
theme:theme,__source:{fileName:_jsxFileName,lineNumber:55}});

});
return(
_react2.default.createElement(_reactNative.ScrollView,_extends({},this.props,{style:albumStyle,__source:{fileName:_jsxFileName,lineNumber:64}}),
list));


}}]);return S3Album;}(_react.Component);exports.default=S3Album;