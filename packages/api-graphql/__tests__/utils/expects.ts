import { parse, print, DocumentNode } from 'graphql';
import { CustomHeaders } from '@aws-amplify/data-schema-types';
import { Amplify } from 'aws-amplify';

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given mutation `opName` and `item`.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `createTodo`.
 * @param item The item we expect to have been in the `input`
 */
export function expectMutation(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
) {
	expect(spy).toHaveBeenCalledWith({
		abortController: expect.any(AbortController),
		url: new URL('https://localhost/graphql'),
		options: expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(
					`${opName}(input: $input, condition: $condition)`,
				),
				variables: expect.objectContaining({
					input: expect.objectContaining(item),
				}),
			}),
		}),
	});
}

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given get `opName` and `item`.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `getTodo`.
 * @param item The item we expect to have been in the `variables`
 */
export function expectGet(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
) {
	expect(spy).toHaveBeenCalledWith(
		expect.objectContaining({
			Auth: expect.any(Object),
			configure: expect.any(Function),
			getConfig: expect.any(Function),
		}),
		{
			abortController: expect.any(AbortController),
			url: new URL('https://localhost/graphql'),
			options: expect.objectContaining({
				headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
				body: expect.objectContaining({
					query: expect.stringContaining(`${opName}(id: $id)`),
					variables: expect.objectContaining(item),
				}),
			}),
		},
	);
}

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given list `opName` and `item`.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `listTodos`.
 * @param item The item we expect to have been in the `variables`
 */
export function expectList(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
) {
	expect(spy).toHaveBeenCalledWith({
		abortController: expect.any(AbortController),
		url: new URL('https://localhost/graphql'),
		options: expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(
					`${opName}(filter: $filter, limit: $limit, nextToken: $nextToken)`,
				),
				variables: expect.objectContaining(item),
			}),
		}),
	});
}

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given subscription `opName` and `item`.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `onCreateTodo`.
 * @param item The item we expect to have been in the `variables`
 */
export function expectSub(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
) {
	expect(spy).toHaveBeenCalledWith(
		expect.objectContaining({
			authenticationType: 'apiKey',
			apiKey: 'FAKE-KEY',
			appSyncGraphqlEndpoint: 'https://localhost/graphql',
			// Code-gen'd queries have an owner param; TypeBeast queries don't:
			query: expect.stringContaining(`${opName}(filter: $filter`),
			variables: expect.objectContaining(item),
		}),
		{
			action: '1',
			category: 'api',
		},
	);
}

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given subscription `opName` and `item`.
 * Used specifically for testing subscriptions with additional headers.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `onCreateTodo`.
 * @param item The item we expect to have been in the `variables`
 * @param headers Any additional headers we expect to have been in the `additionalHeaders`
 */
export function expectSubWithHeaders(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
	headers?: CustomHeaders,
) {
	expect(spy).toHaveBeenCalledWith(
		expect.objectContaining({
			authenticationType: 'apiKey',
			apiKey: 'FAKE-KEY',
			appSyncGraphqlEndpoint: 'https://localhost/graphql',
			// Code-gen'd queries have an owner param; TypeBeast queries don't:
			query: expect.stringContaining(`${opName}(filter: $filter`),
			variables: expect.objectContaining(item),
			additionalHeaders: expect.objectContaining(headers),
		}),
		{
			action: '1',
			category: 'api',
		},
	);
}

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given subscription `opName` and `item`.
 * Used specifically for testing subscriptions with additional headers.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `onCreateTodo`.
 * @param item The item we expect to have been in the `variables`
 */
export function expectSubWithHeadersFn(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
) {
	expect(spy).toHaveBeenCalledWith(
		expect.objectContaining({
			authenticationType: 'apiKey',
			apiKey: 'FAKE-KEY',
			appSyncGraphqlEndpoint: 'https://localhost/graphql',
			// Code-gen'd queries have an owner param; TypeBeast queries don't:
			query: expect.stringContaining(`${opName}(filter: $filter`),
			variables: expect.objectContaining(item),
			additionalHeaders: expect.any(Function),
		}),
		{
			action: '1',
			category: 'api',
		},
	);
}

/**
 * Performs an `expect()` on a jest spy with some basic nested argument checks
 * based on the given subscription `opName` and `item`.
 * Used specifically for testing subscriptions with additional headers.
 *
 * @param spy The jest spy to check.
 * @param opName The name of the graphql operation. E.g., `onCreateTodo`.
 * @param item The item we expect to have been in the `variables`
 * @param libraryConfigHeaders TODO
 */
export function expectSubWithlibraryConfigHeaders(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
	headers?: CustomHeaders,
) {
	expect(spy).toHaveBeenCalledWith(
		expect.objectContaining({
			authenticationType: 'apiKey',
			apiKey: 'FAKE-KEY',
			appSyncGraphqlEndpoint: 'https://localhost/graphql',
			// Code-gen'd queries have an owner param; TypeBeast queries don't:
			query: expect.stringContaining(`${opName}(filter: $filter`),
			variables: expect.objectContaining(item),
			additionalHeaders: expect.objectContaining(headers),
			// `headers` that are included in `Amplify.configure` options
			libraryConfigHeaders: expect.any(Function),
		}),
		{
			action: '1',
			category: 'api',
		},
	);
}

/**
 *
 * @param spy a GraphQL.api._post spy
 * @returns
 */
export function extractCallDetails(spy: jest.SpyInstance) {
	return spy.mock.calls.map((call: any) => {
		const [
			amplify,
			{
				abortController,
				options: {
					body: { query, variables },
				},
				headers,
			},
		] = call;
		return { abortController, query, variables, headers };
	});
}

/**
 * Given the plural name of a model, find the singular name.
 *
 * Assumes `Amplify.configure()` has already called with a config
 * holding a valid `modelIntrospection` schema.
 *
 * @param pluralName plural name of model (e.g. "Todos")
 * @returns singular name of model (e.g. "Todo")
 */
export function findSingularName(pluralName: string): string {
	const config = Amplify.getConfig();
	const model = Object.values(
		config.API?.GraphQL?.modelIntrospection?.models || {},
	).find(m => m.pluralName === pluralName);
	if (!model) throw new Error(`No model found for plural name ${pluralName}`);
	return model.name;
}

/**
 * Parses a graphql query into the core components we need to valid
 * in testing.
 *
 * @param query graphql query or DocumentNode
 * @returns
 */
export function parseQuery(query: string | DocumentNode) {
	const q: any =
		typeof query === 'string'
			? parse(query).definitions[0]
			: parse(print(query)).definitions[0];

	const operation: string = q.operation;
	const selections = q.selectionSet.selections[0];
	const selection: string = selections.name.value;
	const type = selection.match(
		/^(create|update|delete|sync|get|list|onCreate|onUpdate|onDelete)(\w+)$/,
	)?.[1] as string;

	let table: string;
	// `selection` here could be `syncTodos` or `syncCompositePKChildren`
	if (type === 'sync' || type === 'list') {
		// e.g. `Models`
		const pluralName = selection.match(
			/^(create|sync|get|list)([A-Za-z]+)$/,
		)?.[2] as string;
		table = findSingularName(pluralName);
	} else {
		table = selection.match(
			/^(create|update|delete|sync|get|list|onCreate|onUpdate|onDelete)(\w+)$/,
		)?.[2] as string;
	}

	const selectionSet: string[] =
		operation === 'query' && type === 'list'
			? selections?.selectionSet?.selections[0]?.selectionSet?.selections?.map(
					(i: any) => i.name.value,
				)
			: selections?.selectionSet?.selections?.map((i: any) => i.name.value);

	return { operation, selection, type, table, selectionSet };
}

/**
 *
 * @param spy a GraphQLAPI._api.post spy
 * @param fields
 * @param requestIndex
 */
export function expectSelectionSetContains(
	spy: jest.SpyInstance,
	fields: string[],
	requestIndex = 0,
) {
	const { query } = extractCallDetails(spy)[requestIndex];
	const { selectionSet } = parseQuery(query);
	expect(fields.every(f => selectionSet.includes(f))).toBe(true);
}

/**
 *
 * @param spy a GraphQL._api.post spy
 * @param fields
 * @param requestIndex
 */
export function expectSelectionSetNotContains(
	spy: jest.SpyInstance,
	fields: string[],
	requestIndex = 0,
) {
	const { query } = extractCallDetails(spy)[requestIndex];
	const { selectionSet } = parseQuery(query);
	expect(fields.every(f => !selectionSet.includes(f))).toBe(true);
}

/**
 *
 * @param spy A GraphQL._api.post spy
 * @param expectedVariables
 * @param requestIndex
 */
export function expectVariables(
	spy: jest.SpyInstance,
	expectedVariables: Record<string, any>,
	requestIndex = 0,
) {
	const { variables } = extractCallDetails(spy)[requestIndex];
	expect(variables).toEqual(expectedVariables);
}
