Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();












var _Logger=require('../Common/Logger');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var logger=new _Logger.ConsoleLogger('I18nClass');var




I18nClass=function(){



function I18nClass(config){_classCallCheck(this,I18nClass);
this.configure(config);

this._lang=this._config.language;
if(!this._lang&&typeof window!=='undefined'&&window.navigator){
this._lang=window.navigator.language;
}
logger.debug('language: ',this._lang);

this._dict={};
}_createClass(I18nClass,[{key:'configure',value:function configure(






config){
logger.debug('configure I18n');
this._config=_extends(
{},
this._config,
config?config.I18n||config:null);


return this._config;
}},{key:'setLanguage',value:function setLanguage(





lang){
this._lang=lang;
}},{key:'get',value:function get(







key){var defVal=arguments.length>1&&arguments[1]!==undefined?arguments[1]:undefined;
if(!this._lang){
return typeof defVal!=='undefined'?defVal:key;
}

var lang=this._lang;
var val=this.getByLanguage(key,lang);
if(val){return val;}

if(lang.indexOf('-')>0){
val=this.getByLanguage(key,lang.split('-')[0]);
}
if(val){return val;}

return typeof defVal!=='undefined'?defVal:key;
}},{key:'getByLanguage',value:function getByLanguage(








key,language){var defVal=arguments.length>2&&arguments[2]!==undefined?arguments[2]:null;
if(!language){return defVal;}

var lang_dict=this._dict[language];
if(!lang_dict){return defVal;}

return lang_dict[key];
}},{key:'putVocabulariesForLanguage',value:function putVocabulariesForLanguage(






language,vocabularies){
var lang_dict=this._dict[language];
if(!lang_dict){lang_dict=this._dict[language]={};}
_extends(lang_dict,vocabularies);
}},{key:'putVocabularies',value:function putVocabularies(






vocabularies){var _this=this;
Object.keys(vocabularies).map(function(key){
_this.putVocabulariesForLanguage(key,vocabularies[key]);
});
}}]);return I18nClass;}();exports.default=


I18nClass;