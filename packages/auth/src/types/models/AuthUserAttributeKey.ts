import { AnyAttribute } from './AnyAttribute';
import { AuthStandardAttributeKey } from './AuthStandardAttributeKey';

/**
 * A user attribute type consisting of standard OIDC claims or custom attributes.
 */
export type AuthUserAttributeKey = AuthStandardAttributeKey | AnyAttribute;
