// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointServiceOptions } from '@aws-amplify/core/internals/providers/pinpoint';

type CustomerProfilesServiceOptions = PinpointServiceOptions & {
	channelType?: 'GCM' | 'APNS' | 'APNS_SANDBOX' | 'IN_APP';
};

/**
 * Options specific to the Amazon Connect Customer Profiles `identifyUser` API.
 *
 * Reuses the shared {@link PinpointServiceOptions} (`address`, `optOut`,
 * `userAttributes`) so callers migrating between providers use the same shape,
 * with an added optional `channelType`. Matches the frozen REST contract's
 * `options` object.
 *
 * The homomorphic `Pick<T, keyof T>` flattens the intersection into a mapped
 * type so TypeScript can prove it satisfies the `Record<string, unknown>`
 * constraint of `AnalyticsServiceOptions` (a plain intersection with the
 * `PinpointServiceOptions` interface does not).
 */
export type IdentifyUserOptions = Pick<
	CustomerProfilesServiceOptions,
	keyof CustomerProfilesServiceOptions
>;
