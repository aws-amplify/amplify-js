Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var

















CognitoUserSession=function(){







function CognitoUserSession(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},IdToken=_ref.IdToken,RefreshToken=_ref.RefreshToken,AccessToken=_ref.AccessToken,ClockDrift=_ref.ClockDrift;_classCallCheck(this,CognitoUserSession);
if(AccessToken==null||IdToken==null){
throw new Error('Id token and Access Token must be present.');
}

this.idToken=IdToken;
this.refreshToken=RefreshToken;
this.accessToken=AccessToken;
this.clockDrift=ClockDrift===undefined?this.calculateClockDrift():ClockDrift;
}_createClass(CognitoUserSession,[{key:'getIdToken',value:function getIdToken()




{
return this.idToken;
}},{key:'getRefreshToken',value:function getRefreshToken()




{
return this.refreshToken;
}},{key:'getAccessToken',value:function getAccessToken()




{
return this.accessToken;
}},{key:'getClockDrift',value:function getClockDrift()




{
return this.clockDrift;
}},{key:'calculateClockDrift',value:function calculateClockDrift()




{
var now=Math.floor(new Date()/1000);
var iat=Math.min(this.accessToken.getIssuedAt(),this.idToken.getIssuedAt());

return now-iat;
}},{key:'isValid',value:function isValid()






{
var now=Math.floor(new Date()/1000);
var adjusted=now-this.clockDrift;

return adjusted<this.accessToken.getExpiration()&&adjusted<this.idToken.getExpiration();
}}]);return CognitoUserSession;}();exports.default=CognitoUserSession;