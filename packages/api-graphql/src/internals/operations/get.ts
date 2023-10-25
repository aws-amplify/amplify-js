import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
} from '../APIClient';

export function getFactory(
	client,
	modelIntrospection,
	model,
	operation,
	context = false
) {
	const getWithContext = async (contextSpec, arg?: any, options?: any) => {
		const clientWithContext = (options, additionalHeaders?) => {
			return client.graphql(contextSpec, options, additionalHeaders);
		};
		return _get(
			clientWithContext,
			modelIntrospection,
			model,
			arg,
			options,
			operation
		);
	};

	const get = async (arg?: any, options?: any) => {
		return _get(
			client.graphql,
			modelIntrospection,
			model,
			arg,
			options,
			operation
		);
	};
	return context ? getWithContext : get;
}

async function _get(
	graphql,
	modelIntrospection,
	model,
	arg,
	options,
	operation
) {
	const { name } = model as any;

	const query = generateGraphQLDocument(
		modelIntrospection.models,
		name,
		operation,
		options
	);
	const variables = buildGraphQLVariables(
		model,
		operation,
		arg,
		modelIntrospection
	);

	try {
		const { data, extensions } = (await graphql({
			query,
			variables,
		})) as any;

		// flatten response
		if (data !== undefined) {
			const [key] = Object.keys(data);
			const flattenedResult = flattenItems(data)[key];

			if (options?.selectionSet) {
				return { data: flattenedResult, extensions };
			} else {
				// TODO: refactor to avoid destructuring here
				const [initialized] = initializeModel(
					client,
					name,
					[flattenedResult],
					modelIntrospection
				);

				return { data: initialized, extensions };
			}
		} else {
			return { data: null, extensions };
		}
	} catch (error) {
		if (error.errors) {
			// graphql errors pass through
			return error as any;
		} else {
			// non-graphql errors re re-thrown
			throw error;
		}
	}
}
