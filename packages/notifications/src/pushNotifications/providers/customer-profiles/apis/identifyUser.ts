// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { PushNotificationValidationErrorCode } from '../../../errors';
import { IdentifyUser, IdentifyUserInput } from '../types';

/**
 * Sends information about a user to Amazon Connect Customer Profiles. Sending user information allows you to associate
 * a user with their Customer Profile and the device(s) registered for push notifications, so that activity can be
 * tracked across devices & platforms by using the same `userId`.
 *
 * @param {IdentifyUserInput} input The input object used to construct the request sent to the Amazon Connect Customer
 *  Profiles endpoint.
 * @throws service - Thrown when the Customer Profiles endpoint responds with a non-2xx status or the request fails to
 *  complete.
 * @throws validation: {@link PushNotificationValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against an unsupported platform. Currently,
 * only React Native is supported by this API.
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
 *         address: 'device-address',
 *         optOut: 'NONE',
 *         userAttributes: {
 *             interests: ['food']
 *         },
 *     },
 * });
 */
export const identifyUser: IdentifyUser = async () => {
	throw new PlatformNotSupportedError();
};
