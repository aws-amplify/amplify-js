import { CognitoProviderConfig } from '../../CognitoProvider';
import { SOCIAL_PROVIDER } from '../../../../types';

export interface FederatedSignInMachineContext {
	scopes: string[];
	oAuthStorage: Storage;
	authConfig: CognitoProviderConfig;
	urlOpener?: (url: string, redirectUrl: string) => Promise<any>;
	customState?: string;
	oAuthProvider?: SOCIAL_PROVIDER;
}
