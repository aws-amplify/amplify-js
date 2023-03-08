import { DeliveryMedium } from '../enums/DeliveryMedium';
import { AuthUserAttributeKey } from './AuthUserAttributeKey';
import { GetAttributeKey } from './GetAttributeKey';

export type AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	destination: string;
	deliveryMedium: DeliveryMedium;
	attributeName?: GetAttributeKey<UserAttributeKey>;
};
