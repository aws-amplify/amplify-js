Object.defineProperty(exports,"__esModule",{value:true});exports.






















getByteLength=getByteLength;exports.



















getCurrTime=getCurrTime;var defaultConfig=exports.defaultConfig={keyPrefix:'aws-amplify-cache',capacityInBytes:1048576,itemMaxSize:210000,defaultTTL:259200000,defaultPriority:5,warningThreshold:0.8,storage:window.localStorage};function getByteLength(str){var ret=0;ret=str.length;for(var i=str.length;i>=0;i-=1){var charCode=str.charCodeAt(i);if(charCode>0x7f&&charCode<=0x7ff){ret+=1;}else if(charCode>0x7ff&&charCode<=0xffff){ret+=2;}if(charCode>=0xDC00&&charCode<=0xDFFF){i-=1;}}return ret;}function getCurrTime(){
var currTime=new Date();
return currTime.getTime();
}