// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUserInternal } from '../utils/identifyUserInternal';
import { IdentifyUser } from '../types';

/**
 * Sends information about a user to Amazon Connect Customer Profiles. Sending user information allows you to associate
 * a user with their Customer Profile so that activity can be tracked across devices & platforms by using the same
 * `userId`.
 *
 * On the browser there is no push device token, so this performs a device-less profile identify: the user's `userId`
 * and `userProfile` (e.g. email) are associated with their Customer Profile without registering a device. To register
 * a device for push notifications, call `identifyUser` from a React Native application where a device token is
 * available.
 *
 * @param {IdentifyUserInput} input The input object used to construct the request sent to the Amazon Connect Customer
 *  Profiles endpoint.
 * @throws service - Thrown when the Customer Profiles endpoint responds with a non-2xx status or the request fails to
 *  complete.
 * @throws validation - Thrown when the provided parameters or library
 *  configuration is incorrect.
 * @returns A promise that will resolve when the operation is complete.
 * @example
 * ```ts
 * // Identify a user with Amazon Connect Customer Profiles
 * await identifyUser({
 *     userId,
 *     userProfile: {
 *         email: 'userEmail@example.com'
 *         customProperties: {
 *             phoneNumber: ['555-555-5555'],
 *         },
 *     }
 * });
 * ```
 *
 * @example
 * ```ts
 * // Identify a user with additional options
 * await identifyUser({
 *     userId,
 *     userProfile: {
 *         email: 'userEmail@example.com'
 *         customProperties: {
 *             phoneNumber: ['555-555-5555'],
 *         },
 *         demographic: {
 *             platform: 'ios',
 *             timezone: 'America/Los_Angeles'
 *         }
 *     },
 *     options: {
 *         optOut: 'NONE',
 *         userAttributes: {
 *             interests: ['food']
 *         },
 *     },
 * });
 */
export const identifyUser: IdentifyUser = async ({
	userId,
	userProfile,
	options,
}) => {
	// Browser has no push device token — send a device-less profile identify.
	// No `deviceToken`/`channelType` is passed, so `identifyUserInternal`
	// attaches no device fields and never imports/calls any React-Native-only
	// module (`getDeviceId`), keeping the web bundle free of
	// `@aws-amplify/react-native`.
	await identifyUserInternal({
		userId,
		userProfile,
		options,
	});
};
