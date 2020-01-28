'use strict';
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
Object.defineProperty(exports, '__esModule', { value: true });
var types_1 = require('../types');
var util_1 = require('../util');
var GraphQLOperationType;
(function(GraphQLOperationType) {
	GraphQLOperationType['LIST'] = 'query';
	GraphQLOperationType['CREATE'] = 'mutation';
	GraphQLOperationType['UPDATE'] = 'mutation';
	GraphQLOperationType['DELETE'] = 'mutation';
	GraphQLOperationType['GET'] = 'query';
})(GraphQLOperationType || (GraphQLOperationType = {}));
var TransformerMutationType;
(function(TransformerMutationType) {
	TransformerMutationType['CREATE'] = 'Create';
	TransformerMutationType['UPDATE'] = 'Update';
	TransformerMutationType['DELETE'] = 'Delete';
	TransformerMutationType['GET'] = 'Get';
})(
	(TransformerMutationType =
		exports.TransformerMutationType || (exports.TransformerMutationType = {}))
);
var dummyMetadata = {
	_version: undefined,
	_lastChangedAt: undefined,
	_deleted: undefined,
};
var metadataFields = Object.keys(dummyMetadata);
function getMetadataFields() {
	return metadataFields;
}
exports.getMetadataFields = getMetadataFields;
// TODO: Ask for parent/children ids
function generateSelectionSet(modelDefinition) {
	var scalarFields = getScalarFields(modelDefinition);
	var scalarAndMetadataFields = Object.values(scalarFields)
		.map(function(_a) {
			var name = _a.name;
			return name;
		})
		.concat(getMetadataFields())
		.concat(getConnectionFields(modelDefinition));
	var result = scalarAndMetadataFields.join('\n');
	return result;
}
function getScalarFields(modelDefinition) {
	var fields = modelDefinition.fields;
	var result = Object.values(fields)
		.filter(function(field) {
			if (
				types_1.isGraphQLScalarType(field.type) ||
				types_1.isEnumFieldType(field.type)
			) {
				return true;
			}
			return false;
		})
		.reduce(function(acc, field) {
			acc[field.name] = field;
			return acc;
		}, {});
	return result;
}
function getConnectionFields(modelDefinition) {
	var result = [];
	Object.values(modelDefinition.fields)
		.filter(function(_a) {
			var association = _a.association;
			return association && Object.keys(association).length;
		})
		.forEach(function(_a) {
			var name = _a.name,
				association = _a.association;
			var connectionType = association.connectionType;
			switch (connectionType) {
				case 'HAS_ONE':
				case 'HAS_MANY':
					// Intentionally blank
					break;
				case 'BELONGS_TO':
					if (types_1.isTargetNameAssociation(association)) {
						result.push(name + ' { id _deleted }');
					}
					break;
				default:
					util_1.exhaustiveCheck(connectionType);
			}
		});
	return result;
}
function getAuthorizationRules(modelDefinition, transformerOpType) {
	// Searching for owner authorization on attributes
	var authConfig = [].concat(modelDefinition.attributes).find(function(attr) {
		return attr && attr.type === 'auth';
	});
	var _a = (authConfig || {}).properties,
		_b = (_a === void 0 ? {} : _a).rules,
		rules = _b === void 0 ? [] : _b;
	var resultRules = [];
	// Multiple rules can be declared for allow: owner
	rules.forEach(function(rule) {
		// setting defaults for backwards compatibility with old cli
		var _a = rule.identityClaim,
			identityClaim = _a === void 0 ? 'cognito:username' : _a,
			_b = rule.ownerField,
			ownerField = _b === void 0 ? 'owner' : _b,
			_c = rule.operations,
			operations = _c === void 0 ? ['create', 'update', 'delete'] : _c,
			_d = rule.provider,
			provider = _d === void 0 ? 'userPools' : _d,
			_e = rule.groupClaim,
			groupClaim = _e === void 0 ? 'cognito:groups' : _e,
			_f = rule.allow,
			authStrategy = _f === void 0 ? 'iam' : _f,
			_g = rule.groups,
			groups = _g === void 0 ? [] : _g;
		var isOperationAuthorized = operations.find(function(operation) {
			return operation.toLowerCase() === transformerOpType.toLowerCase();
		});
		if (isOperationAuthorized) {
			var rule_1 = {
				identityClaim: identityClaim,
				ownerField: ownerField,
				provider: provider,
				groupClaim: groupClaim,
				authStrategy: authStrategy,
				groups: groups,
			};
			// owner rules has least priority
			if (authStrategy === 'owner') {
				resultRules.push(rule_1);
			} else {
				resultRules.unshift(rule_1);
			}
		}
	});
	return resultRules;
}
exports.getAuthorizationRules = getAuthorizationRules;
function buildSubscriptionGraphQLOperation(
	modelDefinition,
	transformerMutationType,
	isOwnerAuthorization,
	ownerField
) {
	var selectionSet = generateSelectionSet(modelDefinition);
	var typeName = modelDefinition.name,
		pluralTypeName = modelDefinition.pluralName;
	var opName = 'on' + transformerMutationType + typeName;
	var docArgs = '';
	var opArgs = '';
	if (isOwnerAuthorization) {
		docArgs = '($' + ownerField + ': String!)';
		opArgs = '(' + ownerField + ': $' + ownerField + ')';
	}
	return [
		transformerMutationType,
		opName,
		'subscription operation' +
			docArgs +
			'{\n\t\t\t' +
			opName +
			opArgs +
			'{\n\t\t\t\t' +
			selectionSet +
			'\n\t\t\t}\n\t\t}',
	];
}
exports.buildSubscriptionGraphQLOperation = buildSubscriptionGraphQLOperation;
function buildGraphQLOperation(modelDefinition, graphQLOpType) {
	var selectionSet = generateSelectionSet(modelDefinition);
	var typeName = modelDefinition.name,
		pluralTypeName = modelDefinition.pluralName;
	var operation;
	var documentArgs = ' ';
	var operationArgs = ' ';
	var transformerMutationType;
	switch (graphQLOpType) {
		case 'LIST':
			operation = 'sync' + pluralTypeName;
			documentArgs =
				'($limit: Int, $nextToken: String, $lastSync: AWSTimestamp)';
			operationArgs =
				'(limit: $limit, nextToken: $nextToken, lastSync: $lastSync)';
			selectionSet =
				'items {\n\t\t\t\t\t\t\t' +
				selectionSet +
				'\n\t\t\t\t\t\t}\n\t\t\t\t\t\tnextToken\n\t\t\t\t\t\tstartedAt';
			break;
		case 'CREATE':
			operation = 'create' + typeName;
			documentArgs = '($input: Create' + typeName + 'Input!)';
			operationArgs = '(input: $input)';
			transformerMutationType = TransformerMutationType.CREATE;
			break;
		case 'UPDATE':
			operation = 'update' + typeName;
			documentArgs =
				'($input: Update' +
				typeName +
				'Input!, $condition: Model' +
				typeName +
				'ConditionInput)';
			operationArgs = '(input: $input, condition: $condition)';
			transformerMutationType = TransformerMutationType.UPDATE;
			break;
		case 'DELETE':
			operation = 'delete' + typeName;
			documentArgs =
				'($input: Delete' +
				typeName +
				'Input!, $condition: Model' +
				typeName +
				'ConditionInput)';
			operationArgs = '(input: $input, condition: $condition)';
			transformerMutationType = TransformerMutationType.DELETE;
			break;
		case 'GET':
			operation = 'get' + typeName;
			documentArgs = '($id: ID!)';
			operationArgs = '(id: $id)';
			transformerMutationType = TransformerMutationType.GET;
			break;
		default:
			util_1.exhaustiveCheck(graphQLOpType);
	}
	return [
		[
			transformerMutationType,
			operation,
			GraphQLOperationType[graphQLOpType] +
				' operation' +
				documentArgs +
				'{\n\t\t' +
				operation +
				operationArgs +
				'{\n\t\t\t' +
				selectionSet +
				'\n\t\t}\n\t}',
		],
	];
}
exports.buildGraphQLOperation = buildGraphQLOperation;
function createMutationInstanceFromModelOperation(
	relationships,
	modelDefinition,
	opType,
	model,
	element,
	condition,
	MutationEventConstructor,
	modelInstanceCreator,
	id
) {
	var operation;
	switch (opType) {
		case types_1.OpType.INSERT:
			operation = TransformerMutationType.CREATE;
			break;
		case types_1.OpType.UPDATE:
			operation = TransformerMutationType.UPDATE;
			break;
		case types_1.OpType.DELETE:
			operation = TransformerMutationType.DELETE;
			break;
		default:
			util_1.exhaustiveCheck(opType);
	}
	var mutationEvent = modelInstanceCreator(
		MutationEventConstructor,
		__assign(__assign({}, id ? { id: id } : {}), {
			data: JSON.stringify(element),
			modelId: element.id,
			model: model.name,
			operation: operation,
			condition: JSON.stringify(condition),
		})
	);
	return mutationEvent;
}
exports.createMutationInstanceFromModelOperation = createMutationInstanceFromModelOperation;
function predicateToGraphQLCondition(predicate) {
	var result = {};
	if (!predicate || !Array.isArray(predicate.predicates)) {
		return result;
	}
	predicate.predicates.forEach(function(p) {
		var _a;
		if (types_1.isPredicateObj(p)) {
			var field = p.field,
				operator = p.operator,
				operand = p.operand;
			if (field === 'id') {
				return;
			}
			result[field] = ((_a = {}), (_a[operator] = operand), _a);
		} else {
			result[p.type] = predicateToGraphQLCondition(p);
		}
	});
	return result;
}
exports.predicateToGraphQLCondition = predicateToGraphQLCondition;
//# sourceMappingURL=utils.js.map
