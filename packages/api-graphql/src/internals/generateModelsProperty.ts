import { ModelTypes } from '@aws-amplify/amplify-api-next-types-alpha';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	graphQLOperationsInfo,
	ModelOperation,
} from './APIClient';
import { ClientGenerationParams } from './types';
import { V6Client } from '../types';

export function generateModelsProperty<T extends Record<any, any> = never>(
	client: V6Client,
	params: ClientGenerationParams
): ModelTypes<T> {
	const models = {} as any;
	const { modelIntrospection } = params.amplify.getConfig() as any;

	console.log('config', params.amplify.getConfig());

	// TODO: refactor this to use separate methods for each CRUDL.
	// Doesn't make sense to gen the methods dynamically given the different args and return values
	for (const model of Object.values(modelIntrospection.models)) {
		const { name } = model as any;

		models[name] = {} as any;

		Object.entries(graphQLOperationsInfo).forEach(
			([key, { operationPrefix }]) => {
				const operation = key as ModelOperation;

				if (operation === 'LIST') {
					models[name][operationPrefix] = async (args?: any) => {
						const query = generateGraphQLDocument(
							modelIntrospection.models,
							name,
							'LIST',
							args
						);
						const variables = buildGraphQLVariables(
							model,
							'LIST',
							args,
							modelIntrospection
						);

						console.log('API list', query, variables);

						const res = (await this.graphql({
							query,
							variables,
						})) as any;

						// flatten response
						if (res.data !== undefined) {
							const [key] = Object.keys(res.data);

							if (res.data[key].items) {
								const flattenedResult = res.data[key].items;

								// don't init if custom selection set
								if (args?.selectionSet) {
									return flattenedResult;
								} else {
									const initialized = initializeModel(
										client,
										name,
										flattenedResult,
										modelIntrospection
									);

									console.log('initialized', initialized);

									return initialized;
								}
							}

							return res.data[key];
						}

						return res as any;
					};
				} else {
					models[name][operationPrefix] = async (arg?: any, options?: any) => {
						const query = generateGraphQLDocument(
							modelIntrospection.models,
							name,
							operation
						);
						const variables = buildGraphQLVariables(
							model,
							operation,
							arg,
							modelIntrospection
						);

						console.log(`API ${operationPrefix}`, query, variables);

						const res = (await this.graphql({
							query,
							variables,
						})) as any;

						// flatten response
						if (res.data !== undefined) {
							const [key] = Object.keys(res.data);

							// TODO: refactor to avoid destructuring here
							const [initialized] = initializeModel(
								client,
								name,
								[res.data[key]],
								modelIntrospection
							);

							return initialized;
						}

						return res;
					};
				}
			}
		);
	}

	return models;
}
