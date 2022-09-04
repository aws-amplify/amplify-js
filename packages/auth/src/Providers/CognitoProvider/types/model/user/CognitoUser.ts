import { AmplifyUser } from 'src/types/model/user/AmplifyUser';
import { AWSCredentials } from '../session/AWSCredentials';

export type CognitoUser = AmplifyUser & {
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
