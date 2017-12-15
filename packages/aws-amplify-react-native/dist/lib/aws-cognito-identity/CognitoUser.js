Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();
















var _awsSdkReactNative=require('aws-sdk/dist/aws-sdk-react-native');

var _BigInteger=require('./BigInteger');var _BigInteger2=_interopRequireDefault(_BigInteger);
var _AuthenticationHelper=require('./AuthenticationHelper');var _AuthenticationHelper2=_interopRequireDefault(_AuthenticationHelper);
var _CognitoAccessToken=require('./CognitoAccessToken');var _CognitoAccessToken2=_interopRequireDefault(_CognitoAccessToken);
var _CognitoIdToken=require('./CognitoIdToken');var _CognitoIdToken2=_interopRequireDefault(_CognitoIdToken);
var _CognitoRefreshToken=require('./CognitoRefreshToken');var _CognitoRefreshToken2=_interopRequireDefault(_CognitoRefreshToken);
var _CognitoUserSession=require('./CognitoUserSession');var _CognitoUserSession2=_interopRequireDefault(_CognitoUserSession);
var _DateHelper=require('./DateHelper');var _DateHelper2=_interopRequireDefault(_DateHelper);
var _CognitoUserAttribute=require('./CognitoUserAttribute');var _CognitoUserAttribute2=_interopRequireDefault(_CognitoUserAttribute);
var _StorageHelper=require('./StorageHelper');var _StorageHelper2=_interopRequireDefault(_StorageHelper);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var










































CognitoUser=function(){







function CognitoUser(data){_classCallCheck(this,CognitoUser);
if(data==null||data.Username==null||data.Pool==null){
throw new Error('Username and pool information are required.');
}

this.username=data.Username||'';
this.pool=data.Pool;
this.Session=null;

this.client=data.Pool.client;

this.signInUserSession=null;
this.authenticationFlowType='USER_SRP_AUTH';

this.storage=data.Storage||new _StorageHelper2.default().getStorage();
}_createClass(CognitoUser,[{key:'setSignInUserSession',value:function setSignInUserSession(






signInUserSession){
this.clearCachedTokens();
this.signInUserSession=signInUserSession;
this.cacheTokens();
}},{key:'getSignInUserSession',value:function getSignInUserSession()




{
return this.signInUserSession;
}},{key:'getUsername',value:function getUsername()




{
return this.username;
}},{key:'getAuthenticationFlowType',value:function getAuthenticationFlowType()




{
return this.authenticationFlowType;
}},{key:'setAuthenticationFlowType',value:function setAuthenticationFlowType(






authenticationFlowType){
this.authenticationFlowType=authenticationFlowType;
}},{key:'initiateAuth',value:function initiateAuth(












authDetails,callback){var _this=this;
var authParameters=authDetails.getAuthParameters();
authParameters.USERNAME=this.username;

this.client.makeUnauthenticatedRequest('initiateAuth',{
AuthFlow:'CUSTOM_AUTH',
ClientId:this.pool.getClientId(),
AuthParameters:authParameters,
ClientMetadata:authDetails.getValidationData()},
function(err,data){
if(err){
return callback.onFailure(err);
}
var challengeName=data.ChallengeName;
var challengeParameters=data.ChallengeParameters;

if(challengeName==='CUSTOM_CHALLENGE'){
_this.Session=data.Session;
return callback.customChallenge(challengeParameters);
}
_this.signInUserSession=_this.getCognitoUserSession(data.AuthenticationResult);
_this.cacheTokens();
return callback.onSuccess(_this.signInUserSession);
});
}},{key:'authenticateUser',value:function authenticateUser(
















authDetails,callback){var _this2=this;
var authenticationHelper=new _AuthenticationHelper2.default(
this.pool.getUserPoolId().split('_')[1]);
var dateHelper=new _DateHelper2.default();

var serverBValue=void 0;
var salt=void 0;
var authParameters={};

if(this.deviceKey!=null){
authParameters.DEVICE_KEY=this.deviceKey;
}

authParameters.USERNAME=this.username;
authParameters.SRP_A=authenticationHelper.getLargeAValue().toString(16);

if(this.authenticationFlowType==='CUSTOM_AUTH'){
authParameters.CHALLENGE_NAME='SRP_A';
}

this.client.makeUnauthenticatedRequest('initiateAuth',{
AuthFlow:this.authenticationFlowType,
ClientId:this.pool.getClientId(),
AuthParameters:authParameters,
ClientMetadata:authDetails.getValidationData()},
function(err,data){
if(err){
return callback.onFailure(err);
}

var challengeParameters=data.ChallengeParameters;

_this2.username=challengeParameters.USER_ID_FOR_SRP;
serverBValue=new _BigInteger2.default(challengeParameters.SRP_B,16);
salt=new _BigInteger2.default(challengeParameters.SALT,16);
_this2.getCachedDeviceKeyAndPassword();

var hkdf=authenticationHelper.getPasswordAuthenticationKey(
_this2.username,
authDetails.getPassword(),
serverBValue,
salt);

var dateNow=dateHelper.getNowString();

var signatureString=_awsSdkReactNative.util.crypto.hmac(hkdf,_awsSdkReactNative.util.buffer.concat([
new _awsSdkReactNative.util.Buffer(_this2.pool.getUserPoolId().split('_')[1],'utf8'),
new _awsSdkReactNative.util.Buffer(_this2.username,'utf8'),
new _awsSdkReactNative.util.Buffer(challengeParameters.SECRET_BLOCK,'base64'),
new _awsSdkReactNative.util.Buffer(dateNow,'utf8')]),
'base64','sha256');

var challengeResponses={};

challengeResponses.USERNAME=_this2.username;
challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK=challengeParameters.SECRET_BLOCK;
challengeResponses.TIMESTAMP=dateNow;
challengeResponses.PASSWORD_CLAIM_SIGNATURE=signatureString;

if(_this2.deviceKey!=null){
challengeResponses.DEVICE_KEY=_this2.deviceKey;
}

var respondToAuthChallenge=function respondToAuthChallenge(challenge,challengeCallback){return(
_this2.client.makeUnauthenticatedRequest('respondToAuthChallenge',challenge,
function(errChallenge,dataChallenge){
if(errChallenge&&errChallenge.code==='ResourceNotFoundException'&&
errChallenge.message.toLowerCase().indexOf('device')!==-1){
challengeResponses.DEVICE_KEY=null;
_this2.deviceKey=null;
_this2.randomPassword=null;
_this2.deviceGroupKey=null;
_this2.clearCachedDeviceKeyAndPassword();
return respondToAuthChallenge(challenge,challengeCallback);
}
return challengeCallback(errChallenge,dataChallenge);
}));};

respondToAuthChallenge({
ChallengeName:'PASSWORD_VERIFIER',
ClientId:_this2.pool.getClientId(),
ChallengeResponses:challengeResponses,
Session:data.Session},
function(errAuthenticate,dataAuthenticate){
if(errAuthenticate){
return callback.onFailure(errAuthenticate);
}

var challengeName=dataAuthenticate.ChallengeName;
if(challengeName==='NEW_PASSWORD_REQUIRED'){
_this2.Session=dataAuthenticate.Session;
var userAttributes=null;
var rawRequiredAttributes=null;
var requiredAttributes=[];
var userAttributesPrefix=authenticationHelper.
getNewPasswordRequiredChallengeUserAttributePrefix();

if(dataAuthenticate.ChallengeParameters){
userAttributes=JSON.parse(
dataAuthenticate.ChallengeParameters.userAttributes);
rawRequiredAttributes=JSON.parse(
dataAuthenticate.ChallengeParameters.requiredAttributes);
}

if(rawRequiredAttributes){
for(var i=0;i<rawRequiredAttributes.length;i++){
requiredAttributes[i]=rawRequiredAttributes[i].substr(userAttributesPrefix.length);
}
}
return callback.newPasswordRequired(userAttributes,requiredAttributes);
}
return _this2.authenticateUserInternal(dataAuthenticate,authenticationHelper,callback);
});
return undefined;
});
}},{key:'authenticateUserInternal',value:function authenticateUserInternal(









dataAuthenticate,authenticationHelper,callback){var _this3=this;
var challengeName=dataAuthenticate.ChallengeName;
var challengeParameters=dataAuthenticate.ChallengeParameters;

if(challengeName==='SMS_MFA'){
this.Session=dataAuthenticate.Session;
return callback.mfaRequired(challengeName,challengeParameters);
}

if(challengeName==='CUSTOM_CHALLENGE'){
this.Session=dataAuthenticate.Session;
return callback.customChallenge(challengeParameters);
}

if(challengeName==='DEVICE_SRP_AUTH'){
this.getDeviceResponse(callback);
return undefined;
}

this.signInUserSession=this.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
this.cacheTokens();

var newDeviceMetadata=dataAuthenticate.AuthenticationResult.NewDeviceMetadata;
if(newDeviceMetadata==null){
return callback.onSuccess(this.signInUserSession);
}

authenticationHelper.generateHashDevice(
dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey,
dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey);

var deviceSecretVerifierConfig={
Salt:new _awsSdkReactNative.util.Buffer(
authenticationHelper.getSaltDevices(),'hex').
toString('base64'),
PasswordVerifier:new _awsSdkReactNative.util.Buffer(
authenticationHelper.getVerifierDevices(),'hex').
toString('base64')};


this.verifierDevices=deviceSecretVerifierConfig.PasswordVerifier;
this.deviceGroupKey=newDeviceMetadata.DeviceGroupKey;
this.randomPassword=authenticationHelper.getRandomPassword();

this.client.makeUnauthenticatedRequest('confirmDevice',{
DeviceKey:newDeviceMetadata.DeviceKey,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
DeviceSecretVerifierConfig:deviceSecretVerifierConfig,
DeviceName:navigator.userAgent},
function(errConfirm,dataConfirm){
if(errConfirm){
return callback.onFailure(errConfirm);
}

_this3.deviceKey=dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
_this3.cacheDeviceKeyAndPassword();
if(dataConfirm.UserConfirmationNecessary===true){
return callback.onSuccess(
_this3.signInUserSession,dataConfirm.UserConfirmationNecessary);
}
return callback.onSuccess(_this3.signInUserSession);
});
return undefined;
}},{key:'completeNewPasswordChallenge',value:function completeNewPasswordChallenge(















newPassword,requiredAttributeData,callback){var _this4=this;
if(!newPassword){
return callback.onFailure(new Error('New password is required.'));
}
var authenticationHelper=new _AuthenticationHelper2.default(
this.pool.getUserPoolId().split('_')[1]);
var userAttributesPrefix=authenticationHelper.
getNewPasswordRequiredChallengeUserAttributePrefix();

var finalUserAttributes={};
if(requiredAttributeData){
Object.keys(requiredAttributeData).forEach(function(key){
finalUserAttributes[userAttributesPrefix+key]=requiredAttributeData[key];
});
}

finalUserAttributes.NEW_PASSWORD=newPassword;
finalUserAttributes.USERNAME=this.username;
this.client.makeUnauthenticatedRequest('respondToAuthChallenge',{
ChallengeName:'NEW_PASSWORD_REQUIRED',
ClientId:this.pool.getClientId(),
ChallengeResponses:finalUserAttributes,
Session:this.Session},
function(errAuthenticate,dataAuthenticate){
if(errAuthenticate){
return callback.onFailure(errAuthenticate);
}
return _this4.authenticateUserInternal(dataAuthenticate,authenticationHelper,callback);
});
return undefined;
}},{key:'getDeviceResponse',value:function getDeviceResponse(











callback){var _this5=this;
var authenticationHelper=new _AuthenticationHelper2.default(
this.deviceGroupKey);
var dateHelper=new _DateHelper2.default();

var authParameters={};

authParameters.USERNAME=this.username;
authParameters.DEVICE_KEY=this.deviceKey;
authParameters.SRP_A=authenticationHelper.getLargeAValue().toString(16);

this.client.makeUnauthenticatedRequest('respondToAuthChallenge',{
ChallengeName:'DEVICE_SRP_AUTH',
ClientId:this.pool.getClientId(),
ChallengeResponses:authParameters},
function(err,data){
if(err){
return callback.onFailure(err);
}

var challengeParameters=data.ChallengeParameters;

var serverBValue=new _BigInteger2.default(challengeParameters.SRP_B,16);
var salt=new _BigInteger2.default(challengeParameters.SALT,16);

var hkdf=authenticationHelper.getPasswordAuthenticationKey(
_this5.deviceKey,
_this5.randomPassword,
serverBValue,
salt);

var dateNow=dateHelper.getNowString();

var signatureString=_awsSdkReactNative.util.crypto.hmac(hkdf,_awsSdkReactNative.util.buffer.concat([
new _awsSdkReactNative.util.Buffer(_this5.deviceGroupKey,'utf8'),
new _awsSdkReactNative.util.Buffer(_this5.deviceKey,'utf8'),
new _awsSdkReactNative.util.Buffer(challengeParameters.SECRET_BLOCK,'base64'),
new _awsSdkReactNative.util.Buffer(dateNow,'utf8')]),
'base64','sha256');

var challengeResponses={};

challengeResponses.USERNAME=_this5.username;
challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK=challengeParameters.SECRET_BLOCK;
challengeResponses.TIMESTAMP=dateNow;
challengeResponses.PASSWORD_CLAIM_SIGNATURE=signatureString;
challengeResponses.DEVICE_KEY=_this5.deviceKey;

_this5.client.makeUnauthenticatedRequest('respondToAuthChallenge',{
ChallengeName:'DEVICE_PASSWORD_VERIFIER',
ClientId:_this5.pool.getClientId(),
ChallengeResponses:challengeResponses,
Session:data.Session},
function(errAuthenticate,dataAuthenticate){
if(errAuthenticate){
return callback.onFailure(errAuthenticate);
}

_this5.signInUserSession=_this5.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
_this5.cacheTokens();

return callback.onSuccess(_this5.signInUserSession);
});
return undefined;
});
}},{key:'confirmRegistration',value:function confirmRegistration(








confirmationCode,forceAliasCreation,callback){
this.client.makeUnauthenticatedRequest('confirmSignUp',{
ClientId:this.pool.getClientId(),
ConfirmationCode:confirmationCode,
Username:this.username,
ForceAliasCreation:forceAliasCreation},
function(err){
if(err){
return callback(err,null);
}
return callback(null,'SUCCESS');
});
}},{key:'sendCustomChallengeAnswer',value:function sendCustomChallengeAnswer(











answerChallenge,callback){var _this6=this;
var challengeResponses={};
challengeResponses.USERNAME=this.username;
challengeResponses.ANSWER=answerChallenge;

this.client.makeUnauthenticatedRequest('respondToAuthChallenge',{
ChallengeName:'CUSTOM_CHALLENGE',
ChallengeResponses:challengeResponses,
ClientId:this.pool.getClientId(),
Session:this.Session},
function(err,data){
if(err){
return callback.onFailure(err);
}

var challengeName=data.ChallengeName;

if(challengeName==='CUSTOM_CHALLENGE'){
_this6.Session=data.Session;
return callback.customChallenge(data.ChallengeParameters);
}

_this6.signInUserSession=_this6.getCognitoUserSession(data.AuthenticationResult);
_this6.cacheTokens();
return callback.onSuccess(_this6.signInUserSession);
});
}},{key:'sendMFACode',value:function sendMFACode(









confirmationCode,callback){var _this7=this;
var challengeResponses={};
challengeResponses.USERNAME=this.username;
challengeResponses.SMS_MFA_CODE=confirmationCode;

if(this.deviceKey!=null){
challengeResponses.DEVICE_KEY=this.deviceKey;
}

this.client.makeUnauthenticatedRequest('respondToAuthChallenge',{
ChallengeName:'SMS_MFA',
ChallengeResponses:challengeResponses,
ClientId:this.pool.getClientId(),
Session:this.Session},
function(err,dataAuthenticate){
if(err){
return callback.onFailure(err);
}

var challengeName=dataAuthenticate.ChallengeName;

if(challengeName==='DEVICE_SRP_AUTH'){
_this7.getDeviceResponse(callback);
return undefined;
}

_this7.signInUserSession=_this7.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
_this7.cacheTokens();

if(dataAuthenticate.AuthenticationResult.NewDeviceMetadata==null){
return callback.onSuccess(_this7.signInUserSession);
}

var authenticationHelper=new _AuthenticationHelper2.default(
_this7.pool.getUserPoolId().split('_')[1]);
authenticationHelper.generateHashDevice(
dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey,
dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey);

var deviceSecretVerifierConfig={
Salt:new _awsSdkReactNative.util.Buffer(
authenticationHelper.getSaltDevices(),'hex').
toString('base64'),
PasswordVerifier:new _awsSdkReactNative.util.Buffer(
authenticationHelper.getVerifierDevices(),'hex').
toString('base64')};


_this7.verifierDevices=deviceSecretVerifierConfig.PasswordVerifier;
_this7.deviceGroupKey=dataAuthenticate.AuthenticationResult.
NewDeviceMetadata.DeviceGroupKey;
_this7.randomPassword=authenticationHelper.getRandomPassword();

_this7.client.makeUnauthenticatedRequest('confirmDevice',{
DeviceKey:dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey,
AccessToken:_this7.signInUserSession.getAccessToken().getJwtToken(),
DeviceSecretVerifierConfig:deviceSecretVerifierConfig,
DeviceName:navigator.userAgent},
function(errConfirm,dataConfirm){
if(errConfirm){
return callback.onFailure(errConfirm);
}

_this7.deviceKey=dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
_this7.cacheDeviceKeyAndPassword();
if(dataConfirm.UserConfirmationNecessary===true){
return callback.onSuccess(
_this7.signInUserSession,
dataConfirm.UserConfirmationNecessary);
}
return callback.onSuccess(_this7.signInUserSession);
});
return undefined;
});
}},{key:'changePassword',value:function changePassword(








oldUserPassword,newUserPassword,callback){
if(!(this.signInUserSession!=null&&this.signInUserSession.isValid())){
return callback(new Error('User is not authenticated'),null);
}

this.client.makeUnauthenticatedRequest('changePassword',{
PreviousPassword:oldUserPassword,
ProposedPassword:newUserPassword,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback(err,null);
}
return callback(null,'SUCCESS');
});
return undefined;
}},{key:'enableMFA',value:function enableMFA(






callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback(new Error('User is not authenticated'),null);
}

var mfaOptions=[];
var mfaEnabled={
DeliveryMedium:'SMS',
AttributeName:'phone_number'};

mfaOptions.push(mfaEnabled);

this.client.makeUnauthenticatedRequest('setUserSettings',{
MFAOptions:mfaOptions,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback(err,null);
}
return callback(null,'SUCCESS');
});
return undefined;
}},{key:'disableMFA',value:function disableMFA(






callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback(new Error('User is not authenticated'),null);
}

var mfaOptions=[];

this.client.makeUnauthenticatedRequest('setUserSettings',{
MFAOptions:mfaOptions,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback(err,null);
}
return callback(null,'SUCCESS');
});
return undefined;
}},{key:'deleteUser',value:function deleteUser(







callback){var _this8=this;
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback(new Error('User is not authenticated'),null);
}

this.client.makeUnauthenticatedRequest('deleteUser',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback(err,null);
}
_this8.clearCachedTokens();
return callback(null,'SUCCESS');
});
return undefined;
}},{key:'updateAttributes',value:function updateAttributes(










attributes,callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback(new Error('User is not authenticated'),null);
}

this.client.makeUnauthenticatedRequest('updateUserAttributes',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
UserAttributes:attributes},
function(err){
if(err){
return callback(err,null);
}
return callback(null,'SUCCESS');
});
return undefined;
}},{key:'getUserAttributes',value:function getUserAttributes(






callback){
if(!(this.signInUserSession!=null&&this.signInUserSession.isValid())){
return callback(new Error('User is not authenticated'),null);
}

this.client.makeUnauthenticatedRequest('getUser',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err,userData){
if(err){
return callback(err,null);
}

var attributeList=[];

for(var i=0;i<userData.UserAttributes.length;i++){
var attribute={
Name:userData.UserAttributes[i].Name,
Value:userData.UserAttributes[i].Value};

var userAttribute=new _CognitoUserAttribute2.default(attribute);
attributeList.push(userAttribute);
}

return callback(null,attributeList);
});
return undefined;
}},{key:'getMFAOptions',value:function getMFAOptions(






callback){
if(!(this.signInUserSession!=null&&this.signInUserSession.isValid())){
return callback(new Error('User is not authenticated'),null);
}

this.client.makeUnauthenticatedRequest('getUser',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err,userData){
if(err){
return callback(err,null);
}

return callback(null,userData.MFAOptions);
});
return undefined;
}},{key:'deleteAttributes',value:function deleteAttributes(







attributeList,callback){
if(!(this.signInUserSession!=null&&this.signInUserSession.isValid())){
return callback(new Error('User is not authenticated'),null);
}

this.client.makeUnauthenticatedRequest('deleteUserAttributes',{
UserAttributeNames:attributeList,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback(err,null);
}
return callback(null,'SUCCESS');
});
return undefined;
}},{key:'resendConfirmationCode',value:function resendConfirmationCode(






callback){
this.client.makeUnauthenticatedRequest('resendConfirmationCode',{
ClientId:this.pool.getClientId(),
Username:this.username},
function(err,result){
if(err){
return callback(err,null);
}
return callback(null,result);
});
}},{key:'getSession',value:function getSession(








callback){
if(this.username==null){
return callback(new Error('Username is null. Cannot retrieve a new session'),null);
}

if(this.signInUserSession!=null&&this.signInUserSession.isValid()){
return callback(null,this.signInUserSession);
}

var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId()+'.'+this.username;
var idTokenKey=keyPrefix+'.idToken';
var accessTokenKey=keyPrefix+'.accessToken';
var refreshTokenKey=keyPrefix+'.refreshToken';
var clockDriftKey=keyPrefix+'.clockDrift';

if(this.storage.getItem(idTokenKey)){
var idToken=new _CognitoIdToken2.default({
IdToken:this.storage.getItem(idTokenKey)});

var accessToken=new _CognitoAccessToken2.default({
AccessToken:this.storage.getItem(accessTokenKey)});

var refreshToken=new _CognitoRefreshToken2.default({
RefreshToken:this.storage.getItem(refreshTokenKey)});

var clockDrift=parseInt(this.storage.getItem(clockDriftKey),0)||0;

var sessionData={
IdToken:idToken,
AccessToken:accessToken,
RefreshToken:refreshToken,
ClockDrift:clockDrift};

var cachedSession=new _CognitoUserSession2.default(sessionData);
if(cachedSession.isValid()){
this.signInUserSession=cachedSession;
return callback(null,this.signInUserSession);
}

if(refreshToken.getToken()==null){
return callback(new Error('Cannot retrieve a new session. Please authenticate.'),null);
}

this.refreshSession(refreshToken,callback);
}else{
callback(new Error('Local storage is missing an ID Token, Please authenticate'),null);
}

return undefined;
}},{key:'refreshSession',value:function refreshSession(








refreshToken,callback){var _this9=this;
var authParameters={};
authParameters.REFRESH_TOKEN=refreshToken.getToken();
var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId();
var lastUserKey=keyPrefix+'.LastAuthUser';

if(this.storage.getItem(lastUserKey)){
this.username=this.storage.getItem(lastUserKey);
var deviceKeyKey=keyPrefix+'.'+this.username+'.deviceKey';
this.deviceKey=this.storage.getItem(deviceKeyKey);
authParameters.DEVICE_KEY=this.deviceKey;
}

this.client.makeUnauthenticatedRequest('initiateAuth',{
ClientId:this.pool.getClientId(),
AuthFlow:'REFRESH_TOKEN_AUTH',
AuthParameters:authParameters},
function(err,authResult){
if(err){
if(err.code==='NotAuthorizedException'){
_this9.clearCachedTokens();
}
return callback(err,null);
}
if(authResult){
var authenticationResult=authResult.AuthenticationResult;
if(!Object.prototype.hasOwnProperty.call(authenticationResult,'RefreshToken')){
authenticationResult.RefreshToken=refreshToken.getToken();
}
_this9.signInUserSession=_this9.getCognitoUserSession(authenticationResult);
_this9.cacheTokens();
return callback(null,_this9.signInUserSession);
}
return undefined;
});
}},{key:'cacheTokens',value:function cacheTokens()





{
var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId();
var idTokenKey=keyPrefix+'.'+this.username+'.idToken';
var accessTokenKey=keyPrefix+'.'+this.username+'.accessToken';
var refreshTokenKey=keyPrefix+'.'+this.username+'.refreshToken';
var clockDriftKey=keyPrefix+'.'+this.username+'.clockDrift';
var lastUserKey=keyPrefix+'.LastAuthUser';

this.storage.setItem(idTokenKey,this.signInUserSession.getIdToken().getJwtToken());
this.storage.setItem(accessTokenKey,this.signInUserSession.getAccessToken().getJwtToken());
this.storage.setItem(refreshTokenKey,this.signInUserSession.getRefreshToken().getToken());
this.storage.setItem(clockDriftKey,this.signInUserSession.getClockDrift());
this.storage.setItem(lastUserKey,this.username);
}},{key:'cacheDeviceKeyAndPassword',value:function cacheDeviceKeyAndPassword()





{
var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId()+'.'+this.username;
var deviceKeyKey=keyPrefix+'.deviceKey';
var randomPasswordKey=keyPrefix+'.randomPasswordKey';
var deviceGroupKeyKey=keyPrefix+'.deviceGroupKey';

this.storage.setItem(deviceKeyKey,this.deviceKey);
this.storage.setItem(randomPasswordKey,this.randomPassword);
this.storage.setItem(deviceGroupKeyKey,this.deviceGroupKey);
}},{key:'getCachedDeviceKeyAndPassword',value:function getCachedDeviceKeyAndPassword()





{
var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId()+'.'+this.username;
var deviceKeyKey=keyPrefix+'.deviceKey';
var randomPasswordKey=keyPrefix+'.randomPasswordKey';
var deviceGroupKeyKey=keyPrefix+'.deviceGroupKey';

if(this.storage.getItem(deviceKeyKey)){
this.deviceKey=this.storage.getItem(deviceKeyKey);
this.randomPassword=this.storage.getItem(randomPasswordKey);
this.deviceGroupKey=this.storage.getItem(deviceGroupKeyKey);
}
}},{key:'clearCachedDeviceKeyAndPassword',value:function clearCachedDeviceKeyAndPassword()





{
var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId()+'.'+this.username;
var deviceKeyKey=keyPrefix+'.deviceKey';
var randomPasswordKey=keyPrefix+'.randomPasswordKey';
var deviceGroupKeyKey=keyPrefix+'.deviceGroupKey';

this.storage.removeItem(deviceKeyKey);
this.storage.removeItem(randomPasswordKey);
this.storage.removeItem(deviceGroupKeyKey);
}},{key:'clearCachedTokens',value:function clearCachedTokens()





{
var keyPrefix='CognitoIdentityServiceProvider.'+this.pool.getClientId();
var idTokenKey=keyPrefix+'.'+this.username+'.idToken';
var accessTokenKey=keyPrefix+'.'+this.username+'.accessToken';
var refreshTokenKey=keyPrefix+'.'+this.username+'.refreshToken';
var lastUserKey=keyPrefix+'.LastAuthUser';

this.storage.removeItem(idTokenKey);
this.storage.removeItem(accessTokenKey);
this.storage.removeItem(refreshTokenKey);
this.storage.removeItem(lastUserKey);
}},{key:'getCognitoUserSession',value:function getCognitoUserSession(







authResult){
var idToken=new _CognitoIdToken2.default(authResult);
var accessToken=new _CognitoAccessToken2.default(authResult);
var refreshToken=new _CognitoRefreshToken2.default(authResult);

var sessionData={
IdToken:idToken,
AccessToken:accessToken,
RefreshToken:refreshToken};


return new _CognitoUserSession2.default(sessionData);
}},{key:'forgotPassword',value:function forgotPassword(










callback){
this.client.makeUnauthenticatedRequest('forgotPassword',{
ClientId:this.pool.getClientId(),
Username:this.username},
function(err,data){
if(err){
return callback.onFailure(err);
}
if(typeof callback.inputVerificationCode==='function'){
return callback.inputVerificationCode(data);
}
return callback.onSuccess(data);
});
}},{key:'confirmPassword',value:function confirmPassword(










confirmationCode,newPassword,callback){
this.client.makeUnauthenticatedRequest('confirmForgotPassword',{
ClientId:this.pool.getClientId(),
Username:this.username,
ConfirmationCode:confirmationCode,
Password:newPassword},
function(err){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess();
});
}},{key:'getAttributeVerificationCode',value:function getAttributeVerificationCode(









attributeName,callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('getUserAttributeVerificationCode',{
AttributeName:attributeName,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err,data){
if(err){
return callback.onFailure(err);
}
if(typeof callback.inputVerificationCode==='function'){
return callback.inputVerificationCode(data);
}
return callback.onSuccess();
});
return undefined;
}},{key:'verifyAttribute',value:function verifyAttribute(










attributeName,confirmationCode,callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('verifyUserAttribute',{
AttributeName:attributeName,
Code:confirmationCode,
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess('SUCCESS');
});
return undefined;
}},{key:'getDevice',value:function getDevice(








callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('getDevice',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
DeviceKey:this.deviceKey},
function(err,data){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess(data);
});
return undefined;
}},{key:'forgetSpecificDevice',value:function forgetSpecificDevice(









deviceKey,callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('forgetDevice',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
DeviceKey:deviceKey},
function(err){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess('SUCCESS');
});
return undefined;
}},{key:'forgetDevice',value:function forgetDevice(








callback){var _this10=this;
this.forgetSpecificDevice(this.deviceKey,{
onFailure:callback.onFailure,
onSuccess:function onSuccess(result){
_this10.deviceKey=null;
_this10.deviceGroupKey=null;
_this10.randomPassword=null;
_this10.clearCachedDeviceKeyAndPassword();
return callback.onSuccess(result);
}});

}},{key:'setDeviceStatusRemembered',value:function setDeviceStatusRemembered(








callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('updateDeviceStatus',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
DeviceKey:this.deviceKey,
DeviceRememberedStatus:'remembered'},
function(err){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess('SUCCESS');
});
return undefined;
}},{key:'setDeviceStatusNotRemembered',value:function setDeviceStatusNotRemembered(








callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('updateDeviceStatus',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
DeviceKey:this.deviceKey,
DeviceRememberedStatus:'not_remembered'},
function(err){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess('SUCCESS');
});
return undefined;
}},{key:'listDevices',value:function listDevices(











limit,paginationToken,callback){
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('listDevices',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken(),
Limit:limit,
PaginationToken:paginationToken},
function(err,data){
if(err){
return callback.onFailure(err);
}
return callback.onSuccess(data);
});
return undefined;
}},{key:'globalSignOut',value:function globalSignOut(








callback){var _this11=this;
if(this.signInUserSession==null||!this.signInUserSession.isValid()){
return callback.onFailure(new Error('User is not authenticated'));
}

this.client.makeUnauthenticatedRequest('globalSignOut',{
AccessToken:this.signInUserSession.getAccessToken().getJwtToken()},
function(err){
if(err){
return callback.onFailure(err);
}
_this11.clearCachedTokens();
return callback.onSuccess('SUCCESS');
});
return undefined;
}},{key:'signOut',value:function signOut()





{
this.signInUserSession=null;
this.clearCachedTokens();
}}]);return CognitoUser;}();exports.default=CognitoUser;