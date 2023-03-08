import { AuthSignUpStep } from '../enums/AuthSignUpStep';
import { AdditionalInfo } from './AdditionalInfo';
import { AuthCodeDeliveryDetails } from './AuthCodeDeliveryDetails';
import { AuthUserAttributeKey } from './AuthUserAttributeKey';

export type AuthNextSignUpStep<UserAttributeKey extends AuthUserAttributeKey> =
	{
		signUpStep?: AuthSignUpStep;
		additionalInfo?: AdditionalInfo;
		codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	};
