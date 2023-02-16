import { Amplify, UniversalStorage } from '@aws-amplify/core';

import { withSSRContext } from '../src/withSSRContext';

describe('withSSRContext', () => {
	it('should not require context (for client-side requests)', () => {
		expect(() => withSSRContext()).not.toThrow();
	});

	it('should create a new instance of Amplify', () => {
		const amplify = withSSRContext();

		expect(amplify).not.toBe(Amplify);
	});

	it('should extend the global Amplify config', () => {
		// ! Amplify is global across all tests, so we use a value that won't negatively affect others
		Amplify.configure({ TEST_VALUE: true });
		expect(Amplify.configure()).toEqual({ TEST_VALUE: true });

		const amplify = withSSRContext();
		expect(amplify.configure({ TEST_VALUE2: true })).toEqual(
			expect.objectContaining({
				storage: expect.any(UniversalStorage),
				TEST_VALUE: true,
				TEST_VALUE2: true,
			})
		);
	});

	describe('API', () => {
		it('should be a different instance than Amplify.Auth', () => {
			expect(withSSRContext().API).not.toBe(Amplify.API);
		});

		it('should use different Credentials than Amplify', () => {
			const amplify = withSSRContext();
			const config = amplify.configure();

			// GraphQLAPI uses Credentials internally
			expect(Amplify.API._graphqlApi.Credentials).not.toBe(
				amplify.API._graphqlApi.Credentials
			);

			// RestAPI._api is a RestClient with Credentials
			expect(Amplify.API._restApi._api.Credentials).not.toBe(
				amplify.API._restApi._api.Credentials
			);
		});
	});

	describe('Auth', () => {
		it('should be a different instance than Amplify.Auth', () => {
			expect(withSSRContext().Auth).not.toBe(Amplify.Auth);
		});

		it('should be created with UniversalStorage', () => {
			expect(withSSRContext().Auth._storage).toBeInstanceOf(UniversalStorage);
		});

		it('should use different Credentials than Amplify', () => {
			const amplify = withSSRContext();

			expect(Amplify.Auth.Credentials).not.toBe(amplify.Auth.Credentials);
		});
	});

	describe('DataStore', () => {
		it('should be a different instance than Amplify.DataStore', () => {
			expect(withSSRContext().DataStore).not.toBe(Amplify.DataStore);
		});

		it('should use Amplify components from the ssr context', () => {
			const { Auth, API, DataStore } = withSSRContext();

			expect(DataStore.Auth).toBe(Auth);
			expect(DataStore.Auth).not.toBe(Amplify.Auth);

			expect(DataStore.API).toBe(API);
			expect(DataStore.API).not.toBe(Amplify.API);
		});
	});

	describe('I18n', () => {
		// I18n isn't scoped to SSR (yet)
		it.skip('should be the same instance as Amplify.I18n', () => {
			expect(withSSRContext().I18n).toBe(Amplify.I18n);
		});
	});
});
