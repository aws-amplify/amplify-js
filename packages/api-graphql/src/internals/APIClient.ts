// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { resolveOwnerFields } from '../utils/resolveOwnerFields';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { V6Client, __authMode, __authToken } from '../types';
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

type ListArgs = { selectionSet?: string[]; filter?: {} };

type LazyLoadOptions = {
	authMode?: GraphQLAuthMode;
	authToken?: string | undefined;
	limit?: number | undefined;
	nextToken?: string | undefined | null;
};

const connectionType = {
	HAS_ONE: 'HAS_ONE',
	HAS_MANY: 'HAS_MANY',
	BELONGS_TO: 'BELONGS_TO',
};

/**
 *
 * @param GraphQL response object
 * @returns response object with `items` properties flattened
 */
export const flattenItems = (obj: Record<string, any>): Record<string, any> => {
	const res: Record<string, any> = {};

	Object.entries(obj).forEach(([prop, value]) => {
		if (typeof value === 'object' && value !== null) {
			if (value.items !== undefined) {
				res[prop] = value.items.map((item: Record<string, any>) =>
					flattenItems(item)
				);
				return;
			}
			res[prop] = flattenItems(value);
			return;
		}

		res[prop] = value;
	});

	return res;
};

// TODO: this should accept single result to support CRUD methods; create helper for array/list
export function initializeModel(
	client: any,
	modelName: string,
	result: any[],
	modelIntrospection: any,
	authMode: GraphQLAuthMode | undefined,
	authToken: string | undefined,
	context = false
): any[] {
	const introModel = modelIntrospection.models[modelName];
	const introModelFields = introModel.fields;

	const modelFields: string[] = Object.entries(introModelFields)
		.filter(([_, field]: [string, any]) => field?.type?.model !== undefined)
		.map(([fieldName]) => fieldName);

	return result.map(record => {
		const initializedRelationalFields = {};

		for (const field of modelFields) {
			const relatedModelName = introModelFields[field].type.model;

			const relatedModel = modelIntrospection.models[relatedModelName];

			const relatedModelPKFieldName =
				relatedModel.primaryKeyInfo.primaryKeyFieldName;

			const relatedModelSKFieldNames =
				relatedModel.primaryKeyInfo.sortKeyFieldNames;

			const relationType = introModelFields[field].association.connectionType;
			const connectionFields =
				introModelFields[field].association.associatedWith;

			const targetNames =
				introModelFields[field].association?.targetNames || [];

			switch (relationType) {
				case connectionType.HAS_ONE:
				case connectionType.BELONGS_TO:
					const sortKeyValues = relatedModelSKFieldNames.reduce(
						(acc, curVal) => {
							if (record[curVal]) {
								return (acc[curVal] = record[curVal]);
							}
						},
						{}
					);

					if (context) {
						initializedRelationalFields[field] = (
							contextSpec: AmplifyServer.ContextSpec,
							options?: LazyLoadOptions
						) => {
							if (record[targetNames[0]]) {
								return client.models[relatedModelName].get(
									contextSpec,
									{
										[relatedModelPKFieldName]: record[targetNames[0]],
										...sortKeyValues,
									},
									{
										authMode: options?.authMode || authMode,
										authToken: options?.authToken || authToken,
									}
								);
							}
							return undefined;
						};
					} else {
						initializedRelationalFields[field] = (
							options?: LazyLoadOptions
						) => {
							if (record[targetNames[0]]) {
								return client.models[relatedModelName].get(
									{
										[relatedModelPKFieldName]: record[targetNames[0]],
										...sortKeyValues,
									},
									{
										authMode: options?.authMode || authMode,
										authToken: options?.authToken || authToken,
									}
								);
							}
							return undefined;
						};
					}

					break;
				case connectionType.HAS_MANY:
					const parentPk = introModel.primaryKeyInfo.primaryKeyFieldName;
					const parentSK = introModel.primaryKeyInfo.sortKeyFieldNames;

					// M:N check - TODO: refactor
					if (relatedModel.fields[connectionFields[0]]?.type.model) {
						const relatedTargetNames =
							relatedModel.fields[connectionFields[0]].association.targetNames;

						const hasManyFilter = relatedTargetNames.map((field, idx) => {
							if (idx === 0) {
								return { [field]: { eq: record[parentPk] } };
							}

							return { [field]: { eq: record[parentSK[idx - 1]] } };
						});

						if (context) {
							initializedRelationalFields[field] = (
								contextSpec: AmplifyServer.ContextSpec,
								options?: LazyLoadOptions
							) => {
								if (record[parentPk]) {
									return client.models[relatedModelName].list(contextSpec, {
										filter: { and: hasManyFilter },
										limit: options?.limit,
										nextToken: options?.nextToken,
										authMode: options?.authMode || authMode,
										authToken: options?.authToken || authToken,
									});
								}
								return [];
							};
						} else {
							initializedRelationalFields[field] = (
								options?: LazyLoadOptions
							) => {
								if (record[parentPk]) {
									return client.models[relatedModelName].list({
										filter: { and: hasManyFilter },
										limit: options?.limit,
										nextToken: options?.nextToken,
										authMode: options?.authMode || authMode,
										authToken: options?.authToken || authToken,
									});
								}
								return [];
							};
						}

						break;
					}

					const hasManyFilter = connectionFields.map((field, idx) => {
						if (idx === 0) {
							return { [field]: { eq: record[parentPk] } };
						}

						return { [field]: { eq: record[parentSK[idx - 1]] } };
					});

					if (context) {
						initializedRelationalFields[field] = (
							contextSpec: AmplifyServer.ContextSpec,
							options?: LazyLoadOptions
						) => {
							if (record[parentPk]) {
								return client.models[relatedModelName].list(contextSpec, {
									filter: { and: hasManyFilter },
									limit: options?.limit,
									nextToken: options?.nextToken,
									authMode: options?.authMode || authMode,
									authToken: options?.authToken || authToken,
								});
							}
							return [];
						};
					} else {
						initializedRelationalFields[field] = (
							options?: LazyLoadOptions
						) => {
							if (record[parentPk]) {
								return client.models[relatedModelName].list({
									filter: { and: hasManyFilter },
									limit: options?.limit,
									nextToken: options?.nextToken,
									authMode: options?.authMode || authMode,
									authToken: options?.authToken || authToken,
								});
							}
							return [];
						};
					}

					break;
				default:
					break;
			}
		}

		return { ...record, ...initializedRelationalFields };
	});
}

export const graphQLOperationsInfo = {
	CREATE: { operationPrefix: 'create' as const, usePlural: false },
	READ: { operationPrefix: 'get' as const, usePlural: false },
	UPDATE: { operationPrefix: 'update' as const, usePlural: false },
	DELETE: { operationPrefix: 'delete' as const, usePlural: false },
	LIST: { operationPrefix: 'list' as const, usePlural: true },
	ONCREATE: { operationPrefix: 'onCreate' as const, usePlural: false },
	ONUPDATE: { operationPrefix: 'onUpdate' as const, usePlural: false },
	ONDELETE: { operationPrefix: 'onDelete' as const, usePlural: false },
	OBSERVE_QUERY: { operationPrefix: 'observeQuery' as const, usePlural: false },
};
export type ModelOperation = keyof typeof graphQLOperationsInfo;

type OperationPrefix =
	(typeof graphQLOperationsInfo)[ModelOperation]['operationPrefix'];

const graphQLDocumentsCache = new Map<string, Map<ModelOperation, string>>();
const SELECTION_SET_WILDCARD = '*';

function defaultSelectionSetForModel(modelDefinition: any): string[] {
	// fields that are explicitly part of the graphql schema; not
	// inferred from owner auth rules.
	const { fields } = modelDefinition;
	const explicitFields = Object.values<any>(fields)
		.map(({ type, name }) => typeof type === 'string' && name) // Default selection set omits model fields
		.filter(Boolean);

	// fields used for owner auth rules that may or may not also
	// be explicit on the model.
	const ownerFields = resolveOwnerFields(modelDefinition);

	return Array.from(new Set(explicitFields.concat(ownerFields)));
}

const FIELD_IR = '';

/**
 * Generates nested Custom Selection Set IR from path
 *
 * @param modelIntrospection
 * @param modelName
 * @param selectionSet - array of object paths
 * @example
 * ### Given
 * `selectionSet = ['id', 'comments.post.id']`
 * ### Returns
 * ```ts
 * {
 *   id: '',
 *   comments: {
 *     items: { post: { id: '' } }
 *   }
 * }
 * ```
 */
export function customSelectionSetToIR(
	modelIntrospection: any,
	modelName: string,
	selectionSet: string[]
): Record<string, string | object> {
	const modelDefinition = modelIntrospection[modelName];
	const { fields: modelFields } = modelDefinition;

	return selectionSet.reduce((resultObj, path) => {
		const [fieldName, nested, ...rest] = path.split('.');

		if (nested) {
			const relatedModel = modelFields[fieldName]?.type?.model;

			if (!relatedModel) {
				// TODO: may need to change this to support custom types
				throw Error(`${fieldName} is not a model field`);
			}

			const relatedModelDefinition = modelIntrospection[relatedModel];

			const selectionSet =
				nested === SELECTION_SET_WILDCARD
					? defaultSelectionSetIR(relatedModelDefinition)
					: // if we have a path like 'field.anotherField' recursively build up selection set IR
					  customSelectionSetToIR(modelIntrospection, relatedModel, [
							[nested, ...rest].join('.'),
					  ]);

			if (modelFields[fieldName]?.isArray) {
				const existing = resultObj[fieldName] || {
					items: {},
				};
				const merged = { ...existing.items, ...selectionSet };

				resultObj[fieldName] = { items: merged };
				return resultObj;
			}

			const existingItems = resultObj[fieldName] || {};
			const merged = { ...existingItems, ...selectionSet };

			resultObj[fieldName] = merged;
			return resultObj;
		}

		const exists = Boolean(modelFields[fieldName]);

		if (!exists) {
			throw Error(`${fieldName} is not a field of model ${modelName}`);
		}

		resultObj[fieldName] = FIELD_IR;
		return resultObj;
	}, {});
}

const defaultSelectionSetIR = relatedModelDefinition => {
	const defaultSelectionSet = defaultSelectionSetForModel(
		relatedModelDefinition
	);

	const reduced = defaultSelectionSet.reduce((acc, curVal) => {
		acc[curVal] = FIELD_IR;
		return acc;
	}, {});

	return reduced;
};

/**
 * Stringifies selection set IR
 * * @example
 * ### Given
 * ```ts
 * {
 *   id: '',
 *   comments: {
 *     items: { post: { id: '' } }
 *   }
 * }
 * ```
 * ### Returns
 * `'id comments { items { post { id } } }'`
 */
export function selectionSetIRToString(
	obj: Record<string, string | any>
): string {
	const res: string[] = [];

	Object.entries(obj).forEach(([fieldName, value]) => {
		if (value === FIELD_IR) {
			res.push(fieldName);
		} else if (typeof value === 'object' && value !== null) {
			if (value?.items) {
				res.push(
					fieldName,
					'{',
					'items',
					'{',
					selectionSetIRToString(value.items),
					'}',
					'}'
				);
			} else {
				res.push(fieldName, '{', selectionSetIRToString(value), '}');
			}
		}
	});

	return res.join(' ');
}

export function generateSelectionSet(
	modelIntrospection: any,
	modelName: string,
	selectionSet?: string[]
) {
	const modelDefinition = modelIntrospection[modelName];

	if (!selectionSet) {
		return defaultSelectionSetForModel(modelDefinition).join(' ');
	}

	const selSetIr = customSelectionSetToIR(
		modelIntrospection,
		modelName,
		selectionSet
	);
	const selSetString = selectionSetIRToString(selSetIr);

	return selSetString;
}

export function generateGraphQLDocument(
	modelIntrospection: any,
	modelName: string,
	modelOperation: ModelOperation,
	listArgs?: ListArgs
): string {
	const modelDefinition = modelIntrospection[modelName];

	const {
		name,
		pluralName,
		fields,
		primaryKeyInfo: {
			isCustomPrimaryKey,
			primaryKeyFieldName,
			sortKeyFieldNames,
		},
	} = modelDefinition;

	const { operationPrefix, usePlural } = graphQLOperationsInfo[modelOperation];

	const { selectionSet } = listArgs || {};

	const fromCache = graphQLDocumentsCache.get(name)?.get(modelOperation);

	if (fromCache !== undefined) {
		return fromCache;
	}

	if (!graphQLDocumentsCache.has(name)) {
		graphQLDocumentsCache.set(name, new Map());
	}

	const graphQLFieldName = `${operationPrefix}${usePlural ? pluralName : name}`;
	let graphQLOperationType: 'mutation' | 'query' | 'subscription' | undefined;
	let graphQLSelectionSet: string | undefined;
	let graphQLArguments: Record<string, any> | undefined;

	const selectionSetFields = generateSelectionSet(
		modelIntrospection,
		modelName,
		selectionSet
	);

	switch (modelOperation) {
		case 'CREATE':
		case 'UPDATE':
		case 'DELETE':
			graphQLArguments ??
				(graphQLArguments = {
					input: `${
						operationPrefix.charAt(0).toLocaleUpperCase() +
						operationPrefix.slice(1)
					}${name}Input!`,
				});
			graphQLOperationType ?? (graphQLOperationType = 'mutation');
		case 'READ':
			graphQLArguments ??
				(graphQLArguments = isCustomPrimaryKey
					? [primaryKeyFieldName, ...sortKeyFieldNames].reduce(
							(acc, fieldName) => {
								acc[fieldName] = fields[fieldName].type;

								return acc;
							},
							{}
					  )
					: {
							[primaryKeyFieldName]: `${fields[primaryKeyFieldName].type}!`,
					  });
			graphQLSelectionSet ?? (graphQLSelectionSet = selectionSetFields);
		case 'LIST':
			graphQLArguments ??
				(graphQLArguments = {
					filter: `Model${name}FilterInput`,
					limit: 'Int',
					nextToken: 'String',
				});
			graphQLOperationType ?? (graphQLOperationType = 'query');
			graphQLSelectionSet ??
				(graphQLSelectionSet = `items { ${selectionSetFields} } nextToken __typename`);
		case 'ONCREATE':
		case 'ONUPDATE':
		case 'ONDELETE':
			graphQLArguments ??
				(graphQLArguments = {
					filter: `ModelSubscription${name}FilterInput`,
				});
			graphQLOperationType ?? (graphQLOperationType = 'subscription');
			graphQLSelectionSet ?? (graphQLSelectionSet = selectionSetFields);
			break;
		case 'OBSERVE_QUERY':
		default:
			throw new Error(
				'Internal error: Attempted to generate graphql document for observeQuery. Please report this error.'
			);
	}

	const graphQLDocument = `${graphQLOperationType}${
		graphQLArguments
			? `(${Object.entries(graphQLArguments).map(
					([fieldName, type]) => `\$${fieldName}: ${type}`
			  )})`
			: ''
	} { ${graphQLFieldName}${
		graphQLArguments
			? `(${Object.keys(graphQLArguments).map(
					fieldName => `${fieldName}: \$${fieldName}`
			  )})`
			: ''
	} { ${graphQLSelectionSet} } }`;

	graphQLDocumentsCache.get(name)?.set(modelOperation, graphQLDocument);

	return graphQLDocument;
}

export function buildGraphQLVariables(
	modelDefinition: any,
	operation: ModelOperation,
	arg: any,
	modelIntrospection
): object {
	const {
		fields,
		primaryKeyInfo: {
			isCustomPrimaryKey,
			primaryKeyFieldName,
			sortKeyFieldNames,
		},
	} = modelDefinition;

	let variables: Record<string, any> = {};

	// TODO: process input
	switch (operation) {
		case 'CREATE':
			variables = {
				input: normalizeMutationInput(arg, modelDefinition, modelIntrospection),
			};
			break;
		case 'UPDATE':
			// readonly fields are not  updated
			variables = {
				input: Object.fromEntries(
					Object.entries(
						normalizeMutationInput(arg, modelDefinition, modelIntrospection)
					).filter(([fieldName]) => {
						const { isReadOnly } = fields[fieldName];

						return !isReadOnly;
					})
				),
			};
			break;
		case 'READ':
		case 'DELETE':
			// only identifiers are sent
			variables = isCustomPrimaryKey
				? [primaryKeyFieldName, ...sortKeyFieldNames].reduce(
						(acc, fieldName) => {
							acc[fieldName] = arg[fieldName];

							return acc;
						},
						{}
				  )
				: { [primaryKeyFieldName]: arg[primaryKeyFieldName] };

			if (operation === 'DELETE') {
				variables = { input: variables };
			}
			break;
		case 'LIST':
			if (arg?.filter) {
				variables.filter = arg.filter;
			}
			if (arg?.nextToken) {
				variables.nextToken = arg.nextToken;
			}
			if (arg?.limit) {
				variables.limit = arg.limit;
			}
			break;
		case 'ONCREATE':
		case 'ONUPDATE':
		case 'ONDELETE':
			if (arg?.filter) {
				variables = { filter: arg.filter };
			}
			break;
		case 'OBSERVE_QUERY':
			throw new Error(
				'Internal error: Attempted to build variables for observeQuery. Please report this error.'
			);
			break;
		default:
			const exhaustiveCheck: never = operation;
			throw new Error(`Unhandled operation case: ${exhaustiveCheck}`);
	}

	return variables;
}

/**
 * Iterates over mutation input values and resolves any model inputs to their corresponding join fields/values
 *
 * @example
 * ### Usage
 * ```ts
 * const result = normalizeMutationInput({ post: post }, model, modelDefinition);
 * ```
 * ### Result
 * ```ts
 * { postId: "abc123" }
 * ```
 *
 */
export function normalizeMutationInput(
	mutationInput: any,
	model: any,
	modelDefinition: any
): Record<string, unknown> {
	const { fields } = model;

	const normalized = {};

	Object.entries(mutationInput).forEach(([inputFieldName, inputValue]) => {
		const relatedModelName: string | undefined =
			fields[inputFieldName]?.type?.model;

		if (relatedModelName) {
			const association = fields[inputFieldName]?.association;
			const relatedModelDef = modelDefinition.models[relatedModelName];
			const relatedModelPkInfo = relatedModelDef.primaryKeyInfo;

			if (association.connectionType === connectionType.HAS_ONE) {
				association.targetNames.forEach((targetName, idx) => {
					const associatedFieldName = association.associatedWith[idx];
					normalized[targetName] = (inputValue as Record<string, unknown>)[
						associatedFieldName
					];
				});
			}

			if (association.connectionType === connectionType.BELONGS_TO) {
				association.targetNames.forEach((targetName, idx) => {
					if (idx === 0) {
						const associatedFieldName = relatedModelPkInfo.primaryKeyFieldName;
						normalized[targetName] = (inputValue as Record<string, unknown>)[
							associatedFieldName
						];
					} else {
						const associatedFieldName =
							relatedModelPkInfo.sortKeyFieldNames[idx - 1];
						normalized[targetName] = (inputValue as Record<string, unknown>)[
							associatedFieldName
						];
					}
				});
			}
		} else {
			normalized[inputFieldName] = inputValue;
		}
	});

	return normalized;
}

type AuthModeParams = {
	authMode?: GraphQLAuthMode;
	authToken?: string;
};

/**
 * Produces a parameter object that can contains auth mode/token overrides
 * only if present in either `options` (first) or configured on the `client`
 * as a fallback.
 *
 * @param client Configured client from `generateClient`
 * @param options Args/Options obect from call site.
 * @returns
 */
export function authModeParams(
	client: V6Client,
	options: AuthModeParams = {}
): AuthModeParams {
	return {
		authMode: options.authMode || client[__authMode],
		authToken: options.authToken || client[__authToken],
	};
}
