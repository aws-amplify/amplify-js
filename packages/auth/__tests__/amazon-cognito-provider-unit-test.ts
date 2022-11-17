import { Hub } from '@aws-amplify/core';
import {  
	CognitoIdentityProviderClient, 
	InitiateAuthCommand, 
	SignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { Auth } from '../src/Auth';
import { AuthError, authErrorMessages } from '../src/Errors';
import { AmazonCognitoProvider } from '../src/Providers/AmazonCognitoProvider';
import { 
	AuthPluginOptions,
	AuthSignUpResult, 
	AuthSignUpStep, 
	CognitoSignUpOptions, 
	CognitoUserAttributeKey, 
	SignUpRequest 
} from '../src/types/AmazonCognitoProvider';


CognitoIdentityProviderClient.prototype.send = jest.fn(async command => {
	if (command instanceof SignUpCommand) {
		return Promise.resolve(signUpCommandOutput);
	} else if (command instanceof InitiateAuthCommand) {
		return Promise.resolve(initiateAuthCommandOutput);
	}
	return 'data';
});

const signUpCommandOutput = {
	UserConfirmed: true,
};

const initiateAuthCommandOutput = {
	AuthenticationResult: 'result'
}

const config = {
	userPoolId: 'userPoolId',
	storage: 'storage',
	region: 'region'
};

const noUserPoolConfig = {
	userPoolId: '',
	storage: 'storage',
	region: 'region'
}

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

const signUpRequestAutoSignIn: SignUpRequest<CognitoUserAttributeKey, AuthPluginOptions> = {
	username: 'username',
	password: 'password',
	options: {
		userAttributes: [
			{userAttributeKey: 'email', value: 'email@email.com'},
			{userAttributeKey: 'phone_number', value: '+12345678910'}
		],
		autoSignIn: {enabled: true}
	}
}

const signUpResult: AuthSignUpResult<CognitoUserAttributeKey> = {
	isSignUpComplete: true,
	nextStep: {
		signUpStep: AuthSignUpStep.DONE
	}
};


describe('Amazon Cognito Auth unit test', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});
	describe('Sign up', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			const provider = new AmazonCognitoProvider(config);
			Auth.addPluggable(provider);
			const result = await Auth.signUp(signUpRequest);
			
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(result).toEqual(signUpResult);
			spyon.mockClear();
		});
		test('happy case client meta data', async () => { 
			const pluginOptions: CognitoSignUpOptions = {
				clientMetaData: {
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
			const provider = new AmazonCognitoProvider(config);
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
			}
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalled();
			expect(await CognitoIdentityProviderClient.prototype.send).toBeCalledWith(expect.objectContaining(commandObject));
			spyon.mockClear();
		});
		test('client send command fails', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send').mockImplementationOnce(command => {
				throw new Error('err');
			});
			
			const provider = new AmazonCognitoProvider(config);
			Auth.addPluggable(provider);
			await expect(Auth.signUp(signUpRequest)).rejects.toEqual(new Error('err'));
			spyon.mockClear();
		});
		test ('no userpool in config', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			const provider = new AmazonCognitoProvider(noUserPoolConfig);
			Auth.addPluggable(provider);
			await expect(Auth.signUp(signUpRequest)).rejects.toEqual(new AuthError({message: authErrorMessages.missingAuthConfig.message}));
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
			}

			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			const provider = new AmazonCognitoProvider(config);
			Auth.addPluggable(provider);
			await expect(Auth.signUp(request)).rejects.toEqual(new AuthError({message: authErrorMessages.emptyUsername.message}));
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
			}

			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			const provider = new AmazonCognitoProvider(config);
			Auth.addPluggable(provider);
			await expect(Auth.signUp(request)).rejects.toEqual(new AuthError({message: authErrorMessages.emptyPassword.message}));
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(0);
			spyon.mockClear();
		});
	});
	describe('AutoSignInAfterSignUp', () => {
		test('happy case auto confirm', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send');
			const provider = new AmazonCognitoProvider(config);
			Auth.addPluggable(provider);
			const result = await Auth.signUp(signUpRequestAutoSignIn);
			expect(result).toEqual(signUpResult);
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(2);
			spyon.mockClear();
		});
		test('happy case confirmation code', async () => {
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send')
				.mockImplementationOnce(command => {
					if (command instanceof SignUpCommand) {
						return Promise.resolve({
							UserConfirmed: false
						})
					} else if (command instanceof InitiateAuthCommand) {
						return Promise.resolve(initiateAuthCommandOutput);
					}
					return 'data';
				});
			const provider = new AmazonCognitoProvider(config);
			Auth.addPluggable(provider);
			await Auth.signUp(signUpRequestAutoSignIn);
			Hub.dispatch('auth', {event: 'confirmSignUp', data: 'user', message: 'message'}); // TODO replace with confirmSignUp call when implemented
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(2);
			spyon.mockClear();
		});
		test('happy case confirmation link', async () => {
			jest.useFakeTimers();
			const spyon = jest.spyOn(CognitoIdentityProviderClient.prototype, 'send')
				.mockImplementationOnce(command => {
					if (command instanceof SignUpCommand) {
						return Promise.resolve({
							UserConfirmed: false
						})
					} else if (command instanceof InitiateAuthCommand) {
						return Promise.resolve(initiateAuthCommandOutput);
					}
					return 'data';
			});

			const provider = new AmazonCognitoProvider({
				userPoolId: 'userPoolId',
				storage: 'storage',
				region: 'region',
				signUpVerificationMethod: 'link'
			});
			Auth.addPluggable(provider);
			await Auth.signUp(signUpRequestAutoSignIn);
			jest.advanceTimersByTime(6000);
			expect(CognitoIdentityProviderClient.prototype.send).toBeCalledTimes(2);
			spyon.mockClear();
		});
	})
});
