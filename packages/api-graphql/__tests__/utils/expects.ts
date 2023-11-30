import { CustomHeaders } from '@aws-amplify/data-schema-types';

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
	item: Record<string, any>
) {
	expect(spy).toHaveBeenCalledWith({
		abortController: expect.any(AbortController),
		url: new URL('https://localhost/graphql'),
		options: expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(
					`${opName}(input: $input, condition: $condition)`
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
	item: Record<string, any>
) {
	expect(spy).toHaveBeenCalledWith({
		abortController: expect.any(AbortController),
		url: new URL('https://localhost/graphql'),
		options: expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(`${opName}(id: $id)`),
				variables: expect.objectContaining(item),
			}),
		}),
	});
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
	item: Record<string, any>
) {
	expect(spy).toHaveBeenCalledWith({
		abortController: expect.any(AbortController),
		url: new URL('https://localhost/graphql'),
		options: expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(
					`${opName}(filter: $filter, limit: $limit, nextToken: $nextToken)`
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
	item: Record<string, any>
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
		}
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
	headers?: CustomHeaders
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
		}
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
	item: Record<string, any>
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
		}
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
 * @param graphql_headers TODO
 */
export function expectSubWithTodo(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>,
	headers?: CustomHeaders
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
			graphql_headers: expect.any(Function),
		}),
		{
			action: '1',
			category: 'api',
		}
	);
}
