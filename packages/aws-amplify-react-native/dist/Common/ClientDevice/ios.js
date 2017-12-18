Object.defineProperty(exports,"__esModule",{value:true});exports.clientInfo=undefined;












var _reactNative=require('react-native');
var _Logger=require('../Logger');

var logger=new _Logger.ConsoleLogger('DeviceInfo');

var clientInfo=exports.clientInfo=function clientInfo(){
var dim=_reactNative.Dimensions.get('screen');
logger.debug(_reactNative.Platform,dim);

var OS='ios';var
Version=_reactNative.Platform.Version;var _dimToMake=

dimToMake(dim),make=_dimToMake.make,model=_dimToMake.model;

return{
platform:OS,
version:String(Version),
appVersion:[OS,String(Version)].join('/'),
make:make,
model:model};

};

function dimToMake(dim){var
height=dim.height,width=dim.width;
if(height<width){var tmp=height;height=width;width=tmp;}

if(width===320&&height===568){return{make:'iPhone',model:'iPhone 5'};}
if(width===375&&height===667){return{make:'iPhone',model:'iPhone 6/7/8'};}
if(width===414&&height===736){return{make:'iPhone',model:'iPhone 6/7/8 plus'};}
if(width===375&&height===812){return{make:'iPhone',model:'iPhone X'};}
if(width===768&&height===1024){return{make:'iPad',model:'iPad Mini/Air'};}
if(width===834&&height===1112){return{make:'iPad',model:'iPad Pro'};}
if(width===1024&&height===1366){return{make:'iPad',model:'iPad Pro'};}
if(width===272&&height===340){return{make:'Watch',model:'Watch 38mm'};}
if(width===312&&height===390){return{make:'Watch',model:'Watch 42mm'};}

return{make:null,model:null};
}