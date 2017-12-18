Object.defineProperty(exports,"__esModule",{value:true});exports.default=undefined;












var _Common=require('../Common');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Common.ConsoleLogger('Signer');

var url=require('url'),
crypto=require('aws-sdk').util.crypto;

var encrypt=function encrypt(key,src,encoding){
return crypto.lib.createHmac('sha256',key).update(src,'utf8').digest(encoding);
};

var hash=function hash(src){
src=src||'';
return crypto.createHash('sha256').update(src,'utf8').digest('hex');
};












var canonical_headers=function canonical_headers(headers){
if(!headers||Object.keys(headers).length===0){return'';}

return Object.keys(headers).
map(function(key){
return{
key:key.toLowerCase(),
value:headers[key]?headers[key].trim().replace(/\s+/g,' '):''};

}).
sort(function(a,b){
return a.key<b.key?-1:1;
}).
map(function(item){
return item.key+':'+item.value;
}).
join('\n')+'\n';
};





var signed_headers=function signed_headers(headers){
return Object.keys(headers).
map(function(key){return key.toLowerCase();}).
sort().
join(';');
};
















var canonical_request=function canonical_request(request){
var url_info=url.parse(request.url);

return[
request.method||'/',
url_info.path,
url_info.query,
canonical_headers(request.headers),
signed_headers(request.headers),
hash(request.data)].
join('\n');
};

var parse_service_info=function parse_service_info(request){
var url_info=url.parse(request.url),
host=url_info.host;

var matched=host.match(/([^\.]+)\.(?:([^\.]*)\.)?amazonaws\.com$/),
parsed=(matched||[]).slice(1,3);

if(parsed[1]==='es'){
parsed=parsed.reverse();
}

return{
service:request.service||parsed[0],
region:request.region||parsed[1]};

};

var credential_scope=function credential_scope(d_str,region,service){
return[
d_str,
region,
service,
'aws4_request'].
join('/');
};














var string_to_sign=function string_to_sign(algorithm,canonical_request,dt_str,scope){
return[
algorithm,
dt_str,
scope,
hash(canonical_request)].
join('\n');
};














var get_signing_key=function get_signing_key(secret_key,d_str,service_info){
var k='AWS4'+secret_key,
k_date=encrypt(k,d_str),
k_region=encrypt(k_date,service_info.region),
k_service=encrypt(k_region,service_info.service),
k_signing=encrypt(k_service,'aws4_request');

return k_signing;
};

var get_signature=function get_signature(signing_key,str_to_sign){
return encrypt(signing_key,str_to_sign,'hex');
};






var get_authorization_header=function get_authorization_header(algorithm,access_key,scope,signed_headers,signature){
return[
algorithm+' '+'Credential='+access_key+'/'+scope,
'SignedHeaders='+signed_headers,
'Signature='+signature].
join(', ');
};





































var sign=function sign(request,access_info){var service_info=arguments.length>2&&arguments[2]!==undefined?arguments[2]:null;
request.headers=request.headers||{};


var dt=new Date(),
dt_str=dt.toISOString().replace(/[:\-]|\.\d{3}/g,''),
d_str=dt_str.substr(0,8),
algorithm='AWS4-HMAC-SHA256';

var url_info=url.parse(request.url);
request.headers['host']=url_info.host;
request.headers['x-amz-date']=dt_str;
if(access_info.session_token){
request.headers['X-Amz-Security-Token']=access_info.session_token;
}


var request_str=canonical_request(request);


var service_info=service_info||parse_service_info(request),
scope=credential_scope(
d_str,
service_info.region,
service_info.service),

str_to_sign=string_to_sign(
algorithm,
request_str,
dt_str,
scope);



var signing_key=get_signing_key(
access_info.secret_key,
d_str,
service_info),

signature=get_signature(signing_key,str_to_sign);


var authorization_header=get_authorization_header(
algorithm,
access_info.access_key,
scope,
signed_headers(request.headers),
signature);

request.headers['Authorization']=authorization_header;

return request;
};var







Signer=function Signer(){_classCallCheck(this,Signer);};exports.default=Signer;;
Signer.sign=sign;