// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	HttpResponse,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { validationErrorMap } from '../../../../common/AuthErrorStrings';
import { AuthError } from '../../../../errors/AuthError';
import { AuthValidationErrorCode } from '../../../../errors/types/validation';
import { assertServiceError } from '../../../../errors/utils/assertServiceError';
import { SignUpException } from '../../../../providers/cognito/types/errors';

import { createUserPoolSerializer } from './shared/serde';
import { cognitoUserPoolTransferHandler } from './shared/handler';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';
import {
	ServiceClientFactoryInput,
	SignUpCommandInput,
	SignUpCommandOutput,
} from './types';

export const createSignUpClientDeserializer =
	(): ((response: HttpResponse) => Promise<SignUpCommandOutput>) =>
	async (response: HttpResponse): Promise<SignUpCommandOutput> => {
		if (response.statusCode >= 300) {
			const error = await parseJsonError(response);
			assertServiceError(error);

			if (
				// Missing Password Error
				// 1 validation error detected: Value at 'password'failed to satisfy constraint: Member must not be null
				error.name === SignUpException.InvalidParameterException &&
				/'password'/.test(error.message) &&
				/Member must not be null/.test(error.message)
			) {
				const name = AuthValidationErrorCode.EmptySignUpPassword;
				const { message, recoverySuggestion } = validationErrorMap[name];
				throw new AuthError({
					name,
					message,
					recoverySuggestion,
				});
			}

			throw new AuthError({ name: error.name, message: error.message });
		}

		return parseJsonBody(response);
	};

export const createSignUpClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoUserPoolTransferHandler,
		createUserPoolSerializer<SignUpCommandInput>('SignUp'),
		createSignUpClientDeserializer(),
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
		},
	);
