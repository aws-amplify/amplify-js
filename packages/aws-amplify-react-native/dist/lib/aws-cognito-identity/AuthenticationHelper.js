Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();
















var _awsSdkReactNative=require('aws-sdk/dist/aws-sdk-react-native');

var _BigInteger=require('./BigInteger');var _BigInteger2=_interopRequireDefault(_BigInteger);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var initN='FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1'+
'29024E088A67CC74020BBEA63B139B22514A08798E3404DD'+
'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245'+
'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED'+
'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D'+
'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F'+
'83655D23DCA3AD961C62F356208552BB9ED529077096966D'+
'670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B'+
'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9'+
'DE2BCBF6955817183995497CEA956AE515D2261898FA0510'+
'15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64'+
'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7'+
'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B'+
'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C'+
'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31'+
'43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

var newPasswordRequiredChallengeUserAttributePrefix='userAttributes.';var


AuthenticationHelper=function(){




function AuthenticationHelper(PoolName){_classCallCheck(this,AuthenticationHelper);
this.N=new _BigInteger2.default(initN,16);
this.g=new _BigInteger2.default('2',16);
this.k=new _BigInteger2.default(this.hexHash('00'+this.N.toString(16)+'0'+this.g.toString(16)),16);

this.smallAValue=this.generateRandomSmallA();
this.largeAValue=this.calculateA(this.smallAValue);

this.infoBits=new _awsSdkReactNative.util.Buffer('Caldera Derived Key','utf8');

this.poolName=PoolName;
}_createClass(AuthenticationHelper,[{key:'getSmallAValue',value:function getSmallAValue()




{
return this.smallAValue;
}},{key:'getLargeAValue',value:function getLargeAValue()




{
return this.largeAValue;
}},{key:'generateRandomSmallA',value:function generateRandomSmallA()






{
var hexRandom=_awsSdkReactNative.util.crypto.lib.randomBytes(128).toString('hex');

var randomBigInt=new _BigInteger2.default(hexRandom,16);
var smallABigInt=randomBigInt.mod(this.N);

return smallABigInt;
}},{key:'generateRandomString',value:function generateRandomString()






{
return _awsSdkReactNative.util.crypto.lib.randomBytes(40).toString('base64');
}},{key:'getRandomPassword',value:function getRandomPassword()




{
return this.randomPassword;
}},{key:'getSaltDevices',value:function getSaltDevices()




{
return this.SaltToHashDevices;
}},{key:'getVerifierDevices',value:function getVerifierDevices()




{
return this.verifierDevices;
}},{key:'generateHashDevice',value:function generateHashDevice(







deviceGroupKey,username){
this.randomPassword=this.generateRandomString();
var combinedString=''+deviceGroupKey+username+':'+this.randomPassword;
var hashedString=this.hash(combinedString);

var hexRandom=_awsSdkReactNative.util.crypto.lib.randomBytes(16).toString('hex');
this.SaltToHashDevices=this.padHex(new _BigInteger2.default(hexRandom,16));

var verifierDevicesNotPadded=this.g.modPow(
new _BigInteger2.default(this.hexHash(this.SaltToHashDevices+hashedString),16),
this.N);

this.verifierDevices=this.padHex(verifierDevicesNotPadded);
}},{key:'calculateA',value:function calculateA(








a){
var A=this.g.modPow(a,this.N);

if(A.mod(this.N).equals(_BigInteger2.default.ZERO)){
throw new Error('Illegal paramater. A mod N cannot be 0.');
}
return A;
}},{key:'calculateU',value:function calculateU(








A,B){
this.UHexHash=this.hexHash(this.padHex(A)+this.padHex(B));
var finalU=new _BigInteger2.default(this.UHexHash,16);

return finalU;
}},{key:'hash',value:function hash(







buf){
var hashHex=_awsSdkReactNative.util.crypto.sha256(buf,'hex');
return new Array(64-hashHex.length).join('0')+hashHex;
}},{key:'hexHash',value:function hexHash(







hexStr){
return this.hash(new _awsSdkReactNative.util.Buffer(hexStr,'hex'));
}},{key:'computehkdf',value:function computehkdf(








ikm,salt){
var prk=_awsSdkReactNative.util.crypto.hmac(salt,ikm,'buffer','sha256');
var infoBitsUpdate=_awsSdkReactNative.util.buffer.concat([
this.infoBits,
new _awsSdkReactNative.util.Buffer(String.fromCharCode(1),'utf8')]);

var hmac=_awsSdkReactNative.util.crypto.hmac(prk,infoBitsUpdate,'buffer','sha256');
return hmac.slice(0,16);
}},{key:'getPasswordAuthenticationKey',value:function getPasswordAuthenticationKey(









username,password,serverBValue,salt){
if(serverBValue.mod(this.N).equals(_BigInteger2.default.ZERO)){
throw new Error('B cannot be zero.');
}

this.UValue=this.calculateU(this.largeAValue,serverBValue);

if(this.UValue.equals(_BigInteger2.default.ZERO)){
throw new Error('U cannot be zero.');
}

var usernamePassword=''+this.poolName+username+':'+password;
var usernamePasswordHash=this.hash(usernamePassword);

var xValue=new _BigInteger2.default(this.hexHash(this.padHex(salt)+usernamePasswordHash),16);

var gModPowXN=this.g.modPow(xValue,this.N);
var intValue2=serverBValue.subtract(this.k.multiply(gModPowXN));
var sValue=intValue2.modPow(
this.smallAValue.add(this.UValue.multiply(xValue)),
this.N).
mod(this.N);

var hkdf=this.computehkdf(
new _awsSdkReactNative.util.Buffer(this.padHex(sValue),'hex'),
new _awsSdkReactNative.util.Buffer(this.padHex(this.UValue.toString(16)),'hex'));

return hkdf;
}},{key:'getNewPasswordRequiredChallengeUserAttributePrefix',value:function getNewPasswordRequiredChallengeUserAttributePrefix()





{
return newPasswordRequiredChallengeUserAttributePrefix;
}},{key:'padHex',value:function padHex(






bigInt){
var hashStr=bigInt.toString(16);
if(hashStr.length%2===1){
hashStr='0'+hashStr;
}else if('89ABCDEFabcdef'.indexOf(hashStr[0])!==-1){
hashStr='00'+hashStr;
}
return hashStr;
}}]);return AuthenticationHelper;}();exports.default=AuthenticationHelper;