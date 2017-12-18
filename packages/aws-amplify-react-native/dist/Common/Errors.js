Object.defineProperty(exports,"__esModule",{value:true});exports.












missingConfig=missingConfig;exports.
invalidParameter=invalidParameter;function missingConfig(name){return new Error('Missing config value of '+name);}function invalidParameter(name){return new Error('Invalid parameter value of '+name);}