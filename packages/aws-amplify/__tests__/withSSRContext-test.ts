import { Amplify, CredentialsClass, UniversalStorage } from '@aws-amplify/core';

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
		expect(amplify.configure()).toEqual(
			expect.objectContaining({
				Credentials: expect.any(CredentialsClass),
				storage: expect.any(UniversalStorage),
				TEST_VALUE: true,
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
			expect(amplify.API._graphqlApi.Credentials).toBe(config.Credentials);
			expect(Amplify.API._graphqlApi.Credentials).not.toBe(config.Credentials);

			// RestAPI._api is a RestClient with Credentials
			expect(amplify.API._restApi._api.Credentials).toBe(config.Credentials);
			expect(Amplify.API._restApi._api.Credentials).not.toBe(
				config.Credentials
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
			const config = amplify.configure();

			expect(Amplify.Auth.Credentials).not.toBe(config.Credentials);
			expect(amplify.Auth.Credentials).toBe(config.Credentials);
		});
	});

	describe('DataStore', () => {
		it('should be a different instance than Amplify.DataStore', () => {
			expect(withSSRContext().DataStore).not.toBe(Amplify.DataStore);
		});
	});

	describe('I18n', () => {
		it('should be the same instance as Amplify.I18n', () => {
			expect(withSSRContext().I18n).toBe(Amplify.I18n);
		});
	});
});
