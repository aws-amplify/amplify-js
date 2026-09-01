import {
	MockAmplifyContext,
	createMockAmplifyContext,
} from '@aws-amplify/core/internals/testing';

/**
 * Creates the branded test `AmplifyContext` the DataStore suites install as
 * the global context so that `InternalAPI.graphql()` → `getGlobalContext()`
 * succeeds when the sync engine starts.
 *
 * Built on core's `createMockAmplifyContext`, which brands the context via
 * `AMPLIFY_CONTEXT_BRAND` (a `Symbol.for()` registry symbol), so the returned
 * object passes `isAmplifyContext()` checks even across the fresh module
 * graphs created by `jest.resetModules()`.
 *
 * @param endpoint The fake AppSync endpoint to expose in the context's
 *   `resourcesConfig`. Defaults to the non-routable endpoint most suites use.
 */
export function createTestCtx(
	endpoint = 'https://0.0.0.0/graphql',
): MockAmplifyContext {
	return createMockAmplifyContext({
		API: {
			GraphQL: {
				endpoint,
				region: 'us-west-2',
				defaultAuthMode: 'apiKey',
				apiKey: 'da2-fakeApiId123456',
			},
		},
	});
}

/**
 * Prevents the subscription processor from making real network requests
 * (which hang in the test environment) by injecting a no-op `InternalAPI`
 * that returns empty observables for subscriptions.
 *
 * `rxjs` is required lazily so the `NEVER` observable comes from the CURRENT
 * module graph — suites call this after `jest.resetModules()`.
 *
 * @param DataStore The DataStore instance to inject the no-op API into
 *   (accesses the private, test-only `amplifyContext` DI seam).
 */
export function injectNoOpInternalAPI(DataStore: unknown): void {
	const { NEVER } = require('rxjs');
	(
		DataStore as { amplifyContext: { InternalAPI: unknown } }
	).amplifyContext.InternalAPI = {
		graphql: () => NEVER,
		getGraphqlOperationType: () => 'subscription',
	};
}
