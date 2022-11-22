import { AdditionalInfo, AuthCodeDeliveryDetails, AuthSignUpStep } from '.';
import { AuthUserAttributeKey } from './authUserAttributeKey';

export type AuthNextSignUpStep<UserAttributeKey extends AuthUserAttributeKey> = {
	signUpStep: AuthSignUpStep;
	additionalInfo?: AdditionalInfo;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
}