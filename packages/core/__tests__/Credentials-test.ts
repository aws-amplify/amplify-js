import { CredentialsClass as Credentials } from '../src/Credentials';
import Amplify from '../src/Amplify';

const authClass = {
	getModuleName() {
		return 'Auth';
	},
	currentUserCredentials() {
		return Promise.resolve('cred');
	},
};

const cacheClass = {
	getModuleName() {
		return 'Cache';
	},
	getItem() {
		return null;
	},
};

describe('Credentials test', () => {
	describe('configure test', () => {
		test('happy case', () => {
			const config = {
				attr: 'attr',
			};

			const credentials = new Credentials(null);
			expect(credentials.configure(config)).toEqual({
				attr: 'attr',
			});
		});
	});

	describe('getCredSource test', () => {
		test('happy case', () => {
			const credentials = new Credentials(null);
			credentials['_credentials_source'] = 'source';
			expect(credentials.getCredSource()).toBe('source');
		});
	});

	describe('get test', () => {
		test('credentials in the memory and not expired', async () => {
			Amplify.register(authClass);
			Amplify.register(cacheClass);
			const credentials = new Credentials(null);

			const expiration = new Date().getTime() + 20 * 60 * 1000;
			credentials['_credentials'] = {
				expiration,
			};
			credentials['_nextCredentialsRefresh'] = expiration + 1;
			expect(await credentials.get()).toEqual(credentials['_credentials']);
		});

		test('credentials not in memory or being expired', async () => {
			Amplify.register(authClass);

			const credentials = new Credentials(null);

			expect(await credentials.get()).toBe('cred');
		});
	});
});
