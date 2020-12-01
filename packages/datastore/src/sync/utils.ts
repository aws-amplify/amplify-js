import { ModelInstanceCreator } from '../datastore/datastore';
import {
	AuthorizationRule,
	GraphQLCondition,
	GraphQLFilter,
	GraphQLField,
	isEnumFieldType,
	isGraphQLScalarType,
	isPredicateObj,
	isSchemaModel,
	isTargetNameAssociation,
	isNonModelFieldType,
	ModelFields,
	ModelInstanceMetadata,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	PredicatesGroup,
	RelationshipType,
	SchemaModel,
	SchemaNamespace,
	SchemaNonModel,
} from '../types';
import { exhaustiveCheck } from '../util';
import { MutationEvent } from './';

enum GraphQLOperationType {
	LIST = 'query',
	CREATE = 'mutation',
	UPDATE = 'mutation',
	DELETE = 'mutation',
	GET = 'query',
}

export enum TransformerMutationType {
	CREATE = 'Create',
	UPDATE = 'Update',
	DELETE = 'Delete',
	GET = 'Get',
}

const dummyMetadata: Omit<ModelInstanceMetadata, 'id'> = {
	_version: undefined,
	_lastChangedAt: undefined,
	_deleted: undefined,
};

const metadataFields = <(keyof ModelInstanceMetadata)[]>(
	Object.keys(dummyMetadata)
);
export function getMetadataFields(): ReadonlyArray<string> {
	return metadataFields;
}

export function generateSelectionSet(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel | SchemaNonModel
): string {
	const scalarFields = getScalarFields(modelDefinition);
	const nonModelFields = getNonModelFields(namespace, modelDefinition);
	const implicitOwnerField = getImplicitOwnerField(
		modelDefinition,
		scalarFields
	);

	let scalarAndMetadataFields = Object.values(scalarFields)
		.map(({ name }) => name)
		.concat(implicitOwnerField)
		.concat(nonModelFields);

	if (isSchemaModel(modelDefinition)) {
		scalarAndMetadataFields = scalarAndMetadataFields
			.concat(getMetadataFields())
			.concat(getConnectionFields(modelDefinition));
	}

	const result = scalarAndMetadataFields.join('\n');

	return result;
}

function getImplicitOwnerField(
	modelDefinition: SchemaModel | SchemaNonModel,
	scalarFields: ModelFields
) {
	const ownerFields = getOwnerFields(modelDefinition);

	if (!scalarFields.owner && ownerFields.includes('owner')) {
		return ['owner'];
	}
	return [];
}

function getOwnerFields(
	modelDefinition: SchemaModel | SchemaNonModel
): string[] {
	const ownerFields: string[] = [];
	if (isSchemaModel(modelDefinition) && modelDefinition.attributes) {
		modelDefinition.attributes.forEach(attr => {
			if (attr.properties && attr.properties.rules) {
				const rule = attr.properties.rules.find(rule => rule.allow === 'owner');
				if (rule && rule.ownerField) {
					ownerFields.push(rule.ownerField);
				}
			}
		});
	}
	return ownerFields;
}

function getScalarFields(
	modelDefinition: SchemaModel | SchemaNonModel
): ModelFields {
	const { fields } = modelDefinition;

	const result = Object.values(fields)
		.filter(field => {
			if (isGraphQLScalarType(field.type) || isEnumFieldType(field.type)) {
				return true;
			}

			return false;
		})
		.reduce((acc, field) => {
			acc[field.name] = field;

			return acc;
		}, {} as ModelFields);

	return result;
}

function getConnectionFields(modelDefinition: SchemaModel): string[] {
	const result = [];

	Object.values(modelDefinition.fields)
		.filter(({ association }) => association && Object.keys(association).length)
		.forEach(({ name, association }) => {
			const { connectionType } = association;

			switch (connectionType) {
				case 'HAS_ONE':
				case 'HAS_MANY':
					// Intentionally blank
					break;
				case 'BELONGS_TO':
					if (isTargetNameAssociation(association)) {
						result.push(`${name} { id _deleted }`);
					}
					break;
				default:
					exhaustiveCheck(connectionType);
			}
		});

	return result;
}

function getNonModelFields(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel | SchemaNonModel
): string[] {
	const result = [];

	Object.values(modelDefinition.fields).forEach(({ name, type }) => {
		if (isNonModelFieldType(type)) {
			const typeDefinition = namespace.nonModels![type.nonModel];
			const scalarFields = Object.values(getScalarFields(typeDefinition)).map(
				({ name }) => name
			);

			const nested = [];
			Object.values(typeDefinition.fields).forEach(field => {
				const { type, name } = field;

				if (isNonModelFieldType(type)) {
					const typeDefinition = namespace.nonModels![type.nonModel];

					nested.push(
						`${name} { ${generateSelectionSet(namespace, typeDefinition)} }`
					);
				}
			});

			result.push(`${name} { ${scalarFields.join(' ')} ${nested.join(' ')} }`);
		}
	});

	return result;
}

export function getAuthorizationRules(
	modelDefinition: SchemaModel
): AuthorizationRule[] {
	// Searching for owner authorization on attributes
	const authConfig = []
		.concat(modelDefinition.attributes)
		.find(attr => attr && attr.type === 'auth');

	const { properties: { rules = [] } = {} } = authConfig || {};

	const resultRules: AuthorizationRule[] = [];
	// Multiple rules can be declared for allow: owner
	rules.forEach(rule => {
		// setting defaults for backwards compatibility with old cli
		const {
			identityClaim = 'cognito:username',
			ownerField = 'owner',
			operations = ['create', 'update', 'delete', 'read'],
			provider = 'userPools',
			groupClaim = 'cognito:groups',
			allow: authStrategy = 'iam',
			groups = [],
		} = rule;

		const isReadAuthorized = operations.includes('read');
		const isOwnerAuth = authStrategy === 'owner';

		if (!isReadAuthorized && !isOwnerAuth) {
			return;
		}

		const authRule: AuthorizationRule = {
			identityClaim,
			ownerField,
			provider,
			groupClaim,
			authStrategy,
			groups,
			areSubscriptionsPublic: false,
		};

		if (isOwnerAuth) {
			// look for the subscription level override
			// only pay attention to the public level
			const modelConfig = (<typeof modelDefinition.attributes>[])
				.concat(modelDefinition.attributes)
				.find(attr => attr && attr.type === 'model');

			// find the subscriptions level. ON is default
			const { properties: { subscriptions: { level = 'on' } = {} } = {} } =
				modelConfig || {};

			// treat subscriptions as public for owner auth with unprotected reads
			// when `read` is omitted from `operations`
			authRule.areSubscriptionsPublic =
				!operations.includes('read') || level === 'public';
		}

		if (isOwnerAuth) {
			// owner rules has least priority
			resultRules.push(authRule);
			return;
		}

		resultRules.unshift(authRule);
	});

	return resultRules;
}

export function buildSubscriptionGraphQLOperation(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel,
	transformerMutationType: TransformerMutationType,
	isOwnerAuthorization: boolean,
	ownerField: string
): [TransformerMutationType, string, string] {
	const selectionSet = generateSelectionSet(namespace, modelDefinition);

	const { name: typeName, pluralName: pluralTypeName } = modelDefinition;

	const opName = `on${transformerMutationType}${typeName}`;
	let docArgs = '';
	let opArgs = '';

	if (isOwnerAuthorization) {
		docArgs = `($${ownerField}: String!)`;
		opArgs = `(${ownerField}: $${ownerField})`;
	}

	return [
		transformerMutationType,
		opName,
		`subscription operation${docArgs}{
			${opName}${opArgs}{
				${selectionSet}
			}
		}`,
	];
}

export function buildGraphQLOperation(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel,
	graphQLOpType: keyof typeof GraphQLOperationType
): [TransformerMutationType, string, string][] {
	let selectionSet = generateSelectionSet(namespace, modelDefinition);

	const { name: typeName, pluralName: pluralTypeName } = modelDefinition;

	let operation: string;
	let documentArgs: string = ' ';
	let operationArgs: string = ' ';
	let transformerMutationType: TransformerMutationType;

	switch (graphQLOpType) {
		case 'LIST':
			operation = `sync${pluralTypeName}`;
			documentArgs = `($limit: Int, $nextToken: String, $lastSync: AWSTimestamp, $filter: Model${typeName}FilterInput)`;
			operationArgs =
				'(limit: $limit, nextToken: $nextToken, lastSync: $lastSync, filter: $filter)';
			selectionSet = `items {
							${selectionSet}
						}
						nextToken
						startedAt`;
			break;
		case 'CREATE':
			operation = `create${typeName}`;
			documentArgs = `($input: Create${typeName}Input!)`;
			operationArgs = '(input: $input)';
			transformerMutationType = TransformerMutationType.CREATE;
			break;
		case 'UPDATE':
			operation = `update${typeName}`;
			documentArgs = `($input: Update${typeName}Input!, $condition: Model${typeName}ConditionInput)`;
			operationArgs = '(input: $input, condition: $condition)';
			transformerMutationType = TransformerMutationType.UPDATE;
			break;
		case 'DELETE':
			operation = `delete${typeName}`;
			documentArgs = `($input: Delete${typeName}Input!, $condition: Model${typeName}ConditionInput)`;
			operationArgs = '(input: $input, condition: $condition)';
			transformerMutationType = TransformerMutationType.DELETE;
			break;
		case 'GET':
			operation = `get${typeName}`;
			documentArgs = `($id: ID!)`;
			operationArgs = '(id: $id)';
			transformerMutationType = TransformerMutationType.GET;
			break;

		default:
			exhaustiveCheck(graphQLOpType);
	}

	return [
		[
			transformerMutationType,
			operation,
			`${GraphQLOperationType[graphQLOpType]} operation${documentArgs}{
		${operation}${operationArgs}{
			${selectionSet}
		}
	}`,
		],
	];
}

export function createMutationInstanceFromModelOperation<
	T extends PersistentModel
>(
	relationships: RelationshipType,
	modelDefinition: SchemaModel,
	opType: OpType,
	model: PersistentModelConstructor<T>,
	element: T,
	condition: GraphQLCondition,
	MutationEventConstructor: PersistentModelConstructor<MutationEvent>,
	modelInstanceCreator: ModelInstanceCreator,
	id?: string
): MutationEvent {
	let operation: TransformerMutationType;

	switch (opType) {
		case OpType.INSERT:
			operation = TransformerMutationType.CREATE;
			break;
		case OpType.UPDATE:
			operation = TransformerMutationType.UPDATE;
			break;
		case OpType.DELETE:
			operation = TransformerMutationType.DELETE;
			break;
		default:
			exhaustiveCheck(opType);
	}

	const mutationEvent = modelInstanceCreator(MutationEventConstructor, {
		...(id ? { id } : {}),
		data: JSON.stringify(element),
		modelId: element.id,
		model: model.name,
		operation,
		condition: JSON.stringify(condition),
	});

	return mutationEvent;
}

export function predicateToGraphQLCondition(
	predicate: PredicatesGroup<any>
): GraphQLCondition {
	const result = {};

	if (!predicate || !Array.isArray(predicate.predicates)) {
		return result;
	}

	predicate.predicates.forEach(p => {
		if (isPredicateObj(p)) {
			const { field, operator, operand } = p;

			if (field === 'id') {
				return;
			}

			result[field] = { [operator]: operand };
		} else {
			result[p.type] = predicateToGraphQLCondition(p);
		}
	});

	return result;
}

export function predicateToGraphQLFilter(
	predicatesGroup: PredicatesGroup<any>
): GraphQLFilter {
	const result: GraphQLFilter = {};

	if (!predicatesGroup || !Array.isArray(predicatesGroup.predicates)) {
		return result;
	}

	const { type, predicates } = predicatesGroup;
	const isList = type === 'and' || type === 'or';

	result[type] = isList ? [] : {};

	const appendToFilter = value =>
		isList ? result[type].push(value) : (result[type] = value);

	predicates.forEach(predicate => {
		if (isPredicateObj(predicate)) {
			const { field, operator, operand } = predicate;

			const gqlField: GraphQLField = {
				[field]: { [operator]: operand },
			};

			appendToFilter(gqlField);
			return;
		}

		appendToFilter(predicateToGraphQLFilter(predicate));
	});

	return result;
}

export function getUserGroupsFromToken(
	token: { [field: string]: any },
	rule: AuthorizationRule
): string[] {
	// validate token against groupClaim
	let userGroups: string[] | string = token[rule.groupClaim] || [];

	if (typeof userGroups === 'string') {
		let parsedGroups;
		try {
			parsedGroups = JSON.parse(userGroups);
		} catch (e) {
			parsedGroups = userGroups;
		}
		userGroups = [].concat(parsedGroups);
	}

	return userGroups;
}
