import { Auth, CognitoUser } from '@aws-amplify/auth';
import { Logger, isEmpty } from '@aws-amplify/core';
import {
	AuthState,
	ChallengeName,
	CognitoUserInterface,
	AuthStateHandler,
	UsernameAlias,
	UsernameAliasStrings,
} from './types/auth-types';
import { dispatchToastHubEvent } from './helpers';
import { NO_AUTH_MODULE_FOUND } from '../common/constants';
import { Translations } from '../common/Translations';

const logger = new Logger('auth-helpers');

export async function checkContact(
	user: CognitoUserInterface,
	handleAuthStateChange: AuthStateHandler
) {
	if (!Auth || typeof Auth.verifiedContact !== 'function') {
		throw new Error(NO_AUTH_MODULE_FOUND);
	}

	// If `user` is a federated user, we shouldn't call `verifiedContact`
	// since `user` isn't `CognitoUser`
	if (!isCognitoUser(user)) {
		handleAuthStateChange(AuthState.SignedIn, user);
		return;
	}

	try {
		const data = await Auth.verifiedContact(user);
		if (!isEmpty(data.verified) || isEmpty(data.unverified)) {
			handleAuthStateChange(AuthState.SignedIn, user);
		} else {
			const newUser = Object.assign(user, data);
			handleAuthStateChange(AuthState.VerifyContact, newUser);
		}
	} catch (error) {
		dispatchToastHubEvent(error);
	}
}

export const handleSignIn = async (
	username: string,
	password: string,
	handleAuthStateChange: AuthStateHandler,
	usernameAlias?: UsernameAliasStrings
) => {
	if (!Auth || typeof Auth.signIn !== 'function') {
		throw new Error(NO_AUTH_MODULE_FOUND);
	}
	try {
		const user = await Auth.signIn(username, password);
		logger.debug(user);
		if (
			user.challengeName === ChallengeName.SMSMFA ||
			user.challengeName === ChallengeName.SoftwareTokenMFA
		) {
			logger.debug('confirm user with ' + user.challengeName);
			handleAuthStateChange(AuthState.ConfirmSignIn, user);
		} else if (user.challengeName === ChallengeName.NewPasswordRequired) {
			logger.debug('require new password', user.challengeParam);
			handleAuthStateChange(AuthState.ResetPassword, user);
		} else if (user.challengeName === ChallengeName.MFASetup) {
			logger.debug('TOTP setup', user.challengeParam);
			handleAuthStateChange(AuthState.TOTPSetup, user);
		} else if (
			user.challengeName === ChallengeName.CustomChallenge &&
			user.challengeParam &&
			user.challengeParam.trigger === 'true'
		) {
			logger.debug('custom challenge', user.challengeParam);
			handleAuthStateChange(AuthState.CustomConfirmSignIn, user);
		} else {
			await checkContact(user, handleAuthStateChange);
		}
	} catch (error) {
		if (error.code === 'UserNotConfirmedException') {
			logger.debug('the user is not confirmed');
			handleAuthStateChange(AuthState.ConfirmSignUp, { username });
		} else if (error.code === 'PasswordResetRequiredException') {
			logger.debug('the user requires a new password');
			handleAuthStateChange(AuthState.ForgotPassword, { username });
		} else if (error.code === 'InvalidParameterException' && password === '') {
			logger.debug('Password cannot be empty');
			error.message = Translations.EMPTY_PASSWORD;
		} else if (error.message === Translations.EMPTY_USERNAME) {
			if (usernameAlias === UsernameAlias.email) {
				error.message = Translations.EMPTY_EMAIL;
			}

			if (usernameAlias === UsernameAlias.phone_number) {
				error.message = Translations.EMPTY_PHONE;
			}
		}
		dispatchToastHubEvent(error);
	}
};

export const isCognitoUser = (user: CognitoUserInterface) => {
	return user instanceof CognitoUser;
};
