import { AmplifyUser } from '../../../../../types/model/user/AmplifyUser';
import { AWSCredentials } from '../session/AWSCredentials';

export type AmplifyCognitoUser = AmplifyUser & {
	credentials?: {
		// scope
		[key: string]: {
			jwt?: {
				idToken: string;
				accessToken: string;
				refreshToken: string;
			};
			aws?: AWSCredentials;
		};
	};
};
