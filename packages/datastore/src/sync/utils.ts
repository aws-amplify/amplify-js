import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { GraphQLAuthError } from '@aws-amplify/api';
import { Logger } from '@aws-amplify/core';
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
	isSchemaModelWithAttributes,
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
	ModelOperation,
	InternalSchema,
	AuthModeStrategy,
	ModelAttributes,
} from '../types';
import {
	exhaustiveCheck,
	extractPrimaryKeyFieldNames,
	establishRelationAndKeys,
	IDENTIFIER_KEY_SEPARATOR,
} from '../util';
import { MutationEvent } from './';

const logger = new Logger('DataStore');

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

const dummyMetadata: ModelInstanceMetadata = {
	_version: undefined!,
	_lastChangedAt: undefined!,
	_deleted: undefined!,
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
			.concat(getConnectionFields(modelDefinition, namespace));
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
	if (isSchemaModelWithAttributes(modelDefinition)) {
		modelDefinition.attributes!.forEach(attr => {
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

// Used for generating the selection set for queries and mutations
function getConnectionFields(
	modelDefinition: SchemaModel,
	namespace: SchemaNamespace
): string[] {
	const result: string[] = [];

	Object.values(modelDefinition.fields)
		.filter(({ association }) => association && Object.keys(association).length)
		.forEach(({ name, association }) => {
			const { connectionType } = association || {};

			switch (connectionType) {
				case 'HAS_ONE':
				case 'HAS_MANY':
					// case 'MANY_TO_MANY':
					// Intentionally blank
					break;
				case 'BELONGS_TO':
					if (isTargetNameAssociation(association)) {
						// New codegen (CPK)
						if (association.targetNames && association.targetNames.length > 0) {
							// Need to retrieve relations in order to get connected model keys
							const [relations] = establishRelationAndKeys(namespace);

							const connectedModelName =
								modelDefinition.fields[name].type['model'];

							const byPkIndex = relations[connectedModelName].indexes.find(
								([name]) => name === 'byPk'
							);
							const keyFields = byPkIndex && byPkIndex[1];
							const keyFieldSelectionSet = keyFields?.join(' ');

							// We rely on `_deleted` when we process the sync query (e.g. in batchSave in the adapters)
							result.push(`${name} { ${keyFieldSelectionSet} _deleted }`);
						} else {
							// backwards-compatability for schema generated prior to custom primary key support
							result.push(`${name} { id _deleted }`);
						}
					}
					break;
				default:
					throw new Error(`Invalid connection type ${connectionType}`);
			}
		});

	return result;
}

function getNonModelFields(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel | SchemaNonModel
): string[] {
	const result: string[] = [];

	Object.values(modelDefinition.fields).forEach(({ name, type }) => {
		if (isNonModelFieldType(type)) {
			const typeDefinition = namespace.nonModels![type.nonModel];
			const scalarFields = Object.values(getScalarFields(typeDefinition)).map(
				({ name }) => name
			);

			const nested: string[] = [];
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
	const authConfig = ([] as ModelAttributes)
		.concat(modelDefinition.attributes || [])
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
			const modelConfig = ([] as ModelAttributes)
				.concat(modelDefinition.attributes || [])
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
	let documentArgs: string;
	let operationArgs: string;
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
			throw new Error(`Invalid graphQlOpType ${graphQLOpType}`);
	}

	return [
		[
			transformerMutationType!,
			operation!,
			`${GraphQLOperationType[graphQLOpType]} operation${documentArgs}{
		${operation!}${operationArgs}{
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
			throw new Error(`Invalid opType ${opType}`);
	}

	// stringify nested objects of type AWSJSON
	// this allows us to return parsed JSON to users (see `castInstanceType()` in datastore.ts),
	// but still send the object correctly over the wire
	const replacer = (k, v) => {
		const isAWSJSON =
			k &&
			v !== null &&
			typeof v === 'object' &&
			modelDefinition.fields[k] &&
			modelDefinition.fields[k].type === 'AWSJSON';

		if (isAWSJSON) {
			return JSON.stringify(v);
		}
		return v;
	};

	const modelId = getIdentifierValue(modelDefinition, element);
	const optionalId = OpType.INSERT && id ? { id } : {};

	const mutationEvent = modelInstanceCreator(MutationEventConstructor, {
		...optionalId,
		data: JSON.stringify(element, replacer),
		modelId,
		model: model.name,
		operation: operation!,
		condition: JSON.stringify(condition),
	});

	return mutationEvent;
}

export function predicateToGraphQLCondition(
	predicate: PredicatesGroup<any>,
	modelDefinition: SchemaModel
): GraphQLCondition | null {
	const result = {};

	if (!predicate || !Array.isArray(predicate.predicates)) {
		return result;
	}

	// This is compatible with how the GQL Transform currently generates the Condition Input,
	// i.e. any PK and SK fields are omitted and can't be used as conditions.
	// However, I think this limits usability.
	// What if we want to delete all records where SK > some value
	// Or all records where PK = some value but SKs are different values

	// TODO: if the Transform gets updated we'll need to modify this logic to only omit
	// key fields from the predicate/condition when ALL of the keyFields are present and using `eq` operators

	const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
	return predicateToGraphQLFilter(predicate, keyFields) as GraphQLCondition;
}

export function predicateToGraphQLFilter(
	predicatesGroup: PredicatesGroup<any>,
	fieldsToOmit: string[] = []
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

			if (fieldsToOmit.includes(field as string)) return;

			const gqlField: GraphQLField = {
				[field]: { [operator]: operand },
			};

			appendToFilter(gqlField);
			return;
		}

		const child = predicateToGraphQLFilter(predicate, fieldsToOmit);
		Object.keys(child).length > 0 && appendToFilter(child);
	});

	if (isList) {
		if (result[type].length === 0) return {};
	} else {
		if (Object.keys(result[type]).length === 0) return {};
	}

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

export async function getModelAuthModes({
	authModeStrategy,
	defaultAuthMode,
	modelName,
	schema,
}: {
	authModeStrategy: AuthModeStrategy;
	defaultAuthMode: GRAPHQL_AUTH_MODE;
	modelName: string;
	schema: InternalSchema;
}): Promise<{
	[key in ModelOperation]: GRAPHQL_AUTH_MODE[];
}> {
	const operations = Object.values(ModelOperation);

	const modelAuthModes: {
		[key in ModelOperation]: GRAPHQL_AUTH_MODE[];
	} = {
		CREATE: [],
		READ: [],
		UPDATE: [],
		DELETE: [],
	};

	try {
		await Promise.all(
			operations.map(async operation => {
				const authModes = await authModeStrategy({
					schema,
					modelName,
					operation,
				});

				if (typeof authModes === 'string') {
					modelAuthModes[operation] = [authModes];
				} else if (Array.isArray(authModes) && authModes.length) {
					modelAuthModes[operation] = authModes;
				} else {
					// Use default auth mode if nothing is returned from authModeStrategy
					modelAuthModes[operation] = [defaultAuthMode];
				}
			})
		);
	} catch (error) {
		logger.debug(`Error getting auth modes for model: ${modelName}`, error);
	}
	return modelAuthModes;
}

export function getForbiddenError(error) {
	const forbiddenErrorMessages = [
		'Request failed with status code 401',
		'Request failed with status code 403',
	];
	let forbiddenError;
	if (error && error.errors) {
		forbiddenError = (error.errors as [any]).find(err =>
			forbiddenErrorMessages.includes(err.message)
		);
	} else if (error && error.message) {
		forbiddenError = error;
	}

	if (forbiddenError) {
		return forbiddenError.message;
	}
	return null;
}

export function getClientSideAuthError(error) {
	const clientSideAuthErrors = Object.values(GraphQLAuthError);
	const clientSideError =
		error &&
		error.message &&
		clientSideAuthErrors.find(clientError =>
			error.message.includes(clientError)
		);
	return clientSideError || null;
}

export async function getTokenForCustomAuth(
	authMode: GRAPHQL_AUTH_MODE,
	amplifyConfig: Record<string, any> = {}
): Promise<string | undefined> {
	if (authMode === GRAPHQL_AUTH_MODE.AWS_LAMBDA) {
		const {
			authProviders: { functionAuthProvider } = { functionAuthProvider: null },
		} = amplifyConfig;
		if (functionAuthProvider && typeof functionAuthProvider === 'function') {
			try {
				const { token } = await functionAuthProvider();
				return token;
			} catch (error) {
				throw new Error(
					`Error retrieving token from \`functionAuthProvider\`: ${error}`
				);
			}
		} else {
			// TODO: add docs link once available
			throw new Error(
				`You must provide a \`functionAuthProvider\` function to \`DataStore.configure\` when using ${GRAPHQL_AUTH_MODE.AWS_LAMBDA}`
			);
		}
	}
}

// Util that takes a modelDefinition and model and returns either the id value(s) or the custom primary key value(s)
export function getIdentifierValue(
	modelDefinition: SchemaModel,
	model: ModelInstanceMetadata | PersistentModel
): string {
	const pkFieldNames = extractPrimaryKeyFieldNames(modelDefinition);

	const idOrPk = pkFieldNames.map(f => model[f]).join(IDENTIFIER_KEY_SEPARATOR);

	return idOrPk;
}
