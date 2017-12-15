Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var

















AuthenticationDetails=function(){








function AuthenticationDetails(data){_classCallCheck(this,AuthenticationDetails);var _ref=
data||{},ValidationData=_ref.ValidationData,Username=_ref.Username,Password=_ref.Password,AuthParameters=_ref.AuthParameters;
this.validationData=ValidationData||[];
this.authParameters=AuthParameters||[];
this.username=Username;
this.password=Password;
}_createClass(AuthenticationDetails,[{key:"getUsername",value:function getUsername()




{
return this.username;
}},{key:"getPassword",value:function getPassword()




{
return this.password;
}},{key:"getValidationData",value:function getValidationData()




{
return this.validationData;
}},{key:"getAuthParameters",value:function getAuthParameters()




{
return this.authParameters;
}}]);return AuthenticationDetails;}();exports.default=AuthenticationDetails;