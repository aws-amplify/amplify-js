import { Amplify, UniversalStorage } from '@aws-amplify/core';

import { withServerContext } from '../src/withServerContext';

describe('withServerContext', () => {
	it('should not require context (for client-side requests)', () => {
		expect(() => withServerContext()).not.toThrow();
	});

	it('should create a new instance of Amplify', () => {
		const amplify = withServerContext();

		expect(amplify).not.toBe(Amplify);
	});

	it('should extend the global Amplify config', () => {
		// ! Amplify is global across all tests, so we use a value that won't negatively affect others
		Amplify.configure({ TEST_VALUE: true });
		expect(Amplify.configure()).toEqual({ TEST_VALUE: true });

		const amplify = withServerContext();
		expect(amplify.configure()).toEqual(
			expect.objectContaining({
				storage: expect.any(UniversalStorage),
				TEST_VALUE: true,
			})
		);
	});

	describe('API', () => {
		it('should be a different instance than Amplify.Auth', () => {
			expect(withServerContext().API).not.toBe(Amplify.API);
		});
	});

	describe('Auth', () => {
		it('should be a different instance than Amplify.Auth', () => {
			expect(withServerContext().Auth).not.toBe(Amplify.Auth);
		});

		it('should be created with UniversalStorage', () => {
			expect(withServerContext().Auth._storage).toBeInstanceOf(
				UniversalStorage
			);
		});
	});

	describe('DataStore', () => {
		it('should be a different instance than Amplify.Auth', () => {
			expect(withServerContext().DataStore).not.toBe(Amplify.DataStore);
		});
	});

	describe('I18n', () => {
		it('should be the same instance as Amplify.I18n', () => {
			expect(withServerContext().I18n).toBe(Amplify.I18n);
		});
	});
});
