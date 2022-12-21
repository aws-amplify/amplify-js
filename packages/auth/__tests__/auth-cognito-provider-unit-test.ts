import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { Auth } from '../src/Auth';
import { AuthErrorTypes } from '../src/constants/AuthErrorTypes';
import { AuthError } from '../src/Errors';
import { AmazonCognitoProvider } from '../src/Providers/AmazonCognitoProvider';
import { 
	AuthPluginOptions, 
	AuthSignUpResult, 
	AuthSignUpStep, 
	CognitoSignUpOptions, 
	CognitoUserAttributeKey, 
	SignUpRequest 
} from '../src/types';

CognitoIdentityProviderClient.prototype.send = jest.fn(async command => {
	if (command instanceof SignUpCommand) {
		return Promise.resolve(signUpCommandOutput);
	}
	return 'data';
});

const signUpCommandOutput = {
	UserConfirmed: true
};

const config = {
	userPoolId: 'userPoolId',
	storage: 'storage',
	region: 'region'
};

const noUserPoolConfig = {
	userPoolId: '',
	storage: 'storage',
	region: 'region'
};

const signUpRequest: SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> = {
	username: 'username',
	password: 'password',
	options: {
		userAttributes: [
			{userAttributeKey: 'email', value: 'email@email.com'},
			{userAttributeKey: 'phone_number', value: '+12345678910'}
		]
	}
};

const signUpResult: AuthSignUpResult<CognitoUserAttributeKey> = {
	isSignUpComplete: true,
	nextStep: {
		signUpStep: AuthSignUpStep.DONE
	}
};

const provider = new AmazonCognitoProvider(config);

describe('Amazon Cognito Auth unit test', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Sign up', () => {
		test('happy case with user attributes', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			Auth.addPluggable(provider);
			const result = await Auth.signUp(signUpRequest);
			const commandObject = {
				input: {
					ClientId: 'userPoolId',
					Username: 'username',
					Password: 'password',
					UserAttributes: [
						{Name: 'email', Value: 'email@email.com'},
						{Name: 'phone_number', Value: '+12345678910'}
					],
				}
			};
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledWith(expect.objectContaining(commandObject));
			expect(result).toEqual(signUpResult);
			spyon.mockClear();
		});
		test('happy case with validation data', async () => {
			Auth.addPluggable(provider);
			const pluginOptions: CognitoSignUpOptions = {
				validationData: {
					foo: 'bar'
				}
			};
			const request: SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> = {
				username: 'username',
				password: 'password',
				options: {
					userAttributes: [
						{userAttributeKey: 'email', value: 'email@email.com'},
						{userAttributeKey: 'phone_number', value: '+12345678910'}
					],
					pluginOptions
				}
			};
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			await Auth.signUp(request);
			const commandObject = {
				input: {
					ClientId: 'userPoolId',
					Username: 'username',
					Password: 'password',
					UserAttributes: [
						{Name: 'email', Value: 'email@email.com'},
						{Name: 'phone_number', Value: '+12345678910'}
					],
					ValidationData: [{'Name': 'foo', 'Value': 'bar'}]
				}
			};
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(await CognitoIdentityProviderClient.prototype.send).toBeCalledWith(expect.objectContaining(commandObject));
			spyon.mockClear();
		});
		test('happy case with client metadata', async () => {
			const pluginOptions: CognitoSignUpOptions = {
				clientMetadata: {
					foo: 'bar'
				}
			};
			const request: SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> = {
				username: 'username',
				password: 'password',
				options: {
					userAttributes: [
						{userAttributeKey: 'email', value: 'email@email.com'},
						{userAttributeKey: 'phone_number', value: '+12345678910'}
					],
					pluginOptions
				}
			};
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			Auth.addPluggable(provider);
			await Auth.signUp(request);
			const commandObject = {
				input: {
					ClientId: 'userPoolId',
					Username: 'username',
					Password: 'password',
					UserAttributes: [
						{Name: 'email', Value: 'email@email.com'},
						{Name: 'phone_number', Value: '+12345678910'}
					],
					ClientMetadata: {foo: 'bar'}
				}
			};
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(await CognitoIdentityProviderClient.prototype.send).toBeCalledWith(expect.objectContaining(commandObject));
			spyon.mockClear();
		});
		test('happy case with code delivery details in result', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					return {
						UserConfirmed: false,
						CodeDeliveryDetails: {
							AttributeName: 'attrName',
							DeliveryMedium: 'deliveryMedium',
							Destination: 'destination'
						}
					};
				});
			const signUpResult = {
				isSignUpComplete: false,
				nextStep: {
					codeDeliveryDetails: {
						deliveryMedium: 'deliveryMedium',
						destination: 'destination',
						attributeName: 'attrName'
					},
					signUpStep: 'CONFIRM_SIGN_UP'
				}
			};
			Auth.addPluggable(provider);
			const result = await Auth.signUp(signUpRequest);
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(result).toEqual(signUpResult);
			spyon.mockClear();
		});
	});
	test('client send command fails', async () => {
		const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send').mockImplementationOnce(command => {
			throw new Error('err');
		});
		Auth.addPluggable(provider);
		await expect(Auth.signUp(signUpRequest)).rejects.toEqual(new Error('err'));
		spyon.mockClear();
	});
	test ('no userpool in config', async () => {
		const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
		const provider = new AmazonCognitoProvider(noUserPoolConfig);
		Auth.addPluggable(provider);
		await expect(Auth.signUp(signUpRequest)).rejects.toEqual(new AuthError(AuthErrorTypes.NoConfig));
		expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
		spyon.mockClear();
	});
	test('empty username', async () => {
		const request: SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> = {
			username: '',
			password: 'password',
			options: {
				userAttributes: [
					{userAttributeKey: 'email', value: 'email@email.com'},
					{userAttributeKey: 'phone_number', value: '+12345678910'}
				]
			}
		};
		const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
		Auth.addPluggable(provider);
		await expect(Auth.signUp(request)).rejects.toEqual(new AuthError(AuthErrorTypes.EmptyUsername));
		expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
		spyon.mockClear();
	});
	test('empty password', async () => {
		const request: SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> = {
			username: 'username',
			password: '',
			options: {
				userAttributes: [
					{userAttributeKey: 'email', value: 'email@email.com'},
					{userAttributeKey: 'phone_number', value: '+12345678910'}
				]
			}
		};
		const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
		Auth.addPluggable(provider);
		await expect(Auth.signUp(request)).rejects.toEqual(new AuthError(AuthErrorTypes.EmptyPassword));
		expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
		spyon.mockClear();
	});
	// TODO: test hub events when they are implemented in Sign up function
});
