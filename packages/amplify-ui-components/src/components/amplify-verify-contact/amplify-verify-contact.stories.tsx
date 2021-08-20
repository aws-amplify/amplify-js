import { h } from '@stencil/core';

export default {
	title: 'amplify-verify-contact',
};

export const withNoProps = () => <amplify-verify-contact />;

export const withUnverifiedUser = () => (
	<amplify-verify-contact
		handleAuthStateChange={(...args) => console.info('onStateChange', ...args)}
		// @ts-ignore Type '{ unverified: { email: string; phone_number: string; }; }' is missing the following properties from type 'CognitoUserInterface': challengeName, challengeParam
		user={{
			unverified: {
				email: 'email@amazon.com',
				phone_number: '+12345678901',
			},
		}}
	/>
);
