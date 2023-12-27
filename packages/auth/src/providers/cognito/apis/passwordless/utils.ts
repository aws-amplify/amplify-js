// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
// import { AuthPasswordlessDeliveryDestination } from '../../types/models';
import { MetadataBearer } from '@aws-amplify/core/dist/esm/clients/types/aws';
import { RespondToAuthChallengeCommandInput } from '../../utils/clients/CognitoIdentityProvider/types';
import { ClientMetaData } from '../../../../types/Auth';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../../errors/types/validation';
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	SignInWithEmailAndMagicLinkInput,
	SignInWithEmailAndOTPInput,
	SignInWithSMSAndOTPInput,
} from '../../types';
import {
	isSignInWithEmailAndMagicLinkInput,
	isSignInWithEmailAndOTPInput,
	isSignInWithSMSAndOTPInput,
} from '../../utils/signInHelpers';

// export function getDeliveryMedium(
// 	destination: AuthPasswordlessDeliveryDestination
// ) {
// 	const deliveryMediumMap: Record<AuthPasswordlessDeliveryDestination, string> =
// 		{
// 			EMAIL: 'EMAIL',
// 			PHONE: 'SMS',
// 		};
// 	return deliveryMediumMap[destination];
// }

// export const parseApiServiceError = async (
// 	response?: HttpResponse
// ): Promise<(Error & MetadataBearer) | undefined> => {
// 	const parsedError = await parseJsonError(response);
// 	if (!parsedError) {
// 		// Response is not an error.
// 		return;
// 	}
// 	return Object.assign(parsedError, {
// 		$metadata: parsedError.$metadata,
// 	});
// };

// export const getRespondToAuthChallengeInput = (
// 	clientMetadata: ClientMetaData,
// 	username: string
// ): RespondToAuthChallengeCommandInput => {
// 	return {
// 		ChallengeName: 'CUSTOM_CHALLENGE',
// 		ClientId: clientMetadata.clientId,
// 		Session: clientMetadata.session,
// 		ChallengeResponses: {
// 			USERNAME: username,
// 		},
// 		ClientMetadata: clientMetadata,
// 	};
// };

export const validatePasswordlessInput = (
	input:
		| SignInWithEmailAndMagicLinkInput
		| SignInWithEmailAndOTPInput
		| SignInWithSMSAndOTPInput,
	amplify: AmplifyClassV6
) => {
	assertValidationError(
		!!input.username,
		AuthValidationErrorCode.EmptySignInUsername
	);
	assertValidationError(
		!input.password,
		AuthValidationErrorCode.PasswordlessSignInHasPassword
	);
	if (input.passwordless?.deliveryMedium === 'EMAIL') {
		assertValidationError(
			!!amplify.libraryOptions.Auth?.magicLinkRedirectURL,
			AuthValidationErrorCode.EmptyPasswordlessRedirectURI
		);
	}
};
