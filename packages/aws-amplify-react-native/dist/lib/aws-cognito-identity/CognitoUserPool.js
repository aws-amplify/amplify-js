Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();
















var _awsSdkReactNative=require('aws-sdk/dist/aws-sdk-react-native');

var _CognitoUser=require('./CognitoUser');var _CognitoUser2=_interopRequireDefault(_CognitoUser);
var _StorageHelper=require('./StorageHelper');var _StorageHelper2=_interopRequireDefault(_StorageHelper);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var


CognitoUserPool=function(){







function CognitoUserPool(data){_classCallCheck(this,CognitoUserPool);var _ref=
data||{},UserPoolId=_ref.UserPoolId,ClientId=_ref.ClientId,endpoint=_ref.endpoint;
if(!UserPoolId||!ClientId){
throw new Error('Both UserPoolId and ClientId are required.');
}
if(!/^[\w-]+_.+$/.test(UserPoolId)){
throw new Error('Invalid UserPoolId format.');
}
var region=UserPoolId.split('_')[0];

this.userPoolId=UserPoolId;
this.clientId=ClientId;

this.client=new _awsSdkReactNative.CognitoIdentityServiceProvider({
apiVersion:'2016-04-19',
region:region,
endpoint:endpoint});


this.storage=data.Storage||new _StorageHelper2.default().getStorage();
}_createClass(CognitoUserPool,[{key:'getUserPoolId',value:function getUserPoolId()




{
return this.userPoolId;
}},{key:'getClientId',value:function getClientId()




{
return this.clientId;
}},{key:'signUp',value:function signUp(















username,password,userAttributes,validationData,callback){var _this=this;
this.client.makeUnauthenticatedRequest('signUp',{
ClientId:this.clientId,
Username:username,
Password:password,
UserAttributes:userAttributes,
ValidationData:validationData},
function(err,data){
if(err){
return callback(err,null);
}

var cognitoUser={
Username:username,
Pool:_this,
Storage:_this.storage};


var returnData={
user:new _CognitoUser2.default(cognitoUser),
userConfirmed:data.UserConfirmed,
userSub:data.UserSub};


return callback(null,returnData);
});
}},{key:'getCurrentUser',value:function getCurrentUser()







{
var lastUserKey='CognitoIdentityServiceProvider.'+this.clientId+'.LastAuthUser';

var lastAuthUser=this.storage.getItem(lastUserKey);
if(lastAuthUser){
var cognitoUser={
Username:lastAuthUser,
Pool:this,
Storage:this.storage};


return new _CognitoUser2.default(cognitoUser);
}

return null;
}}]);return CognitoUserPool;}();exports.default=CognitoUserPool;