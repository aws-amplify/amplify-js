import { Auth } from '../src/AuthNext';
// import { randomDelay } from './utils';

Auth.configure({
	region: 'us-west-2',
	userPoolId: 'us-west-2_Jw5spDH5N',
	userPoolWebClientId: '3lm8kka38317l1n4rhjmusae0r',
});

(async (): Promise<void> => {
	// const signUpResponse = await Auth.signUp({
	// 	username: 'harrysolovay@gmail.com',
	// 	password: 'Testingthis123!',
	// });
	// console.log(signUpResponse);

	undefined;

	// const resendSignUpCodeResponse = await Auth.resendSignUpCode({
	//  username: 'harrysolovay@gmail.com',
	// });
	// console.log(resendSignUpCodeResponse);

	undefined;

	// const confirmSignUpResponse = await Auth.confirmSignUp({
	// 	username: 'harrysolovay@gmail.com',
	// 	code: '955927',
	// });
	// console.log(confirmSignUpResponse);

	undefined;
})();
