// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable } from 'rxjs';
import { InternalAPI } from '@aws-amplify/api/internals';
import { clearGlobalContext } from '@aws-amplify/core/internals/utils';
import type { GraphQLOptions } from '@aws-amplify/api-graphql';

/**
 * These tests lock in the contract that `InternalAPI.graphql()` must NEVER
 * throw synchronously when no global Amplify context is set. `InternalAPI` is
 * consumed exclusively by DataStore, whose processors expect setup errors to
 * arrive on the async boundary:
 *   - query / mutation -> a rejected Promise
 *   - subscription      -> the Observable's error channel
 *
 * We only manipulate the GLOBAL context here (via `clearGlobalContext`) and
 * exercise the real `InternalAPI` internals — nothing internal is mocked.
 */
describe('InternalAPI (DataStore-only shim)', () => {
	const MISSING_CONTEXT_ERROR = 'No AmplifyContext available';

	beforeEach(() => {
		// Ensure there is NO global context for these assertions.
		clearGlobalContext();
	});

	it('exposes the expected module name', () => {
		expect(InternalAPI.getModuleName()).toBe('InternalAPI');
	});

	it('delegates getGraphqlOperationType to the underlying GraphQL API', () => {
		expect(
			InternalAPI.getGraphqlOperationType('query Q { field }'),
		).toBe('query');
	});

	describe('query / mutation with no global context', () => {
		it.each(['query Q { field }', 'mutation M { field }'])(
			'does not throw synchronously and rejects for %p',
			async operation => {
				// The call expression itself MUST NOT throw.
				expect(() => {
					void (
						InternalAPI.graphql({ query: operation }) as Promise<unknown>
					).catch(() => {
						// swallow — asserted below
					});
				}).not.toThrow();

				await expect(
					InternalAPI.graphql({ query: operation }) as Promise<unknown>,
				).rejects.toThrow(MISSING_CONTEXT_ERROR);
			},
		);
	});

	describe('subscription with no global context', () => {
		it('returns an Observable and does not throw synchronously', () => {
			expect(() =>
				InternalAPI.graphql({
					query: 'subscription S { onCreate { id } }',
				}),
			).not.toThrow();

			expect(
				InternalAPI.graphql({
					query: 'subscription S { onCreate { id } }',
				}),
			).toBeInstanceOf(Observable);
		});

		it('surfaces the missing-context error on the Observable error channel', async () => {
			const observable = InternalAPI.graphql({
				query: 'subscription S { onCreate { id } }',
			}) as Observable<object>;

			const error = await new Promise<Error>((resolve, reject) => {
				observable.subscribe({
					next: () => reject(new Error('unexpected next emission')),
					error: resolve,
					complete: () => reject(new Error('unexpected completion')),
				});
			});

			expect(error.message).toContain(MISSING_CONTEXT_ERROR);
		});
	});

	describe('DocumentNode queries', () => {
		it('resolves the operation type from a DocumentNode and still defers context', async () => {
			// Hand-built AST fixture (DataStore passes strings, but the option type
			// also permits a DocumentNode).
			const documentNodeQuery = {
				kind: 'Document',
				definitions: [
					{
						kind: 'OperationDefinition',
						operation: 'query',
						selectionSet: { kind: 'SelectionSet', selections: [] },
					},
				],
			} as unknown as GraphQLOptions['query'];

			await expect(
				InternalAPI.graphql({ query: documentNodeQuery }) as Promise<unknown>,
			).rejects.toThrow(MISSING_CONTEXT_ERROR);
		});

		it('throws for a DocumentNode without an operation definition', () => {
			const documentNodeWithoutOperation = {
				kind: 'Document',
				definitions: [{ kind: 'FragmentDefinition' }],
			} as unknown as GraphQLOptions['query'];

			expect(() =>
				InternalAPI.graphql({ query: documentNodeWithoutOperation }),
			).toThrow('invalid operation: no operation definition found');
		});
	});
});
