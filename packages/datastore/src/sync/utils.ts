// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { GraphQLAuthError } from '@aws-amplify/api';
import type { GraphQLError } from 'graphql';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

import { ModelInstanceCreator } from '../datastore/datastore';
import {
	AuthModeStrategy,
	AuthorizationRule,
	GraphQLCondition,
	GraphQLField,
	GraphQLFilter,
	InternalSchema,
	ModelAttributes,
	ModelFields,
	ModelInstanceMetadata,
	ModelOperation,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	PredicateObject,
	PredicatesGroup,
	RelationshipType,
	SchemaModel,
	SchemaNamespace,
	SchemaNonModel,
	isEnumFieldType,
	isGraphQLScalarType,
	isNonModelFieldType,
	isPredicateGroup,
	isPredicateObj,
	isSchemaModel,
	isSchemaModelWithAttributes,
	isTargetNameAssociation,
} from '../types';
import {
	IDENTIFIER_KEY_SEPARATOR,
	establishRelationAndKeys,
	extractPrimaryKeyFieldNames,
} from '../util';

import { MutationEvent } from './';

const logger = new ConsoleLogger('DataStore');

const GraphQLOperationType = {
	LIST: 'query',
	CREATE: 'mutation',
	UPDATE: 'mutation',
	DELETE: 'mutation',
	GET: 'query',
};

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

const metadataFields = Object.keys(
	dummyMetadata,
) as (keyof ModelInstanceMetadata)[];
export function getMetadataFields(): readonly string[] {
	return metadataFields;
}

export function generateSelectionSet(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel | SchemaNonModel,
): string {
	const scalarFields = getScalarFields(modelDefinition);
	const nonModelFields = getNonModelFields(namespace, modelDefinition);
	const implicitOwnerField = getImplicitOwnerField(
		modelDefinition,
		scalarFields,
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
	scalarFields: ModelFields,
) {
	const ownerFields = getOwnerFields(modelDefinition);

	if (!scalarFields.owner && ownerFields.includes('owner')) {
		return ['owner'];
	}

	return [];
}

function getOwnerFields(
	modelDefinition: SchemaModel | SchemaNonModel,
): string[] {
	const ownerFields: string[] = [];
	if (isSchemaModelWithAttributes(modelDefinition)) {
		modelDefinition.attributes!.forEach(attr => {
			if (attr.properties && attr.properties.rules) {
				const rule = attr.properties.rules.find(
					currentRule => currentRule.allow === 'owner',
				);
				if (rule && rule.ownerField) {
					ownerFields.push(rule.ownerField);
				}
			}
		});
	}

	return ownerFields;
}

function getScalarFields(
	modelDefinition: SchemaModel | SchemaNonModel,
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
	namespace: SchemaNamespace,
): string[] {
	const result: string[] = [];

	Object.values(modelDefinition.fields)
		.filter(({ association }) => association && Object.keys(association).length)
		.forEach(({ name, association }) => {
			const { connectionType } = association || {};

			switch (connectionType) {
				case 'HAS_ONE':
				case 'HAS_MANY':
					// Intentionally blank
					break;
				case 'BELONGS_TO':
					if (isTargetNameAssociation(association)) {
						// New codegen (CPK)
						if (association.targetNames && association.targetNames.length > 0) {
							// Need to retrieve relations in order to get connected model keys
							const [relations] = establishRelationAndKeys(namespace);

							const connectedModelName = (
								modelDefinition.fields[name].type as any
							).model;

							const byPkIndex = relations[connectedModelName].indexes.find(
								([currentName]) => currentName === 'byPk',
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
	modelDefinition: SchemaModel | SchemaNonModel,
): string[] {
	const result: string[] = [];

	Object.values(modelDefinition.fields).forEach(({ name, type }) => {
		if (isNonModelFieldType(type)) {
			const typeDefinition = namespace.nonModels![type.nonModel];
			const scalarFields = Object.values(getScalarFields(typeDefinition)).map(
				({ name: currentName }) => currentName,
			);

			const nested: string[] = [];
			Object.values(typeDefinition.fields).forEach(field => {
				const { type: fieldType, name: fieldName } = field;

				if (isNonModelFieldType(fieldType)) {
					const nonModelTypeDefinition =
						namespace.nonModels![fieldType.nonModel];
					nested.push(
						`${fieldName} { ${generateSelectionSet(namespace, nonModelTypeDefinition)} }`,
					);
				}
			});

			result.push(`${name} { ${scalarFields.join(' ')} ${nested.join(' ')} }`);
		}
	});

	return result;
}

export function getAuthorizationRules(
	modelDefinition: SchemaModel,
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
			groupsField = '',
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
			groupsField,
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
	ownerField: string,
	filterArg = false,
): [TransformerMutationType, string, string] {
	const selectionSet = generateSelectionSet(namespace, modelDefinition);

	const { name: typeName } = modelDefinition;

	const opName = `on${transformerMutationType}${typeName}`;

	const docArgs: string[] = [];
	const opArgs: string[] = [];

	if (filterArg) {
		docArgs.push(`$filter: ModelSubscription${typeName}FilterInput`);
		opArgs.push('filter: $filter');
	}

	if (isOwnerAuthorization) {
		docArgs.push(`$${ownerField}: String!`);
		opArgs.push(`${ownerField}: $${ownerField}`);
	}

	const docStr = docArgs.length ? `(${docArgs.join(',')})` : '';
	const opStr = opArgs.length ? `(${opArgs.join(',')})` : '';

	return [
		transformerMutationType,
		opName,
		`subscription operation${docStr}{
			${opName}${opStr}{
				${selectionSet}
			}
		}`,
	];
}

export function buildGraphQLOperation(
	namespace: SchemaNamespace,
	modelDefinition: SchemaModel,
	graphQLOpType: keyof typeof GraphQLOperationType,
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
	T extends PersistentModel,
>(
	relationships: RelationshipType,
	modelDefinition: SchemaModel,
	opType: OpType,
	model: PersistentModelConstructor<T>,
	element: T,
	condition: GraphQLCondition,
	MutationEventConstructor: PersistentModelConstructor<MutationEvent>,
	modelInstanceCreator: ModelInstanceCreator,
	id?: string,
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
	modelDefinition: SchemaModel,
): GraphQLCondition {
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
/**
 * @param predicatesGroup - Predicate Group
	@returns GQL Filter Expression from Predicate Group

	@remarks Flattens redundant list predicates
	@example

	```js
	{ and:[{ and:[{ username:  { eq: 'bob' }}] }] }
	```
	Becomes
	```js
	{ and:[{ username: { eq: 'bob' }}] }
	```
	*/
export function predicateToGraphQLFilter(
	predicatesGroup: PredicatesGroup<any>,
	fieldsToOmit: string[] = [],
	root = true,
): GraphQLFilter {
	const result: GraphQLFilter = {};

	if (!predicatesGroup || !Array.isArray(predicatesGroup.predicates)) {
		return result;
	}

	const { type, predicates } = predicatesGroup;
	const isList = type === 'and' || type === 'or';

	result[type] = isList ? [] : {};

	const children: GraphQLFilter[] = [];

	predicates.forEach(predicate => {
		if (isPredicateObj(predicate)) {
			const { field, operator, operand } = predicate;

			if (fieldsToOmit.includes(field as string)) return;

			const gqlField: GraphQLField = {
				[field]: { [operator]: operand },
			};

			children.push(gqlField);

			return;
		}

		const child = predicateToGraphQLFilter(predicate, fieldsToOmit, false);
		if (Object.keys(child).length > 0) {
			children.push(child);
		}
	});

	// flatten redundant list predicates
	if (children.length === 1) {
		const [child] = children;
		if (
			// any nested list node
			(isList && !root) ||
			// root list node where the only child is also a list node
			(isList && root && ('and' in child || 'or' in child))
		) {
			delete result[type];
			Object.assign(result, child);

			return result;
		}
	}

	children.forEach(child => {
		if (isList) {
			result[type].push(child);
		} else {
			result[type] = child;
		}
	});

	if (isList) {
		if (result[type].length === 0) return {};
	} else {
		if (Object.keys(result[type]).length === 0) return {};
	}

	return result;
}

/**
 *
 * @param group - selective sync predicate group
 * @returns set of distinct field names in the filter group
 */
export function filterFields(group?: PredicatesGroup<any>): Set<string> {
	const fields = new Set<string>();

	if (!group || !Array.isArray(group.predicates)) return fields;

	const { predicates } = group;
	const stack = [...predicates];

	while (stack.length > 0) {
		const current = stack.pop();
		if (isPredicateObj(current)) {
			fields.add(current.field as string);
		} else if (isPredicateGroup(current)) {
			stack.push(...current.predicates);
		}
	}

	return fields;
}

/**
 *
 * @param modelDefinition
 * @returns set of field names used with dynamic auth modes configured for the provided model definition
 */
export function dynamicAuthFields(modelDefinition: SchemaModel): Set<string> {
	const rules = getAuthorizationRules(modelDefinition);
	const fields = new Set<string>();

	for (const rule of rules) {
		if (rule.groupsField && !rule.groups.length) {
			// dynamic group rule will have no values in `rule.groups`
			fields.add((rule as AuthorizationRule).groupsField);
		} else if (rule.ownerField) {
			fields.add(rule.ownerField);
		}
	}

	return fields;
}

/**
 *
 * @param group - selective sync predicate group
 * @returns the total number of OR'd predicates in the filter group
 *
 * @example returns 2
 * ```js
 * { type: "or", predicates: [
 * { field: "username", operator: "beginsWith", operand: "a" },
 * { field: "title", operator: "contains", operand: "abc" },
 * ]}
 * ```
 */
export function countFilterCombinations(group?: PredicatesGroup<any>): number {
	if (!group || !Array.isArray(group.predicates)) return 0;

	let count = 0;
	const stack: (PredicatesGroup<any> | PredicateObject<any>)[] = [group];

	while (stack.length > 0) {
		const current = stack.pop();

		if (isPredicateGroup(current)) {
			const { predicates, type } = current;
			// ignore length = 1; groups with 1 predicate will get flattened when converted to gqlFilter
			if (type === 'or' && predicates.length > 1) {
				count += predicates.length;
			}
			stack.push(...predicates);
		}
	}

	// if we didn't encounter any OR groups, default to 1
	return count || 1;
}

/**
 *
 * @param group - selective sync predicate group
 * @returns name of repeated field | null
 *
 * @example returns "username"
 * ```js
 * { type: "and", predicates: [
 * 		{ field: "username", operator: "beginsWith", operand: "a" },
 * 		{ field: "username", operator: "contains", operand: "abc" },
 * ] }
 * ```
 */
export function repeatedFieldInGroup(
	group?: PredicatesGroup<any>,
): string | null {
	if (!group || !Array.isArray(group.predicates)) return null;

	// convert to filter in order to flatten redundant groups
	const gqlFilter = predicateToGraphQLFilter(group);

	const stack: GraphQLFilter[] = [gqlFilter];

	const hasGroupRepeatedFields = (fields: GraphQLFilter[]): string | null => {
		const seen = {};

		for (const f of fields) {
			const [fieldName] = Object.keys(f);
			if (seen[fieldName]) {
				return fieldName;
			}
			seen[fieldName] = true;
		}

		return null;
	};

	while (stack.length > 0) {
		const current = stack.pop();

		const [key] = Object.keys(current!);
		const values = current![key];

		if (!Array.isArray(values)) {
			return null;
		}

		// field value will be single object
		const predicateObjects = values.filter(
			v => !Array.isArray(Object.values(v)[0]),
		);

		// group value will be an array
		const predicateGroups = values.filter(v =>
			Array.isArray(Object.values(v)[0]),
		);

		if (key === 'and') {
			const repeatedField = hasGroupRepeatedFields(predicateObjects);
			if (repeatedField) {
				return repeatedField;
			}
		}

		stack.push(...predicateGroups);
	}

	return null;
}

export enum RTFError {
	UnknownField,
	MaxAttributes,
	MaxCombinations,
	RepeatedFieldname,
	NotGroup,
	FieldNotInType,
}

export function generateRTFRemediation(
	errorType: RTFError,
	modelDefinition: SchemaModel,
	predicatesGroup: PredicatesGroup<any> | undefined,
): string {
	const selSyncFields = filterFields(predicatesGroup);
	const selSyncFieldStr = [...selSyncFields].join(', ');
	const dynamicAuthModeFields = dynamicAuthFields(modelDefinition);
	const dynamicAuthFieldsStr = [...dynamicAuthModeFields].join(', ');
	const filterCombinations = countFilterCombinations(predicatesGroup);
	const repeatedField = repeatedFieldInGroup(predicatesGroup);

	switch (errorType) {
		case RTFError.UnknownField:
			return (
				`Your API was generated with an older version of the CLI that doesn't support backend subscription filtering.` +
				'To enable backend subscription filtering, upgrade your Amplify CLI to the latest version and push your app by running `amplify upgrade` followed by `amplify push`'
			);

		case RTFError.MaxAttributes: {
			let message = `Your selective sync expression for ${modelDefinition.name} contains ${selSyncFields.size} different model fields: ${selSyncFieldStr}.\n\n`;

			if (dynamicAuthModeFields.size > 0) {
				message +=
					`Note: the number of fields you can use with selective sync is affected by @auth rules configured on the model.\n\n` +
					`Dynamic auth modes, such as owner auth and dynamic group auth each utilize 1 field.\n` +
					`You currently have ${dynamicAuthModeFields.size} dynamic auth mode(s) configured on this model: ${dynamicAuthFieldsStr}.`;
			}

			return message;
		}

		case RTFError.MaxCombinations: {
			let message = `Your selective sync expression for ${modelDefinition.name} contains ${filterCombinations} field combinations (total number of predicates in an OR expression).\n\n`;

			if (dynamicAuthModeFields.size > 0) {
				message +=
					`Note: the number of fields you can use with selective sync is affected by @auth rules configured on the model.\n\n` +
					`Dynamic auth modes, such as owner auth and dynamic group auth factor in to the number of combinations you're using.\n` +
					`You currently have ${dynamicAuthModeFields.size} dynamic auth mode(s) configured on this model: ${dynamicAuthFieldsStr}.`;
			}

			return message;
		}

		case RTFError.RepeatedFieldname:
			return `Your selective sync expression for ${modelDefinition.name} contains multiple entries for ${repeatedField} in the same AND group.`;
		case RTFError.NotGroup:
			return (
				`Your selective sync expression for ${modelDefinition.name} uses a \`not\` group. If you'd like to filter subscriptions in the backend, ` +
				`rewrite your expression using \`ne\` or \`notContains\` operators.`
			);
		case RTFError.FieldNotInType:
			// no remediation instructions. We'll surface the message directly
			return '';
	}
}

export function getUserGroupsFromToken(
	token: Record<string, any>,
	rule: AuthorizationRule,
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
	defaultAuthMode: GraphQLAuthMode;
	modelName: string;
	schema: InternalSchema;
}): Promise<Record<ModelOperation, GraphQLAuthMode[]>> {
	const operations = Object.values(ModelOperation);

	const modelAuthModes: Record<ModelOperation, GraphQLAuthMode[]> = {
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
			}),
		);
	} catch (error) {
		logger.debug(`Error getting auth modes for model: ${modelName}`, error);
	}

	return modelAuthModes;
}

export function getForbiddenError(error) {
	const forbiddenErrorCodes = [401, 403];
	let forbiddenError;
	if (error && error.errors) {
		forbiddenError = (error.errors as [any]).find(err =>
			forbiddenErrorCodes.includes(resolveServiceErrorStatusCode(err)),
		);
	} else if (error && error.message) {
		forbiddenError = error;
	}

	if (forbiddenError) {
		return (
			forbiddenError.message ??
			`Request failed with status code ${resolveServiceErrorStatusCode(
				forbiddenError,
			)}`
		);
	}

	return null;
}

export function resolveServiceErrorStatusCode(error: unknown): number | null {
	if ((error as any)?.$metadata?.httpStatusCode) {
		return Number((error as any)?.$metadata?.httpStatusCode);
	} else if ((error as GraphQLError)?.originalError) {
		return resolveServiceErrorStatusCode(
			(error as GraphQLError)?.originalError,
		);
	} else {
		return null;
	}
}

export function getClientSideAuthError(error) {
	const clientSideAuthErrors = Object.values(GraphQLAuthError);
	const clientSideError =
		error &&
		error.message &&
		clientSideAuthErrors.find(clientError =>
			error.message.includes(clientError),
		);

	return clientSideError || null;
}

export async function getTokenForCustomAuth(
	authMode: GraphQLAuthMode,
	amplifyConfig: Record<string, any> = {},
): Promise<string | undefined> {
	if (authMode === 'lambda') {
		const {
			authProviders: { functionAuthProvider } = { functionAuthProvider: null },
		} = amplifyConfig;
		if (functionAuthProvider && typeof functionAuthProvider === 'function') {
			try {
				const { token } = await functionAuthProvider();

				return token;
			} catch (error) {
				throw new Error(
					`Error retrieving token from \`functionAuthProvider\`: ${error}`,
				);
			}
		} else {
			// TODO: add docs link once available
			throw new Error(
				'You must provide a `functionAuthProvider` function to `DataStore.configure` when using lambda',
			);
		}
	}
}

// Util that takes a modelDefinition and model and returns either the id value(s) or the custom primary key value(s)
export function getIdentifierValue(
	modelDefinition: SchemaModel,
	model: ModelInstanceMetadata | PersistentModel,
): string {
	const pkFieldNames = extractPrimaryKeyFieldNames(modelDefinition);

	const idOrPk = pkFieldNames.map(f => model[f]).join(IDENTIFIER_KEY_SEPARATOR);

	return idOrPk;
}
