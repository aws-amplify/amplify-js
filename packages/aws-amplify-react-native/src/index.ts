// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify as AmplifyCore, I18n } from 'aws-amplify';
import dict from './AmplifyI18n';

export { default as AmplifyTheme } from './AmplifyTheme';
export { MapEntries as AmplifyMessageMapEntries } from './AmplifyMessageMap';
export {
	AmplifyButton,
	Container,
	ErrorRow,
	FormField,
	Header,
	LinkCell,
	PhoneField,
	SignedOutMessage,
	Wrapper,
} from './AmplifyUI';
export {
	AuthPiece,
	Authenticator,
	ConfirmSignIn,
	ConfirmSignUp,
	ForgotPassword,
	Greetings,
	Loading,
	RequireNewPassword,
	SignIn,
	SignUp,
	VerifyContact,
	withAuthenticator,
	withOAuth,
} from './Auth';
export { Connect } from './API';
export { S3Album, S3Image } from './Storage';
export { ChatBot } from './Interactions';

const configure = function (config) {
	const msg = [
		'',
		'\x1b[33mWarning: Amplify.configure() is deprecated from aws-amplify-react-native.',
		'        Please import aws-amplify package to configure AWS Amplify\x1b[0m',
		'',
		'        Example:',
		'',
		"        \x1b[36mimport Amplify from 'aws-amplify';",
		"        import aws_exports from './aws-exports';",
		'',
		'        Amplify.configure(aws_exports)\x1b[0m',
		'',
	].join('\n');
	console.log(msg);
	AmplifyCore.configure(config);
};

const Amplify = {
	configure: configure,
};

export default Amplify;

I18n.putVocabularies(dict);
