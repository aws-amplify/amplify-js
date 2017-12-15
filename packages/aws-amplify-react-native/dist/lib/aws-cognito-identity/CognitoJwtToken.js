Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();
















var _awsSdkReactNative=require('aws-sdk/dist/aws-sdk-react-native');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var


CognitoJwtToken=function(){




function CognitoJwtToken(token){_classCallCheck(this,CognitoJwtToken);

this.jwtToken=token||'';
this.payload=this.decodePayload();
}_createClass(CognitoJwtToken,[{key:'getJwtToken',value:function getJwtToken()




{
return this.jwtToken;
}},{key:'getExpiration',value:function getExpiration()




{
return this.payload.exp;
}},{key:'getIssuedAt',value:function getIssuedAt()




{
return this.payload.iat;
}},{key:'decodePayload',value:function decodePayload()




{
var payload=this.jwtToken.split('.')[1];
try{
return JSON.parse(_awsSdkReactNative.util.base64.decode(payload).toString('utf8'));
}catch(err){
return{};
}
}}]);return CognitoJwtToken;}();exports.default=CognitoJwtToken;