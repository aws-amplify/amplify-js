// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { resolveOwnerFields } from '../utils/resolveOwnerFields';
import {
	GraphQLAuthMode,
	ModelIntrospectionSchema,
	ModelFieldType,
	NonModelFieldType,
	SchemaModel,
	AssociationHasOne,
	AssociationBelongsTo,
} from '@aws-amplify/core/internals/utils';
import {
	AuthModeParams,
	ClientWithModels,
	ListArgs,
	QueryArgs,
	V6Client,
	V6ClientSSRRequest,
	__authMode,
	__authToken,
	__headers,
} from '../types';
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import { CustomHeaders } from '@aws-amplify/data-schema-types';
import { SchemaNonModel } from '@aws-amplify/core/dist/esm/singleton/API/types';
import type { IndexMeta } from './operations/indexQuery';

type LazyLoadOptions = {
	authMode?: GraphQLAuthMode;
	authToken?: string | undefined;
	limit?: number | undefined;
	nextToken?: string | undefined | null;
	headers?: CustomHeaders | undefined;
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
		if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
			if (value.items !== undefined) {
				res[prop] = value.items.map((item: Record<string, any>) =>
					flattenItems(item),
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
	client: ClientWithModels,
	modelName: string,
	result: any[],
	modelIntrospection: ModelIntrospectionSchema,
	authMode: GraphQLAuthMode | undefined,
	authToken: string | undefined,
	context = false,
): any[] {
	const introModel = modelIntrospection.models[modelName];
	const introModelFields = introModel.fields;

	const modelFields: string[] = Object.entries(introModelFields)
		.filter(([_, field]: [string, any]) => field?.type?.model !== undefined)
		.map(([fieldName]) => fieldName);

	return result.map(record => {
		const initializedRelationalFields: Record<string, any> = {};

		for (const fieldName of modelFields) {
			const modelField = introModelFields[fieldName];
			const modelFieldType = modelField?.type as ModelFieldType;

			const relatedModelName = modelFieldType.model;
			const relatedModel = modelIntrospection.models[relatedModelName!];

			const relatedModelPKFieldName =
				relatedModel.primaryKeyInfo.primaryKeyFieldName;

			const relatedModelSKFieldNames =
				relatedModel.primaryKeyInfo.sortKeyFieldNames;

			const relationType = modelField.association?.connectionType;

			let connectionFields: string[] = [];
			if (
				modelField.association &&
				'associatedWith' in modelField.association
			) {
				connectionFields = modelField.association.associatedWith;
			}

			let targetNames: string[] = [];
			if (modelField.association && 'targetNames' in modelField.association) {
				targetNames = modelField.association.targetNames;
			}

			switch (relationType) {
				case connectionType.HAS_ONE:
				case connectionType.BELONGS_TO:
					const sortKeyValues = relatedModelSKFieldNames.reduce(
						(acc: Record<string, any>, curVal) => {
							if (record[curVal]) {
								return (acc[curVal] = record[curVal]);
							}
						},
						{},
					);

					if (context) {
						initializedRelationalFields[fieldName] = (
							contextSpec: AmplifyServer.ContextSpec,
							options?: LazyLoadOptions,
						) => {
							if (record[targetNames[0]]) {
								return (
									client as V6ClientSSRRequest<Record<string, any>>
								).models[relatedModelName].get(
									contextSpec,
									{
										[relatedModelPKFieldName]: record[targetNames[0]],
										...sortKeyValues,
									},
									{
										authMode: options?.authMode || authMode,
										authToken: options?.authToken || authToken,
									},
								);
							}
							return undefined;
						};
					} else {
						initializedRelationalFields[fieldName] = (
							options?: LazyLoadOptions,
						) => {
							if (record[targetNames[0]]) {
								return (client as V6Client<Record<string, any>>).models[
									relatedModelName
								].get(
									{
										[relatedModelPKFieldName]: record[targetNames[0]],
										...sortKeyValues,
									},
									{
										authMode: options?.authMode || authMode,
										authToken: options?.authToken || authToken,
									},
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
					const relatedModelField = relatedModel.fields[connectionFields[0]];
					const relatedModelFieldType =
						relatedModelField.type as ModelFieldType;
					if (relatedModelFieldType.model) {
						let relatedTargetNames: string[] = [];
						if (
							relatedModelField.association &&
							'targetNames' in relatedModelField.association
						) {
							relatedTargetNames = relatedModelField.association?.targetNames;
						}

						const hasManyFilter: Record<string, any> = relatedTargetNames.map(
							(field, idx) => {
								if (idx === 0) {
									return { [field]: { eq: record[parentPk] } };
								}

								return { [field]: { eq: record[parentSK[idx - 1]] } };
							},
						);

						if (context) {
							initializedRelationalFields[fieldName] = (
								contextSpec: AmplifyServer.ContextSpec,
								options?: LazyLoadOptions,
							) => {
								if (record[parentPk]) {
									return (
										client as V6ClientSSRRequest<Record<string, any>>
									).models[relatedModelName].list(contextSpec, {
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
							initializedRelationalFields[fieldName] = (
								options?: LazyLoadOptions,
							) => {
								if (record[parentPk]) {
									return (client as V6Client<Record<string, any>>).models[
										relatedModelName
									].list({
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

					const hasManyFilter: Record<string, any> = connectionFields.map(
						(field, idx) => {
							if (idx === 0) {
								return { [field]: { eq: record[parentPk] } };
							}

							return { [field]: { eq: record[parentSK[idx - 1]] } };
						},
					);

					if (context) {
						initializedRelationalFields[fieldName] = (
							contextSpec: AmplifyServer.ContextSpec,
							options?: LazyLoadOptions,
						) => {
							if (record[parentPk]) {
								return (
									client as V6ClientSSRRequest<Record<string, any>>
								).models[relatedModelName].list(contextSpec, {
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
						initializedRelationalFields[fieldName] = (
							options?: LazyLoadOptions,
						) => {
							if (record[parentPk]) {
								return (client as V6Client<Record<string, any>>).models[
									relatedModelName
								].list({
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
	CREATE: { operationPrefix: 'create', usePlural: false },
	READ: { operationPrefix: 'get', usePlural: false },
	UPDATE: { operationPrefix: 'update', usePlural: false },
	DELETE: { operationPrefix: 'delete', usePlural: false },
	LIST: { operationPrefix: 'list', usePlural: true },
	INDEX_QUERY: { operationPrefix: '', usePlural: false },
	ONCREATE: { operationPrefix: 'onCreate', usePlural: false },
	ONUPDATE: { operationPrefix: 'onUpdate', usePlural: false },
	ONDELETE: { operationPrefix: 'onDelete', usePlural: false },
	OBSERVE_QUERY: { operationPrefix: 'observeQuery', usePlural: false },
} as const;
export type ModelOperation = keyof typeof graphQLOperationsInfo;

type OperationPrefix =
	(typeof graphQLOperationsInfo)[ModelOperation]['operationPrefix'];

const SELECTION_SET_WILDCARD = '*';

function defaultSelectionSetForNonModelWithIR(
	nonModelDefinition: SchemaNonModel,
	modelIntrospection: ModelIntrospectionSchema,
): Record<string, unknown> {
	const { fields } = nonModelDefinition;
	const mappedFields = Object.values(fields)
		.map(({ type, name }) => {
			if (typeof (type as { enum: string }).enum === 'string') {
				return [name, FIELD_IR];
			}

			if (typeof (type as NonModelFieldType).nonModel === 'string') {
				return [
					name,
					defaultSelectionSetForNonModelWithIR(
						modelIntrospection.nonModels[(type as NonModelFieldType).nonModel],
						modelIntrospection,
					),
				];
			}

			if (typeof type === 'string') {
				return [name, FIELD_IR];
			}

			return undefined;
		})
		.filter(
			(
				pair: (string | Record<string, unknown>)[] | undefined,
			): pair is (string | Record<string, unknown>)[] => pair !== undefined,
		);
	return Object.fromEntries(mappedFields);
}

function defaultSelectionSetForModel(modelDefinition: SchemaModel): string[] {
	// fields that are explicitly part of the graphql schema; not
	// inferred from owner auth rules.
	const { fields } = modelDefinition;
	const explicitFields = Object.values<any>(fields)
		// Default selection set omits model fields
		.map(({ type, name }) => {
			if (typeof type === 'string') return name;

			if (typeof type === 'object') {
				if (typeof type?.enum === 'string') {
					return name;
				} else if (typeof type?.nonModel === 'string') {
					return `${name}.${SELECTION_SET_WILDCARD}`;
				}
			}
		})
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
 * @param modelDefinitions
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
	modelIntrospection: ModelIntrospectionSchema,
	modelName: string,
	selectionSet: string[],
): Record<string, string | object> {
	const dotNotationToObject = (path: string, modelOrNonModelName: string) => {
		const [fieldName, ...rest] = path.split('.');

		const nested = rest[0];
		const modelOrNonModelDefinition =
			modelIntrospection.models[modelOrNonModelName] ??
			modelIntrospection.nonModels[modelOrNonModelName];

		const modelOrNonModelFields = modelOrNonModelDefinition?.fields;
		const relatedModel = (
			modelOrNonModelFields?.[fieldName]?.type as ModelFieldType
		)?.model;

		const relatedModelDefinition = modelIntrospection.models[relatedModel];
		const relatedNonModel = (
			modelOrNonModelFields?.[fieldName]?.type as NonModelFieldType
		)?.nonModel;
		const relatedNonModelDefinition =
			modelIntrospection.nonModels[relatedNonModel];

		const isModelOrNonModelOrFieldType = relatedModelDefinition
			? 'model'
			: relatedNonModelDefinition
				? 'nonModel'
				: 'field';

		if (isModelOrNonModelOrFieldType === 'nonModel') {
			let result: Record<string, any> = {};

			if (!nested) {
				throw Error(
					`${fieldName} must declare a wildcard (*) or a field of custom type ${relatedNonModel}`,
				);
			}

			if (nested === SELECTION_SET_WILDCARD) {
				result = {
					[fieldName]: defaultSelectionSetForNonModelWithIR(
						relatedNonModelDefinition,
						modelIntrospection,
					),
				};
			} else {
				result = {
					[fieldName]: dotNotationToObject(rest.join('.'), relatedNonModel),
				};
			}

			return result;
		} else if (isModelOrNonModelOrFieldType === 'model') {
			let result: Record<string, any> = {};

			if (!nested) {
				throw Error(
					`${fieldName} must declare a wildcard (*) or a field of model ${relatedModel}`,
				);
			}

			if (nested === SELECTION_SET_WILDCARD) {
				const relatedModelDefinition = modelIntrospection.models[relatedModel];

				result = {
					[fieldName]: modelsDefaultSelectionSetIR(relatedModelDefinition),
				};
			} else {
				result = {
					[fieldName]: dotNotationToObject(rest.join('.'), relatedModel),
				};
			}

			if (modelOrNonModelFields[fieldName]?.isArray) {
				result = {
					[fieldName]: {
						items: result[fieldName],
					},
				};
			}

			return result;
		} else {
			const modelField = modelOrNonModelFields?.[fieldName];

			const nonModelDefinition =
				modelIntrospection.nonModels[modelOrNonModelName];
			const nonModelField = nonModelDefinition?.fields?.[fieldName];

			if (!nonModelDefinition) {
				const isOwnerField = resolveOwnerFields(
					modelOrNonModelDefinition,
				).includes(fieldName);

				if (!modelField && !isOwnerField) {
					throw Error(
						`${fieldName} is not a field of model ${modelOrNonModelName}`,
					);
				}
			} else {
				if (!nonModelField) {
					throw Error(
						`${fieldName} is not a field of custom type ${modelOrNonModelName}`,
					);
				}
			}

			return { [fieldName]: FIELD_IR };
		}
	};

	return selectionSet.reduce(
		(resultObj, path) =>
			deepMergeSelectionSetObjects(
				dotNotationToObject(path, modelName),
				resultObj,
			),
		{} as Record<string, any>,
	);
}

const modelsDefaultSelectionSetIR = (relatedModelDefinition: SchemaModel) => {
	const defaultSelectionSet = defaultSelectionSetForModel(
		relatedModelDefinition,
	);

	const reduced = defaultSelectionSet.reduce(
		(acc: Record<string, any>, curVal) => {
			acc[curVal] = FIELD_IR;
			return acc;
		},
		{},
	);

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
	obj: Record<string, string | any>,
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
					'}',
				);
			} else {
				res.push(fieldName, '{', selectionSetIRToString(value), '}');
			}
		}
	});

	return res.join(' ');
}

/**
 * Recursively merges selection set objects from `source` onto `target`.
 *
 * `target` will be updated. `source` will be left alone.
 *
 * @param source The object to merge into target.
 * @param target The object to be mutated.
 */
function deepMergeSelectionSetObjects<T extends Record<string, any>>(
	source: T,
	target: T,
) {
	const isObject = (obj: any) => obj && typeof obj === 'object';

	for (const key in source) {
		// This verification avoids 'Prototype Pollution' issue
		if (!source.hasOwnProperty(key)) continue;

		if (target.hasOwnProperty(key) && isObject(target[key])) {
			deepMergeSelectionSetObjects(source[key], target[key]);
		} else {
			target[key] = source[key];
		}
	}

	return target;
}

export function generateSelectionSet(
	modelIntrospection: ModelIntrospectionSchema,
	modelName: string,
	selectionSet?: string[],
) {
	const modelDefinition = modelIntrospection.models[modelName];

	const selSetIr = customSelectionSetToIR(
		modelIntrospection,
		modelName,
		selectionSet ?? defaultSelectionSetForModel(modelDefinition),
	);
	const selSetString = selectionSetIRToString(selSetIr);

	return selSetString;
}

export function generateGraphQLDocument(
	modelIntrospection: ModelIntrospectionSchema,
	modelName: string,
	modelOperation: ModelOperation,
	listArgs?: ListArgs | QueryArgs,
	indexMeta?: IndexMeta,
): string {
	const modelDefinition = modelIntrospection.models[modelName];

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

	let graphQLFieldName;
	let indexQueryArgs: Record<string, string>;

	if (operationPrefix) {
		graphQLFieldName = `${operationPrefix}${usePlural ? pluralName : name}`;
	} else if (indexMeta) {
		const { queryField, pk, sk = [] } = indexMeta;
		graphQLFieldName = queryField;

		const skQueryArgs = sk.reduce((acc: Record<string, any>, fieldName) => {
			const fieldType = fields[fieldName].type;
			acc[fieldName] = `Model${fieldType}KeyConditionInput`;
			return acc;
		}, {});

		indexQueryArgs = {
			[pk]: `${fields[pk].type}!`,
			...skQueryArgs,
		};
	} else {
		throw new Error(
			'Error generating GraphQL Document - invalid operation name',
		);
	}

	let graphQLOperationType: 'mutation' | 'query' | 'subscription' | undefined;
	let graphQLSelectionSet: string | undefined;
	let graphQLArguments: Record<string, any> | undefined;

	const selectionSetFields = generateSelectionSet(
		modelIntrospection,
		modelName,
		selectionSet as ListArgs['selectionSet'],
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
							(acc: Record<string, any>, fieldName) => {
								acc[fieldName] = `${fields[fieldName].type}!`;

								return acc;
							},
							{},
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
		case 'INDEX_QUERY':
			graphQLArguments ??
				(graphQLArguments = {
					...indexQueryArgs!,
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
				'Internal error: Attempted to generate graphql document for observeQuery. Please report this error.',
			);
	}

	const graphQLDocument = `${graphQLOperationType}${
		graphQLArguments
			? `(${Object.entries(graphQLArguments).map(
					([fieldName, type]) => `\$${fieldName}: ${type}`,
				)})`
			: ''
	} { ${graphQLFieldName}${
		graphQLArguments
			? `(${Object.keys(graphQLArguments).map(
					fieldName => `${fieldName}: \$${fieldName}`,
				)})`
			: ''
	} { ${graphQLSelectionSet} } }`;

	return graphQLDocument;
}

export function buildGraphQLVariables(
	modelDefinition: SchemaModel,
	operation: ModelOperation,
	arg: QueryArgs | undefined,
	modelIntrospection: ModelIntrospectionSchema,
	indexMeta?: IndexMeta,
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
				input: arg
					? normalizeMutationInput(arg, modelDefinition, modelIntrospection)
					: {},
			};
			break;
		case 'UPDATE':
			// readonly fields are not  updated
			variables = {
				input: arg
					? Object.fromEntries(
							Object.entries(
								normalizeMutationInput(
									arg,
									modelDefinition,
									modelIntrospection,
								),
							).filter(([fieldName]) => {
								const { isReadOnly } = fields[fieldName];

								return !isReadOnly;
							}),
						)
					: {},
			};
			break;
		case 'READ':
		case 'DELETE':
			// only identifiers are sent
			if (arg) {
				variables = isCustomPrimaryKey
					? [primaryKeyFieldName, ...sortKeyFieldNames].reduce(
							(acc: Record<string, any>, fieldName) => {
								acc[fieldName] = arg[fieldName];

								return acc;
							},
							{},
						)
					: { [primaryKeyFieldName]: arg[primaryKeyFieldName] };
			}

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
		case 'INDEX_QUERY':
			const { pk, sk = [] } = indexMeta!;

			variables[pk] = arg![pk];

			for (const skField of sk) {
				variables[skField] = arg![skField];
			}

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
				'Internal error: Attempted to build variables for observeQuery. Please report this error.',
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
	mutationInput: QueryArgs,
	model: SchemaModel,
	modelIntrospection: ModelIntrospectionSchema,
): QueryArgs {
	const { fields } = model;

	const normalized: Record<string, unknown> = {};

	Object.entries(mutationInput).forEach(([inputFieldName, inputValue]) => {
		const fieldType = fields[inputFieldName]?.type as ModelFieldType;
		const relatedModelName = fieldType?.model;

		if (relatedModelName) {
			const association = fields[inputFieldName]?.association;
			const relatedModelDef = modelIntrospection.models[relatedModelName];
			const relatedModelPkInfo = relatedModelDef.primaryKeyInfo;

			if (association?.connectionType === connectionType.HAS_ONE) {
				const associationHasOne = association as AssociationHasOne;
				associationHasOne.targetNames.forEach((targetName, idx) => {
					const associatedFieldName = associationHasOne.associatedWith[idx];
					normalized[targetName] = (inputValue as Record<string, unknown>)[
						associatedFieldName
					];
				});
			}

			if (association?.connectionType === connectionType.BELONGS_TO) {
				const associationBelongsTo = association as AssociationBelongsTo;
				associationBelongsTo.targetNames.forEach((targetName, idx) => {
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

/**
 * Produces a parameter object that can contains auth mode/token overrides
 * only if present in either `options` (first) or configured on the `client`
 * as a fallback.
 *
 * @param client Configured client from `generateClient`
 * @param options Args/Options object from call site.
 * @returns
 */
export function authModeParams(
	client: ClientWithModels,
	options: AuthModeParams = {},
): AuthModeParams {
	return {
		authMode: options.authMode || client[__authMode],
		authToken: options.authToken || client[__authToken],
	};
}

/**
 * Retrieves custom headers from either the client or request options.
 * @param {client} V6Client | V6ClientSSRRequest | V6ClientSSRCookies - for extracting client headers
 * @param {requestHeaders} [CustomHeaders] - request headers
 * @returns {CustomHeaders} - custom headers
 */
export function getCustomHeaders(
	client: V6Client | ClientWithModels,
	requestHeaders?: CustomHeaders,
): CustomHeaders {
	let headers: CustomHeaders = client[__headers] || {};

	// Individual request headers will take precedence over client headers.
	// We intentionally do *not* merge client and request headers.
	if (requestHeaders) {
		headers = requestHeaders;
	}

	return headers;
}
