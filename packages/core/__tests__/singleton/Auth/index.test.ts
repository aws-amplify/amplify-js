import { ConsoleLogger } from '../../../src/Logger';
import { AuthClass } from '../../../src/singleton/Auth';

jest.mock('../../../src/Logger', () => {
	const warn = jest.fn();

	return {
		ConsoleLogger: jest.fn(() => ({
			warn,
		})),
	};
});

describe('Auth', () => {
	const auth = new AuthClass();
	const logger = new ConsoleLogger('Auth');
	const mockedWarn = logger.warn as jest.Mock;

	describe('configure', () => {
		const mockConfig = {
			userPoolClientId: 'userPoolClientId',
			userPoolId: 'userPoolId',
		};

		it('prints warning when use custom endpoint for Cognito User Pool', () => {
			auth.configure({
				Cognito: {
					...mockConfig,
					userPoolEndpoint: 'https://custom-endpoint.com',
				},
			});

			expect(mockedWarn).toHaveBeenCalledWith(
				expect.stringContaining('Amazon Cognito User Pool'),
			);
		});

		it('prints warning when use custom endpoint for Cognito Identity Pool', () => {
			auth.configure({
				Cognito: {
					...mockConfig,
					identityPoolId: 'identityPoolId',
					identityPoolEndpoint: 'https://custom-endpoint.com',
				},
			});

			expect(mockedWarn).toHaveBeenCalledWith(
				expect.stringContaining('Amazon Cognito Identity Pool'),
			);
		});
	});
});
