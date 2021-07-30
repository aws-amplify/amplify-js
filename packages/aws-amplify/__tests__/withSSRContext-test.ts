import { Amplify, UniversalStorage } from '@aws-amplify/core';
import { API, Auth, DataStore } from 'aws-amplify';
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
		const SSR = withSSRContext({ modules: [API] });

		it('should not include API by default', () => {
			expect(withSSRContext().API).toBeNull();
		});

		it('should be a different instance than Amplify.Auth', () => {
			expect(SSR.API).toBeInstanceOf(API.constructor);
			expect(SSR.API).not.toBe(Amplify.API);
		});

		it('should use different Credentials than Amplify', () => {
			// GraphQLAPI uses Credentials internally
			expect(Amplify.API._graphqlApi.Credentials).not.toBe(
				SSR.API._graphqlApi.Credentials
			);

			// RestAPI._api is a RestClient with Credentials
			expect(Amplify.API._restApi._api.Credentials).not.toBe(
				SSR.API._restApi._api.Credentials
			);
		});
	});

	describe('Auth', () => {
		const SSR = withSSRContext();

		it('should include Auth by default', () => {
			expect(SSR.Auth).toBeInstanceOf(Auth.constructor);
		});

		it('should be a different instance than Amplify.Auth', () => {
			expect(SSR.Auth).toBeInstanceOf(Auth.constructor);
			expect(SSR.Auth).not.toBe(Amplify.Auth);
		});

		it('should be created with UniversalStorage', () => {
			expect(SSR.Auth._storage).toBeInstanceOf(UniversalStorage);
		});

		it('should use different Credentials than Amplify', () => {
			expect(Amplify.Auth.Credentials).not.toBe(SSR.Auth.Credentials);
		});
	});

	describe('DataStore', () => {
		it('should be a different instance than Amplify.DataStore', () => {
			expect(withSSRContext().DataStore).not.toBe(Amplify.DataStore);
		});
	});

	describe('I18n', () => {
		const SSR = withSSRContext();

		// I18n isn't scoped to SSR (yet)
		it.skip('should be the same instance as Amplify.I18n', () => {
			expect(SSR.I18n).toBe(Amplify.I18n);
		});
	});
});
