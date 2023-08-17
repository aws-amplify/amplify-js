// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ModelTypes } from '@aws-amplify/types-package-alpha';

type ListArgs = { selectionSet?: string[]; filter?: {} };

// TODO: this should accept single result to support CRUD methods; create helper for array/list
export function initializeModel(
	client: any,
	modelName: string,
	result: any[],
	modelIntrospection: any
): any[] {
	const introModel = modelIntrospection.models[modelName];
	const introModelFields = introModel.fields;

	const modelFields: string[] = Object.entries(introModelFields)
		.filter(([_, field]: [string, any]) => typeof field.type !== 'string')
		.map(([fieldName]) => fieldName);

	return result.map(record => {
		const initialized = {};

		for (const field of modelFields) {
			const relatedModel = introModelFields[field].type.model;
			const connectionField =
				introModelFields[field].association.associatedWith;
			// TODO: support sort key
			const parentPk = introModel.primaryKeyInfo.primaryKeyFieldName;

			initialized[field] = async () => {
				return client.models[relatedModel].list({
					filter: { [connectionField]: { eq: record[parentPk] } },
				});
			};
		}

		return { ...record, ...initialized };
	});
}

export const graphQLOperationsInfo = {
	CREATE: { operationPrefix: 'create' as const, usePlural: false },
	READ: { operationPrefix: 'get' as const, usePlural: false },
	UPDATE: { operationPrefix: 'update' as const, usePlural: false },
	DELETE: { operationPrefix: 'delete' as const, usePlural: false },
	LIST: { operationPrefix: 'list' as const, usePlural: true },
};
export type ModelOperation = keyof typeof graphQLOperationsInfo;

type OperationPrefix =
	(typeof graphQLOperationsInfo)[ModelOperation]['operationPrefix'];

const graphQLDocumentsCache = new Map<string, Map<ModelOperation, string>>();
const SELECTION_SET_ALL_NESTED = '*';

function defaultSelectionSetForModel(modelDefinition: any): string {
	const { fields } = modelDefinition;
	return Object.values<any>(fields)
		.map(({ type, name }) => typeof type === 'string' && name) // Default selection set omits model fields
		.filter(Boolean)
		.join(' ');
}

function generateSelectionSet(
	modelIntrospection: any,
	modelName: string,
	selectionSet?: string[]
) {
	const modelDefinition = modelIntrospection[modelName];
	const { fields } = modelDefinition;

	if (!selectionSet) {
		return defaultSelectionSetForModel(modelDefinition);
	}

	const selSet: string[] = [];

	for (const f of selectionSet) {
		const nested = f.includes('.');

		if (nested) {
			const [modelFieldName, selectedField] = f.split('.');

			const relatedModel = fields[modelFieldName]?.type?.model;

			if (!relatedModel) {
				// TODO: may need to change this to support custom types
				throw Error(`${modelFieldName} is not a model field`);
			}

			if (selectedField === SELECTION_SET_ALL_NESTED) {
				const relatedModelDefinition = modelIntrospection[relatedModel];
				const defaultSelectionSet = defaultSelectionSetForModel(
					relatedModelDefinition
				);

				if (fields[modelFieldName]?.isArray) {
					selSet.push(`${modelFieldName} { items { ${defaultSelectionSet} } }`);
				} else {
					selSet.push(`${modelFieldName} { ${defaultSelectionSet} }`);
				}
			}
		} else {
			const exists = Boolean(fields[f]);

			if (!exists) {
				throw Error(`${f} is not a field of model ${modelName}`);
			}

			selSet.push(f);
		}
	}

	return selSet.join(' ');
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
	let graphQLOperationType: 'mutation' | 'query' | undefined;
	let graphQLSelectionSet: string | undefined;
	let graphQLArguments: Record<string, any> | undefined;

	const selectionSetFields = generateSelectionSet(
		modelIntrospection,
		modelName,
		selectionSet
	);

	console.log('generated sel set', selectionSetFields);

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
				});
			graphQLOperationType ?? (graphQLOperationType = 'query');
			graphQLSelectionSet ??
				(graphQLSelectionSet = `items { ${selectionSetFields} }`);
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
	arg: any
): object {
	const {
		fields,
		primaryKeyInfo: {
			isCustomPrimaryKey,
			primaryKeyFieldName,
			sortKeyFieldNames,
		},
	} = modelDefinition;

	let variables = {};

	// TODO: process input
	switch (operation) {
		case 'CREATE':
			variables = { input: arg };
			break;
		case 'UPDATE':
			// readonly fields are not  updated
			variables = {
				input: Object.fromEntries(
					Object.entries(arg).filter(([fieldName]) => {
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
				variables = { filter: arg.filter };
			}
			break;
		default:
			const exhaustiveCheck: never = operation;
			throw new Error(`Unhandled operation case: ${exhaustiveCheck}`);
	}

	return variables;
}
