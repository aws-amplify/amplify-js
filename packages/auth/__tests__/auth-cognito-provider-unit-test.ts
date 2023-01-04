import { CognitoIdentityProviderClient, ForgotPasswordCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { Auth } from '../src/Auth';
import { AuthErrorTypes } from '../src/constants/AuthErrorTypes';
import { AuthError } from '../src/Errors';
import { AmazonCognitoProvider } from '../src/Providers/AmazonCognitoProvider';
import { 
	AuthPluginOptions, 
	AuthResetPasswordStep, 
	AuthSignUpResult, 
	AuthSignUpStep, 
	AuthUserAttribute, 
	CognitoSignUpOptions, 
	CognitoUserAttributeKey, 
	ResetPasswordRequest, 
	SignUpRequest 
} from '../src/types';

CognitoIdentityProviderClient.prototype.send = jest.fn(async command => {
	if (command instanceof SignUpCommand) {
		return Promise.resolve(signUpCommandOutput);
	}
	if (command instanceof ForgotPasswordCommand) {
		return Promise.resolve(resetPasswordOutput);
	}
	return 'data';
});

const signUpCommandOutput = {
	UserConfirmed: true
};

const resetPasswordOutput = {
	CodeDeliveryDetails: {
		AttributeName: 'attrName',
		DeliveryMedium: 'deliveryMedium',
		Destination: 'destination'
	}
};

const config = {
	userPoolId: 'userPoolId',
	storage: 'storage',
	region: 'region'
};

const configWithClientMetadata = {
	userPoolId: 'userPoolId',
	storage: 'storage',
	region: 'region',
	clientMetadata: {
		'foo': 'bar'
	}
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

const createResetPasswordRequest = (
	username,
	options?
): ResetPasswordRequest<AuthPluginOptions> => {
	return {
		username,
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

const resetPasswordResult = {
	isPasswordReset: false,
	nextStep: {
		resetPasswordStep: AuthResetPasswordStep.CONFIRM_RESET_PASSWORD_WITH_CODE,
		codeDeliveryDetails: {
			deliveryMedium: 'deliveryMedium',
			destination: 'destination',
			attributeName: 'attrName'
		}
	}
};

const resetPasswordCommand = {
	input: {
		ClientId: 'userPoolId',
		Username: 'username',
		ClientMetadata: {foo: 'bar'}
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

	describe('Reset password', () => {
		test('happy case', async () => {
			expect.assertions(2);
			Auth.addPluggable(provider);
			const result = await Auth.resetPassword(createResetPasswordRequest('username'));
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(1);
			expect(result).toEqual(resetPasswordResult);
		});

		test('happy case clientMetadata default', async () => {
			expect.assertions(2);
			Auth.addPluggable(new AmazonCognitoProvider(configWithClientMetadata));
			const result = await Auth.resetPassword(createResetPasswordRequest('username'));
			expect(CognitoIdentityProviderClient.prototype.send)
				.toBeCalledWith(expect.objectContaining(resetPasswordCommand));
			expect(result).toEqual(resetPasswordResult);
		});

		test('happy case clientMetadata parameter', async () => {
			expect.assertions(1);
			Auth.addPluggable(provider);
			const options = {
				pluginOptions: {
					clientMetadata: {
						foo: 'bar'
					}
				}
			};
			await Auth.resetPassword(createResetPasswordRequest('username', options));
			expect(CognitoIdentityProviderClient.prototype.send)
				.toBeCalledWith(expect.objectContaining(resetPasswordCommand));
		});

		test('happy case clientMetadata parameter over default', async () => {
			expect.assertions(1);
			Auth.addPluggable(new AmazonCognitoProvider(configWithClientMetadata));
			const options = {
				pluginOptions: {
					clientMetadata: {
						name: 'data'
					}
				}
			};
			const resetPasswordCommand = {
				input: {
					ClientId: 'userPoolId',
					Username: 'username',
					ClientMetadata: {name: 'data'}
				}
			};
			await Auth.resetPassword(createResetPasswordRequest('username', options));
			expect(CognitoIdentityProviderClient.prototype.send)
				.toBeCalledWith(expect.objectContaining(resetPasswordCommand));
		});

		test('client send command fails', async () => {
			expect.assertions(1);
			jest.spyOn(CognitoIdentityProviderClient.prototype, 'send').mockImplementationOnce(command => {
				throw new Error('err');
			});
			Auth.addPluggable(provider);
			await expect(Auth.resetPassword(createResetPasswordRequest('username')))
				.rejects.toThrow(new Error('err'));
		});

		test('no user pool', async () => {
			expect.assertions(1);
			const provider = new AmazonCognitoProvider(noUserPoolConfig);
			Auth.addPluggable(provider);
			await expect(Auth.resetPassword(createResetPasswordRequest('username')))
				.rejects.toThrow(new AuthError(AuthErrorTypes.NoConfig));
		});

		test('no username', async () => {
			expect.assertions(1);
			Auth.addPluggable(provider);
			await expect(Auth.resetPassword(createResetPasswordRequest('')))
				.rejects.toThrow(new AuthError(AuthErrorTypes.EmptyUsername));
		});
	});

	
});
