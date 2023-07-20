import { getIdClient } from '../utils/clients/IdentityIdForPoolIdClient';
import { Amplify } from './MockAmplifySingleton';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('IdentityIdProvider');

type IdentityId = {
	id: string;
	type: 'guest' | 'primary';
};

interface IdentityIdProvider {
	generateOrRetrieveIdentityId(logins: {}): Promise<string>;
}

export class CognitoIdentityIdProvider implements IdentityIdProvider {
	private identityId: IdentityId;

	async generateOrRetrieveIdentityId(logins: {}): Promise<string> {
		const amplifyConfig = Amplify.config;
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

	async getIdentityId(logins?: {}): Promise<IdentityId> {
		// TODO: get the idenityId in this order,
		// 1. check for in-memory idenityId (Primary) presence, if present remove the guest ID in local storage as it shouldn't exist
		// 2. if in-memory primary id is absent, check for guest Id in local storage
		// 3. If both are absent, generate a new one
		// 4. Store it (TODO: where to store? in-mem or local storage? is it primary or guest?)
		if (!this.identityId) {
			// TODO: get guest id from local storage
			let localStrageGuestID = false;
			if (localStrageGuestID) {
				return (this.identityId = { id: 'guestId', type: 'guest' }); // TODO: change to the actual guest ID
			} else {
				this.identityId = {
					id: await this.generateOrRetrieveIdentityId(logins ?? {}),
					type: logins ? 'primary' : 'guest',
				};
				if (!logins) {
					// TODO: [CHECK IF THIS IS RIGHT WAY] if no logins then it's a guest user, store Guest identityID in local storage
				}
				return this.identityId;
			}
		}
		return this.identityId;
	}

	async setIdentityId(newIdentityId: IdentityId): Promise<void> {
		if (
			newIdentityId.id === this.identityId.id &&
			newIdentityId.type === 'primary' &&
			this.identityId.type === 'guest'
		) {
			// if guestIdentity is found and used by GetCredentialsForIdentity
			// it will be linked to the logins provided, and disqualified as an unauth identity
			logger.debug(
				`The guest identity ${this.identityId.id} has become the primary identity`
			);
			// TODO: clear guestIdentityId in local storage
		} else if (newIdentityId.type === 'guest') {
			// TODO: Store the guest identityId in local storage
		}

		// update the in-memory identityId to the new primary identityId
		this.identityId = newIdentityId;
	}
}
