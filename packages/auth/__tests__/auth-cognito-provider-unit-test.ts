import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { Auth } from '../src/Auth';
import { AuthErrorTypes } from '../src/constants/AuthErrorTypes';
import { AuthError } from '../src/Errors';
import { AmazonCognitoProvider } from '../src/Providers/AmazonCognitoProvider';
import { 
	AuthPluginOptions, 
	AuthSignUpResult, 
	AuthSignUpStep, 
	AuthUserAttribute, 
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

const createSignUpRequest = (
	username, 
	password, 
	options
): SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> => {
	return {
		username,
		password,
		options
	};
};

const userAttributes: AuthUserAttribute<CognitoUserAttributeKey>[] = [
	{userAttributeKey: 'email', value: 'email@email.com'},
	{userAttributeKey: 'phone_number', value: '+12345678910'}
];

const signUpResult: AuthSignUpResult<CognitoUserAttributeKey> = {
	isSignUpComplete: true,
	nextStep: {
		signUpStep: AuthSignUpStep.DONE
	}
};

const signUpResultUnconfirmedUser = {
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

const provider = new AmazonCognitoProvider(config);

describe('Amazon Cognito Auth unit test', () => {
	const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Sign up', () => {
		test('happy case with user attributes', async () => {
			Auth.addPluggable(provider);
			const request = createSignUpRequest('username', 'password', { userAttributes });
			const result = await Auth.signUp(request);
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
		});

		test('happy case with validation data', async () => {
			Auth.addPluggable(provider);
			const pluginOptions: CognitoSignUpOptions = {
				validationData: {
					foo: 'bar'
				}
			};
			const options = {
				userAttributes,
				pluginOptions
			};
			const request = createSignUpRequest('username', 'password', options);
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
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledWith(expect.objectContaining(commandObject));
		});

		test('happy case with client metadata', async () => {
			const options = {
				userAttributes,
				pluginOptions: {
					clientMetadata: {
						foo: 'bar'
					}
				}
			};
			Auth.addPluggable(provider);
			await Auth.signUp(createSignUpRequest('username', 'password', options));
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
			Auth.addPluggable(provider);
			const result = await Auth.signUp(createSignUpRequest('username', 'password', { userAttributes }));
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(result).toEqual(signUpResultUnconfirmedUser);
		});

		test('client send command fails', async () => {
			expect.assertions(1);
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send').mockImplementationOnce(command => {
				throw new Error('err');
			});
			Auth.addPluggable(provider);
			const request = createSignUpRequest('username', 'password', { userAttributes });
			await expect(Auth.signUp(request)).rejects.toThrow(new Error('err'));
		});

		test('no userpool in config', async () => {
			const provider = new AmazonCognitoProvider(noUserPoolConfig);
			Auth.addPluggable(provider);
			const request = createSignUpRequest('username', 'password', { userAttributes });
			await expect(Auth.signUp(request)).rejects.toThrow(new AuthError(AuthErrorTypes.NoConfig));
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
		});

		test('empty username', async () => {
			expect.assertions(2);
			const request = createSignUpRequest('', 'password', { userAttributes }); 
			Auth.addPluggable(provider);
			await expect(Auth.signUp(request)).rejects.toThrow(new AuthError(AuthErrorTypes.EmptyUsername));
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
		});

		test('empty password', async () => {
			expect.assertions(2);
			const request = createSignUpRequest('username', '', { userAttributes });
			Auth.addPluggable(provider);
			await expect(Auth.signUp(request)).rejects.toThrow(new AuthError(AuthErrorTypes.EmptyPassword));
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
		});
		// TODO: test hub events when they are implemented in Sign up function
	});

	
});
