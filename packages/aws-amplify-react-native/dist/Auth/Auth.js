Object.defineProperty(exports,"__esModule",{value:true});var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[typeof Symbol==='function'?Symbol.iterator:'@@iterator'](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"])_i["return"]();}finally{if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if((typeof Symbol==='function'?Symbol.iterator:'@@iterator')in Object(arr)){return sliceIterator(arr,i);}else{throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Common=require('../Common');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}







var logger=new _Common.ConsoleLogger('AuthClass');var


CognitoIdentityCredentials=_Common.AWS.CognitoIdentityCredentials;var



CognitoUserPool=_Common.Cognito.CognitoUserPool,
CognitoUserAttribute=_Common.Cognito.CognitoUserAttribute,
CognitoUser=_Common.Cognito.CognitoUser,
AuthenticationDetails=_Common.Cognito.AuthenticationDetails;


var dispatchCredentialsChange=function dispatchCredentialsChange(credentials){
_Common.Hub.dispatch('credentials',credentials,'Auth');
};

var dispatchAuthEvent=function dispatchAuthEvent(event,data){
_Common.Hub.dispatch('auth',{
event:event,
data:data},
'Auth');
};var




AuthClass=function(){



function AuthClass(config){_classCallCheck(this,AuthClass);
logger.debug('Auth Config',config);
this.configure(config);

if(_Common.AWS.config){
_Common.AWS.config.update({customUserAgent:_Common.Constants.userAgent});
}else{
logger.warn('No AWS.config');
}
}_createClass(AuthClass,[{key:'configure',value:function configure(






config){
logger.debug('configure Auth');
var conf=config?config.Auth||config:{};

if(conf['aws_cognito_identity_pool_id']){
conf={
userPoolId:config['aws_user_pools_id'],
userPoolWebClientId:config['aws_user_pools_web_client_id'],
region:config['aws_cognito_region'],
identityPoolId:config['aws_cognito_identity_pool_id']};

}

this._config=_extends(
{},
this._config,
conf);var _config=


this._config,userPoolId=_config.userPoolId,userPoolWebClientId=_config.userPoolWebClientId;
if(userPoolId){
this.userPool=new CognitoUserPool({
UserPoolId:userPoolId,
ClientId:userPoolWebClientId});

}

return this._config;
}},{key:'signUp',value:function signUp(









username,password,email,phone_number){var _this=this;
if(!this.userPool){return Promise.reject('No userPool');}
if(!username){return Promise.reject('Username cannot be empty');}
if(!password){return Promise.reject('Password cannot be empty');}

var attributes=[];
if(email){attributes.push({Name:'email',Value:email});}
if(phone_number){attributes.push({Name:'phone_number',Value:phone_number});}

return new Promise(function(resolve,reject){
_this.userPool.signUp(username,password,attributes,null,function(err,data){
if(err){reject(err);}else{resolve(data);}
});
});
}},{key:'confirmSignUp',value:function confirmSignUp(







username,code){
if(!this.userPool){return Promise.reject('No userPool');}
if(!username){return Promise.reject('Username cannot be empty');}
if(!code){return Promise.reject('Code cannot be empty');}

var user=new CognitoUser({
Username:username,
Pool:this.userPool});

return new Promise(function(resolve,reject){
user.confirmRegistration(code,true,function(err,data){
if(err){reject(err);}else{resolve(data);}
});
});
}},{key:'resendSignUp',value:function resendSignUp(






username){
if(!this.userPool){return Promise.reject('No userPool');}
if(!username){return Promise.reject('Username cannot be empty');}

var user=new CognitoUser({
Username:username,
Pool:this.userPool});

return new Promise(function(resolve,reject){
user.resendConfirmationCode(function(err,data){
if(err){reject(err);}else{resolve(data);}
});
});
}},{key:'signIn',value:function signIn(







username,password){
if(!this.userPool){return Promise.reject('No userPool');}
if(!username){return Promise.reject('Username cannot be empty');}
if(!password){return Promise.reject('Password cannot be empty');}var _config2=

this._config,userPoolId=_config2.userPoolId,userPoolWebClientId=_config2.userPoolWebClientId;
var pool=new CognitoUserPool({
UserPoolId:userPoolId,
ClientId:userPoolWebClientId});

var user=new CognitoUser({
Username:username,
Pool:this.userPool});

var authDetails=new AuthenticationDetails({
Username:username,
Password:password});

logger.debug(authDetails);
var _auth=this;
return new Promise(function(resolve,reject){
user.authenticateUser(authDetails,{
onSuccess:function onSuccess(session){
_auth.currentCredentials().
then(function(credentials){
var creds=_auth.essentialCredentials(credentials);
dispatchCredentialsChange(creds);
}).
catch(function(err){return logger.error('get credentials failed',err);});
resolve(user);
},
onFailure:function onFailure(err){
logger.error('signIn failure',err);
reject(err);
},
mfaRequired:function mfaRequired(challengeName,challengeParam){
logger.debug('signIn MFA required');
user['challengeName']=challengeName;
user['challengeParam']=challengeParam;
resolve(user);
},
newPasswordRequired:function newPasswordRequired(userAttributes,requiredAttributes){
logger.debug('signIn new password');
user['challengeName']='NEW_PASSWORD_REQUIRED';
user['challengeParam']={
userAttributes:userAttributes,
requiredAttributes:requiredAttributes};

resolve(user);
}});

});
}},{key:'confirmSignIn',value:function confirmSignIn(







user,code){
if(!code){return Promise.reject('Code cannot be empty');}

var _auth=this;
return new Promise(function(resolve,reject){
user.sendMFACode(code,{
onSuccess:function onSuccess(session){
_auth.currentCredentials().
then(function(credentials){
var creds=_auth.essentialCredentials(credentials);
dispatchCredentialsChange(creds);
}).
catch(function(err){return logger.error('get credentials failed',err);});
resolve(user);
},
onFailure:function onFailure(err){
logger.error('confirm signIn failure',err);
reject(err);
}});

});
}},{key:'completeNewPassword',value:function completeNewPassword(

user,password,requiredAttributes){
if(!password){return Promise.reject('Password cannot be empty');}

return new Promise(function(resolve,reject){
user.completeNewPasswordChallenge(password,requiredAttributes,{
onSuccess:function onSuccess(session){
logger.debug(session);
dispatchAuthEvent('signIn',user);
resolve(user);
},
onFailure:function onFailure(err){
logger.debug('completeNewPassword failure',err);
reject(err);
},
mfaRequired:function mfaRequired(challengeName,challengeParam){
logger.debug('signIn MFA required');
user['challengeName']=challengeName;
user['challengeParam']=challengeParam;
resolve(user);
}});

});
}},{key:'userAttributes',value:function userAttributes(






user){
var _auth=this;
return this.userSession(user).
then(function(session){
return new Promise(function(resolve,reject){
user.getUserAttributes(function(err,attributes){
if(err){reject(err);}else{resolve(_auth._attributesToObject(attributes));}
});
});
});
}},{key:'verifiedContact',value:function verifiedContact(

user){
var that=this;
return this.userAttributes(user).
then(function(attrs){
var verified={};
var unverified={};
if(attrs.email){
if(attrs.email_verified){
verified.email=attrs.email;
}else{
unverified.email=attrs.email;
}
}
if(attrs.phone_number){
if(attrs.phone_number_verified){
verified.phone_number=attrs.phone_number;
}else{
unverified.phone_number=attrs.phone_number;
}
}
return{verified:verified,unverified:unverified};
});
}},{key:'currentUser',value:function currentUser()





{
if(!this.userPool){return Promise.reject('No userPool');}

var user=this.userPool.getCurrentUser();
return user?Promise.resolve(user):Promise.reject('UserPool doesnot have current user');
}},{key:'currentAuthenticatedUser',value:function currentAuthenticatedUser()





{
if(!this.userPool){return Promise.reject('No userPool');}

var user=this.userPool.getCurrentUser();
if(!user){return Promise.reject('No current user');}

return new Promise(function(resolve,reject){
user.getSession(function(err,session){
if(err){reject(err);}else{resolve(user);}
});
});
}},{key:'currentUserSession',value:function currentUserSession()





{
if(!this.userPool){return Promise.reject('No userPool');}

var user=this.userPool.getCurrentUser();
if(!user){return Promise.reject('No current user');}
return this.userSession(user);
}},{key:'currentSession',value:function currentSession()





{
return this.currentUserSession();
}},{key:'userSession',value:function userSession(






user){
return new Promise(function(resolve,reject){
user.getSession(function(err,session){
if(err){reject(err);}else{resolve(session);}
});
});
}},{key:'currentUserCredentials',value:function currentUserCredentials()





{var _this2=this;
return this.currentUserSession().
then(function(session){
logger.debug('current session',session);
return new Promise(function(resolve,reject){
var credentials=_this2.sessionToCredentials(session);
credentials.get(function(err){
if(err){reject(err);}else{resolve(credentials);}
});
});
});
}},{key:'guestCredentials',value:function guestCredentials()





{
var credentials=this.noSessionCredentials();
return new Promise(function(resolve,reject){
credentials.get(function(err){
if(err){reject(err);}else{resolve(credentials);}
});
});
}},{key:'currentCredentials',value:function currentCredentials()





{
var that=this;
return this.currentUserCredentials().
then(function(credentials){
credentials.authenticated=true;
return credentials;
}).
catch(function(err){
logger.debug('No current user credentials, load guest credentials');
return that.guestCredentials().
then(function(credentials){
credentials.authenticated=false;
return credentials;
});
});
}},{key:'verifyUserAttribute',value:function verifyUserAttribute(







user,attr){
return new Promise(function(resolve,reject){
user.getAttributeVerificationCode(attr,{
onSuccess:function onSuccess(data){resolve(data);},
onFailure:function onFailure(err){reject(err);}});

});
}},{key:'verifyUserAttributeSubmit',value:function verifyUserAttributeSubmit(








user,attr,code){
return new Promise(function(resolve,reject){
user.verifyAttribute(attr,code,{
onSuccess:function onSuccess(data){resolve(data);},
onFailure:function onFailure(err){reject(err);}});

});
}},{key:'signOut',value:function signOut()





{
if(!this.userPool){return Promise.reject('No userPool');}

var user=this.userPool.getCurrentUser();
if(!user){return Promise.resolve();}

var _auth=this;
return new Promise(function(resolve,reject){
user.signOut();
_auth.currentCredentials().
then(function(credentials){return dispatchCredentialsChange(credentials);}).
catch(function(err){return logger.error('get credentials failed',err);});
resolve();
});
}},{key:'forgotPassword',value:function forgotPassword(






username){
if(!this.userPool){return Promise.reject('No userPool');}
if(!username){return Promise.reject('Username cannot be empty');}

var user=new CognitoUser({
Username:username,
Pool:this.userPool});

return new Promise(function(resolve,reject){
user.forgotPassword({
onSuccess:function onSuccess(){resolve();},
onFailure:function onFailure(err){
logger.error(err);
reject(err);
},
inputVerificationCode:function inputVerificationCode(data){
resolve(data);
}});

});
}},{key:'forgotPasswordSubmit',value:function forgotPasswordSubmit(








username,code,password){
if(!this.userPool){return Promise.reject('No userPool');}
if(!username){return Promise.reject('Username cannot be empty');}
if(!code){return Promise.reject('Code cannot be empty');}
if(!password){return Promise.reject('Password cannot be empty');}

var user=new CognitoUser({
Username:username,
Pool:this.userPool});

return new Promise(function(resolve,reject){
user.confirmPassword(code,password,{
onSuccess:function onSuccess(){resolve();},
onFailure:function onFailure(err){reject(err);}});

});
}},{key:'verifyCurrentUserAttribute',value:function verifyCurrentUserAttribute(






attr){
var _auth=this;
return _auth.currentAuthenticatedUser().
then(function(user){return _auth.verifyUserAttribute(user,attr);});
}},{key:'verifyCurrentUserAttributeSubmit',value:function verifyCurrentUserAttributeSubmit(







attr,code){
if(!code){return Promise.reject('Code cannot be empty');}

var _auth=this;
return _auth.currentAuthenticatedUser().
then(function(user){return _auth.verifyUserAttributeSubmit(user,attr,code);});
}},{key:'currentUserInfo',value:function currentUserInfo(){var user,_ref,_ref2,attributes,credentials,info;return regeneratorRuntime.async(function currentUserInfo$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(







this.currentAuthenticatedUser().
catch(function(err){return logger.debug(err);}));case 2:user=_context.sent;if(
user){_context.next=5;break;}return _context.abrupt('return',null);case 5:_context.next=7;return regeneratorRuntime.awrap(

Promise.all([
this.userAttributes(user),
this.currentUserCredentials()]).
catch(function(err){
logger.debug('currentUserInfo error',err);
return[{},{}];
}));case 7:_ref=_context.sent;_ref2=_slicedToArray(_ref,2);attributes=_ref2[0];credentials=_ref2[1];

info={
username:user.username,
id:credentials.identityId,
email:attributes.email,
phone_number:attributes.phone_number};

logger.debug('user info',info);return _context.abrupt('return',
info);case 14:case'end':return _context.stop();}}},null,this);}},{key:'noSessionCredentials',value:function noSessionCredentials()





{
var credentials=new CognitoIdentityCredentials({
IdentityPoolId:this._config.identityPoolId},
{
region:this._config.region});


credentials.params.IdentityId=null;
return credentials;
}},{key:'sessionToCredentials',value:function sessionToCredentials(






session){
var idToken=session.getIdToken().getJwtToken();var _config3=
this._config,region=_config3.region,userPoolId=_config3.userPoolId,identityPoolId=_config3.identityPoolId;
var key='cognito-idp.'+region+'.amazonaws.com/'+userPoolId;
var logins={};
logins[key]=idToken;
return new CognitoIdentityCredentials({
IdentityPoolId:identityPoolId,
Logins:logins},
{
region:this._config.region});

}},{key:'essentialCredentials',value:function essentialCredentials(






credentials){
return{
accessKeyId:credentials.accessKeyId,
sessionToken:credentials.sessionToken,
secretAccessKey:credentials.secretAccessKey,
identityId:credentials.identityId,
authenticated:credentials.authenticated};

}},{key:'_attributesToObject',value:function _attributesToObject(




attributes){
var obj={};
attributes.map(function(attr){
obj[attr.Name]=attr.Value==='false'?false:attr.Value;
});
return obj;
}}]);return AuthClass;}();exports.default=


AuthClass;