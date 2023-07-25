import { getIdClient } from '../utils/clients/IdentityIdForPoolIdClient';
// import { Amplify } from './MockAmplifySingleton';
import { Logger } from '@aws-amplify/core';
import { formLoginsMap } from './credentialsProvider';
import {
	AuthConfig,
	AuthTokens,
} from '@aws-amplify/core/lib-esm/singleton/Auth/types';

const logger = new Logger('IdentityIdProvider');

type IdentityId = {
	id: string;
	type: 'guest' | 'primary';
};

let identityId: IdentityId;

export async function getIdentityId({
	tokens,
	authConfig,
}: {
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
}): Promise<string> {
	if (tokens) {
		// retrun primary identityId
		// look in-memory
		if (identityId && identityId.type === 'primary') {
			return identityId.id;
		} else {
			let logins =
				tokens && tokens.idToken
					? formLoginsMap(tokens.idToken.toString(), 'COGNITO')
					: {};
			let generatedIdentityId = await generateIdentityId(logins);
			// Store in-memory
			identityId = {
				id: generatedIdentityId,
				type: 'primary',
			};
			//TODO(V6): clear guest id in local storage
		}
	} else {
		// return guest identityId
		if (identityId && identityId.type === 'guest') {
			return identityId.id;
		} else {
			// Store in-memory
			identityId = {
				id: await generateIdentityId({}),
				type: 'guest',
			};
			//TODO(V6): store guest id in local storage
		}
	}
	return identityId.id;
}

async function generateIdentityId(logins: {}): Promise<string> {
	const amplifyConfig = { identityPoolId: '' };
	const { identityPoolId } = amplifyConfig;

	// Access config to obtain IdentityPoolId & region
	if (!identityPoolId) {
		logger.debug('No Cognito Federated Identity pool provided');
		return Promise.reject('No Cognito Federated Identity pool provided');
	}

	// IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
	// Region is not needed for this API as suggested by the API spec: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetId.html
	const idResult =
		// for a first-time user, this will return a brand new identity
		// for a returning user, this will retrieve the previous identity assocaited with the logins
		(
			await getIdClient({
				IdentityPoolId: identityPoolId,
				Logins: logins,
			})
		).IdentityId;
	if (!idResult) {
		throw Error('Cannot fetch IdentityId');
	}

	return idResult;
}

export async function setIdentityId(newIdentityId: IdentityId): Promise<void> {
	if (
		newIdentityId.id === identityId.id &&
		newIdentityId.type === 'primary' &&
		identityId.type === 'guest'
	) {
		// if guestIdentity is found and used by GetCredentialsForIdentity
		// it will be linked to the logins provided, and disqualified as an unauth identity
		logger.debug(
			`The guest identity ${identityId.id} has become the primary identity`
		);
		// TODO(V6): clear guestIdentityId in local storage
	} else if (newIdentityId.type === 'guest') {
		// TODO(V6): Store the guest identityId in local storage
	}

	// update the in-memory identityId to the new primary identityId
	identityId = newIdentityId;
}
