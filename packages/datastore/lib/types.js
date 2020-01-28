'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var util_1 = require('./util');
function isAssociatedWith(obj) {
	return obj && obj.associatedWith;
}
exports.isAssociatedWith = isAssociatedWith;
function isTargetNameAssociation(obj) {
	return obj && obj.targetName;
}
exports.isTargetNameAssociation = isTargetNameAssociation;
var GraphQLScalarType;
(function(GraphQLScalarType) {
	GraphQLScalarType[(GraphQLScalarType['ID'] = 0)] = 'ID';
	GraphQLScalarType[(GraphQLScalarType['String'] = 1)] = 'String';
	GraphQLScalarType[(GraphQLScalarType['Int'] = 2)] = 'Int';
	GraphQLScalarType[(GraphQLScalarType['Float'] = 3)] = 'Float';
	GraphQLScalarType[(GraphQLScalarType['Boolean'] = 4)] = 'Boolean';
	GraphQLScalarType[(GraphQLScalarType['AWSDate'] = 5)] = 'AWSDate';
	GraphQLScalarType[(GraphQLScalarType['AWSTime'] = 6)] = 'AWSTime';
	GraphQLScalarType[(GraphQLScalarType['AWSDateTime'] = 7)] = 'AWSDateTime';
	GraphQLScalarType[(GraphQLScalarType['AWSTimestamp'] = 8)] = 'AWSTimestamp';
	GraphQLScalarType[(GraphQLScalarType['AWSEmail'] = 9)] = 'AWSEmail';
	GraphQLScalarType[(GraphQLScalarType['AWSJSON'] = 10)] = 'AWSJSON';
	GraphQLScalarType[(GraphQLScalarType['AWSURL'] = 11)] = 'AWSURL';
	GraphQLScalarType[(GraphQLScalarType['AWSPhone'] = 12)] = 'AWSPhone';
	GraphQLScalarType[(GraphQLScalarType['AWSIPAddress'] = 13)] = 'AWSIPAddress';
})(
	(GraphQLScalarType =
		exports.GraphQLScalarType || (exports.GraphQLScalarType = {}))
);
(function(GraphQLScalarType) {
	function getJSType(scalar) {
		switch (scalar) {
			case 'Boolean':
				return 'boolean';
			case 'ID':
			case 'String':
			case 'AWSDate':
			case 'AWSTime':
			case 'AWSDateTime':
			case 'AWSEmail':
			case 'AWSJSON':
			case 'AWSURL':
			case 'AWSPhone':
			case 'AWSIPAddress':
				return 'string';
			case 'Int':
			case 'Float':
			case 'AWSTimestamp':
				return 'number';
			default:
				util_1.exhaustiveCheck(scalar);
		}
	}
	GraphQLScalarType.getJSType = getJSType;
})(
	(GraphQLScalarType =
		exports.GraphQLScalarType || (exports.GraphQLScalarType = {}))
);
function isGraphQLScalarType(obj) {
	return obj && GraphQLScalarType[obj] !== undefined;
}
exports.isGraphQLScalarType = isGraphQLScalarType;
function isModelFieldType(obj) {
	var modelField = 'model';
	if (obj && obj[modelField]) return true;
	return false;
}
exports.isModelFieldType = isModelFieldType;
function isEnumFieldType(obj) {
	var modelField = 'enum';
	if (obj && obj[modelField]) return true;
	return false;
}
exports.isEnumFieldType = isEnumFieldType;
//#endregion
//#region Subscription messages
var OpType;
(function(OpType) {
	OpType['INSERT'] = 'INSERT';
	OpType['UPDATE'] = 'UPDATE';
	OpType['DELETE'] = 'DELETE';
})((OpType = exports.OpType || (exports.OpType = {})));
function isPredicateObj(obj) {
	return obj && obj.field !== undefined;
}
exports.isPredicateObj = isPredicateObj;
function isPredicateGroup(obj) {
	return obj && obj.type !== undefined;
}
exports.isPredicateGroup = isPredicateGroup;
var QueryOne;
(function(QueryOne) {
	QueryOne[(QueryOne['FIRST'] = 0)] = 'FIRST';
	QueryOne[(QueryOne['LAST'] = 1)] = 'LAST';
})((QueryOne = exports.QueryOne || (exports.QueryOne = {})));
exports.DISCARD = Symbol('DISCARD');
//#endregion
//# sourceMappingURL=types.js.map
