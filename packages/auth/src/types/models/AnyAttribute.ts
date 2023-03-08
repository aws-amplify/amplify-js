/**
 * A custom user attribute type.
 *
 * @remarks
 * This type can be used to represent use attributes not captured by standard OIDC claims.
 */
export type AnyAttribute = (string & {}) | Record<string, string>;
