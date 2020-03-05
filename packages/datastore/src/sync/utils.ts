import { ModelInstanceCreator } from '../datastore/datastore';
import {
	AuthorizationRule,
	GraphQLCondition,
	isEnumFieldType,
	isGraphQLScalarType,
	isPredicateObj,
	isTargetNameAssociation,
	ModelFields,
	ModelInstanceMetadata,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	PredicatesGroup,
	RelationshipType,
	SchemaModel,
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

// TODO: Ask for parent/children ids
function generateSelectionSet(modelDefinition: SchemaModel): string {
	const scalarFields = getScalarFields(modelDefinition);

	const scalarAndMetadataFields = Object.values(scalarFields)
		.map(({ name }) => name)
		.concat(getMetadataFields())
		.concat(getConnectionFields(modelDefinition));

	const result = scalarAndMetadataFields.join('\n');

	return result;
}

function getScalarFields(modelDefinition: SchemaModel): ModelFields {
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

export function getAuthorizationRules(
	modelDefinition: SchemaModel,
	transformerOpType: TransformerMutationType
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
			operations = ['create', 'update', 'delete'],
			provider = 'userPools',
			groupClaim = 'cognito:groups',
			allow: authStrategy = 'iam',
			groups = [],
		} = rule;

		const isOperationAuthorized = operations.find(
			operation => operation.toLowerCase() === transformerOpType.toLowerCase()
		);

		if (isOperationAuthorized) {
			const rule = {
				identityClaim,
				ownerField,
				provider,
				groupClaim,
				authStrategy,
				groups,
			};

			// owner rules has least priority
			if (authStrategy === 'owner') {
				resultRules.push(rule);
			} else {
				resultRules.unshift(rule);
			}
		}
	});

	return resultRules;
}

export function buildSubscriptionGraphQLOperation(
	modelDefinition: SchemaModel,
	transformerMutationType: TransformerMutationType,
	isOwnerAuthorization: boolean,
	ownerField: string
): [TransformerMutationType, string, string] {
	const selectionSet = generateSelectionSet(modelDefinition);

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
	modelDefinition: SchemaModel,
	graphQLOpType: keyof typeof GraphQLOperationType
): [TransformerMutationType, string, string][] {
	let selectionSet = generateSelectionSet(modelDefinition);

	const { name: typeName, pluralName: pluralTypeName } = modelDefinition;

	let operation: string;
	let documentArgs: string = ' ';
	let operationArgs: string = ' ';
	let transformerMutationType: TransformerMutationType;

	switch (graphQLOpType) {
		case 'LIST':
			operation = `sync${pluralTypeName}`;
			documentArgs = `($limit: Int, $nextToken: String, $lastSync: AWSTimestamp)`;
			operationArgs =
				'(limit: $limit, nextToken: $nextToken, lastSync: $lastSync)';
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
