Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var

















CognitoUserAttribute=function(){





function CognitoUserAttribute(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},Name=_ref.Name,Value=_ref.Value;_classCallCheck(this,CognitoUserAttribute);
this.Name=Name||'';
this.Value=Value||'';
}_createClass(CognitoUserAttribute,[{key:'getValue',value:function getValue()




{
return this.Value;
}},{key:'setValue',value:function setValue(






value){
this.Value=value;
return this;
}},{key:'getName',value:function getName()




{
return this.Name;
}},{key:'setName',value:function setName(






name){
this.Name=name;
return this;
}},{key:'toString',value:function toString()




{
return JSON.stringify(this);
}},{key:'toJSON',value:function toJSON()




{
return{
Name:this.Name,
Value:this.Value};

}}]);return CognitoUserAttribute;}();exports.default=CognitoUserAttribute;