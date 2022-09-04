import { ConfirmSignInParams } from 'src/types/model/signin/ConfirmSignInParams';

export type CognitoConfirmSignInOptions = ConfirmSignInParams & {
	session: string;
	username: string;
	clientId: string;
};
