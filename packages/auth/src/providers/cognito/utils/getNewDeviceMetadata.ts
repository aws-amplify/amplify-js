// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	base64Encoder,
	getDeviceName,
} from '@aws-amplify/core/internals/utils';

import { DeviceMetadata } from '../tokenProvider/types';
import { createConfirmDeviceClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import { NewDeviceMetadataType } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';

import { getAuthenticationHelper, getBytesFromHex } from './srp';

/**
 * This function is used to kick off the device management flow.
 *
 * If an error is thrown while generating a hash device or calling the `ConfirmDevice`
 * client, then this API will ignore the error and return undefined. Otherwise the authentication
 * flow will not complete and the user won't be able to be signed in.
 *
 * @returns DeviceMetadata | undefined
 */
export async function getNewDeviceMetadata({
	userPoolId,
	userPoolEndpoint,
	newDeviceMetadata,
	accessToken,
}: {
	userPoolId: string;
	userPoolEndpoint: string | undefined;
	newDeviceMetadata?: NewDeviceMetadataType;
	accessToken?: string;
}): Promise<DeviceMetadata | undefined> {
	if (!newDeviceMetadata) return undefined;
	const userPoolName = userPoolId.split('_')[1] || '';
	const authenticationHelper = await getAuthenticationHelper(userPoolName);
	const deviceKey = newDeviceMetadata?.DeviceKey;
	const deviceGroupKey = newDeviceMetadata?.DeviceGroupKey;

	try {
		await authenticationHelper.generateHashDevice(
			deviceGroupKey ?? '',
			deviceKey ?? '',
		);
	} catch (errGenHash) {
		// TODO: log error here
		return undefined;
	}

	const deviceSecretVerifierConfig = {
		Salt: base64Encoder.convert(
			getBytesFromHex(authenticationHelper.getSaltToHashDevices()),
		),
		PasswordVerifier: base64Encoder.convert(
			getBytesFromHex(authenticationHelper.getVerifierDevices()),
		),
	};
	const randomPassword = authenticationHelper.getRandomPassword();

	try {
		const confirmDevice = createConfirmDeviceClient({
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		});
		await confirmDevice(
			{ region: getRegionFromUserPoolId(userPoolId) },
			{
				AccessToken: accessToken,
				DeviceName: await getDeviceName(),
				DeviceKey: newDeviceMetadata?.DeviceKey,
				DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
			},
		);

		return {
			deviceKey,
			deviceGroupKey,
			randomPassword,
		};
	} catch (error) {
		// TODO: log error here
		return undefined;
	}
}
