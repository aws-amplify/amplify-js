import { AdditionalInfo, AuthCodeDeliveryDetails, AuthSignInStep } from '.';
import { AuthUserAttributeKey } from './authUserAttributeKey';

export type AuthNextSignInStep<UserAttributeKey extends AuthUserAttributeKey> = {
	signInStep: AuthSignInStep;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	additionalInfo?: AdditionalInfo;
	totpCode?: string;
	missingAttributes?: UserAttributeKey[];
}