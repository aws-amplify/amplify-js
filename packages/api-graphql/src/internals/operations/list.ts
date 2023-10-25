import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
} from '../APIClient';

export function listFactory(
	client,
	modelIntrospection,
	model,
	context = false
) {
	const listWithContext = async (contextSpec, args?: any) => {
		const clientWithContext = (options, additionalHeaders?) => {
			return client.graphql(contextSpec, options, additionalHeaders);
		};
		return _list(clientWithContext, modelIntrospection, model, args);
	};

	const list = async (args?: any) => {
		return _list(client.graphql, modelIntrospection, model, args);
	};

	return context ? listWithContext : list;
}

async function _list(graphql, modelIntrospection, model, args) {
	const { name } = model as any;

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

	try {
		const { data, nextToken, extensions } = (await graphql({
			query,
			variables,
		})) as any;

		// flatten response
		if (data !== undefined) {
			const [key] = Object.keys(data);

			if (data[key].items) {
				const flattenedResult = flattenItems(data)[key];

				// don't init if custom selection set
				if (args?.selectionSet) {
					return {
						data: flattenedResult,
						nextToken,
						extensions,
					};
				} else {
					const initialized = initializeModel(
						client,
						name,
						flattenedResult,
						modelIntrospection
					);

					return {
						data: initialized,
						nextToken,
						extensions,
					};
				}
			}

			return {
				data: data[key],
				nextToken,
				extensions,
			};
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
