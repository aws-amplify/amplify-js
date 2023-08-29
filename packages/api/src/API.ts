// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSAppSyncRealTimeProvider } from '@aws-amplify/pubsub';
import {
	GraphQLOptions,
	GraphQLResult,
	GraphQLQuery,
	GraphQLSubscription,
} from '@aws-amplify/api-graphql';
import { graphql as v6graphql } from '@aws-amplify/api-graphql/internals';
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { InternalAPIClass } from './internals/InternalAPI';
import type { ModelTypes } from '@aws-amplify/types-package-alpha';

const logger = new Logger('API');
/**
 * @deprecated
 * Use RestApi or GraphQLAPI to reduce your application bundle size
 * Export Cloud Logic APIs
 */
export class APIClass extends InternalAPIClass {
	public getModuleName() {
		return 'API';
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param options - GraphQL Options
	 * @param [additionalHeaders] - headers to merge in after any `graphql_headers` set in the config
	 * @returns An Observable if queryType is 'subscription', else a promise of the graphql result from the query.
	 */
	graphql<T>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): T extends GraphQLQuery<T>
		? Promise<GraphQLResult<T>>
		: T extends GraphQLSubscription<T>
		? Observable<{
				provider: AWSAppSyncRealTimeProvider;
				value: GraphQLResult<T>;
		  }>
		: Promise<GraphQLResult<any>> | Observable<object>;
	graphql<T = any>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): Promise<GraphQLResult<any>> | Observable<object> {
		return super.graphql(options, additionalHeaders);
	}

	/**
	 * Generates an API client that can work with models or raw GraphQL
	 */
	generateClient<T extends Record<any, any> = never>(): V6Client<T> {
		const config = super.configure({});

		const { modelIntrospection } = config;

		const client: V6Client<any> = {
			graphql: v6graphql,
			models: {},
		};

		for (const model of Object.values(modelIntrospection.models)) {
			const { name } = model as any;

			client.models[name] = {} as any;

			Object.entries(graphQLOperationsInfo).forEach(
				([key, { operationPrefix }]) => {
					const operation = key as ModelOperation;

					// e.g. clients.models.Todo.update
					client.models[name][operationPrefix] = async (arg?: any) => {
						const query = generateGraphQLDocument(model, operation);
						const variables = buildGraphQLVariables(model, operation, arg);

						const res = (await this.graphql({
							query,
							variables,
						})) as any;

						// flatten response
						if (res.data !== undefined) {
							const [key] = Object.keys(res.data);

							if (res.data[key].items) {
								return res.data[key].items;
							}

							return res.data[key];
						}

						return res;
					};
				}
			);
		}

		return client as V6Client<T>;
	}
}

const graphQLOperationsInfo = {
	CREATE: { operationPrefix: 'create' as const, usePlural: false },
	READ: { operationPrefix: 'get' as const, usePlural: false },
	UPDATE: { operationPrefix: 'update' as const, usePlural: false },
	DELETE: { operationPrefix: 'delete' as const, usePlural: false },
	LIST: { operationPrefix: 'list' as const, usePlural: true },
};
type ModelOperation = keyof typeof graphQLOperationsInfo;
type OperationPrefix =
	(typeof graphQLOperationsInfo)[ModelOperation]['operationPrefix'];

const graphQLDocumentsCache = new Map<string, Map<ModelOperation, string>>();

function generateGraphQLDocument(
	modelDefinition: any,
	modelOperation: ModelOperation
): string {
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

	const selectionSetFields = Object.values<any>(fields)
		.map(({ type, name }) => typeof type === 'string' && name) // Only scalars for now
		.filter(Boolean)
		.join(' ');

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

function buildGraphQLVariables(
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
			break;
		default:
			const exhaustiveCheck: never = operation;
			throw new Error(`Unhandled operation case: ${exhaustiveCheck}`);
	}

	return variables;
}

type FilteredKeys<T> = {
	[P in keyof T]: T[P] extends never ? never : P;
}[keyof T];
type ExcludeNeverFields<O> = {
	[K in FilteredKeys<O>]: O[K];
};

// If no T is passed, ExcludeNeverFields removes "models" from the client
declare type V6Client<T extends Record<any, any> = never> = ExcludeNeverFields<{
	graphql: typeof v6graphql;
	models: ModelTypes<T>;
}>;

export const API = new APIClass(null);
Amplify.register(API);
