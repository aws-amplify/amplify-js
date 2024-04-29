// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { assertServiceError } from '../../../../../errors/utils/assertServiceError';
import { AuthError } from '../../../../../errors/AuthError';

import {
	buildHttpRpcRequest,
	cognitoUserPoolTransferHandler,
	defaultConfig,
	getSharedHeaders,
} from './base';
import type {
	AssociateSoftwareTokenCommandInput as AssociateSoftwareTokenInput,
	AssociateSoftwareTokenCommandOutput as AssociateSoftwareTokenOutput,
	ChangePasswordCommandInput as ChangePasswordInput,
	ChangePasswordCommandOutput as ChangePasswordOutput,
	ConfirmDeviceCommandInput as ConfirmDeviceInput,
	ConfirmDeviceCommandOutput as ConfirmDeviceOutput,
	ConfirmForgotPasswordCommandInput as ConfirmForgotPasswordInput,
	ConfirmForgotPasswordCommandOutput as ConfirmForgotPasswordOutput,
	ConfirmSignUpCommandInput as ConfirmSignUpInput,
	ConfirmSignUpCommandOutput as ConfirmSignUpOutput,
	DeleteUserAttributesCommandInput as DeleteUserAttributesInput,
	DeleteUserAttributesCommandOutput as DeleteUserAttributesOutput,
	DeleteUserCommandInput as DeleteUserInput,
	DeleteUserCommandOutput as DeleteUserOutput,
	ForgetDeviceCommandInput as ForgetDeviceInput,
	ForgetDeviceCommandOutput as ForgetDeviceOutput,
	ForgotPasswordCommandInput as ForgotPasswordInput,
	ForgotPasswordCommandOutput as ForgotPasswordOutput,
	GetUserAttributeVerificationCodeCommandInput as GetUserAttributeVerificationCodeInput,
	GetUserAttributeVerificationCodeCommandOutput as GetUserAttributeVerificationCodeOutput,
	GetUserCommandInput as GetUserInput,
	GetUserCommandOutput as GetUserOutput,
	GlobalSignOutCommandInput as GlobalSignOutInput,
	GlobalSignOutCommandOutput as GlobalSignOutOutput,
	InitiateAuthCommandInput as InitiateAuthInput,
	InitiateAuthCommandOutput as InitiateAuthOutput,
	ListDevicesCommandInput as ListDevicesInput,
	ListDevicesCommandOutput as ListDevicesOutput,
	ResendConfirmationCodeCommandInput as ResendConfirmationCodeInput,
	ResendConfirmationCodeCommandOutput as ResendConfirmationCodeOutput,
	RespondToAuthChallengeCommandInput as RespondToAuthChallengeInput,
	RespondToAuthChallengeCommandOutput as RespondToAuthChallengeOutput,
	SetUserMFAPreferenceCommandInput as SetUserMFAPreferenceInput,
	SetUserMFAPreferenceCommandOutput as SetUserMFAPreferenceOutput,
	SignUpCommandInput as SignUpInput,
	SignUpCommandOutput as SignUpOutput,
	UpdateDeviceStatusCommandInput as UpdateDeviceStatusInput,
	UpdateDeviceStatusCommandOutput as UpdateDeviceStatusOutput,
	UpdateUserAttributesCommandInput as UpdateUserAttributesInput,
	UpdateUserAttributesCommandOutput as UpdateUserAttributesOutput,
	VerifySoftwareTokenCommandInput as VerifySoftwareTokenInput,
	VerifySoftwareTokenCommandOutput as VerifySoftwareTokenOutput,
	VerifyUserAttributeCommandInput as VerifyUserAttributeInput,
	VerifyUserAttributeCommandOutput as VerifyUserAttributeOutput,
} from './types';

interface RevokeTokenInput {
	Token: string;
	ClientId: string;
}

type RevokeTokenOutput = Record<string, unknown>;

type ClientOperation =
	| 'SignUp'
	| 'ConfirmSignUp'
	| 'ForgotPassword'
	| 'ConfirmForgotPassword'
	| 'InitiateAuth'
	| 'RespondToAuthChallenge'
	| 'ResendConfirmationCode'
	| 'VerifySoftwareToken'
	| 'AssociateSoftwareToken'
	| 'SetUserMFAPreference'
	| 'GetUser'
	| 'ChangePassword'
	| 'ConfirmDevice'
	| 'ForgetDevice'
	| 'DeleteUser'
	| 'GetUserAttributeVerificationCode'
	| 'GlobalSignOut'
	| 'UpdateUserAttributes'
	| 'VerifyUserAttribute'
	| 'DeleteUserAttributes'
	| 'UpdateDeviceStatus'
	| 'ListDevices'
	| 'RevokeToken';

const buildUserPoolSerializer =
	<Input>(operation: ClientOperation) =>
	(input: Input, endpoint: Endpoint): HttpRequest => {
		const headers = getSharedHeaders(operation);
		const body = JSON.stringify(input);

		return buildHttpRpcRequest(endpoint, headers, body);
	};

const buildUserPoolDeserializer = <Output>(): ((
	response: HttpResponse,
) => Promise<Output>) => {
	return async (response: HttpResponse): Promise<Output> => {
		if (response.statusCode >= 300) {
			const error = await parseJsonError(response);
			assertServiceError(error);
			throw new AuthError({ name: error.name, message: error.message });
		} else {
			const body = await parseJsonBody(response);

			return body;
		}
	};
};

const handleEmptyResponseDeserializer = <Output>(): ((
	response: HttpResponse,
) => Promise<Output>) => {
	return async (response: HttpResponse): Promise<Output> => {
		if (response.statusCode >= 300) {
			const error = await parseJsonError(response);
			assertServiceError(error);
			throw new AuthError({ name: error.name, message: error.message });
		} else {
			return undefined as any;
		}
	};
};

export const initiateAuth = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<InitiateAuthInput>('InitiateAuth'),
	buildUserPoolDeserializer<InitiateAuthOutput>(),
	defaultConfig,
);

export const revokeToken = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<RevokeTokenInput>('RevokeToken'),
	buildUserPoolDeserializer<RevokeTokenOutput>(),
	defaultConfig,
);

export const signUp = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<SignUpInput>('SignUp'),
	buildUserPoolDeserializer<SignUpOutput>(),
	defaultConfig,
);
export const confirmSignUp = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ConfirmSignUpInput>('ConfirmSignUp'),
	buildUserPoolDeserializer<ConfirmSignUpOutput>(),
	defaultConfig,
);
export const forgotPassword = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ForgotPasswordInput>('ForgotPassword'),
	buildUserPoolDeserializer<ForgotPasswordOutput>(),
	defaultConfig,
);
export const confirmForgotPassword = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ConfirmForgotPasswordInput>('ConfirmForgotPassword'),
	buildUserPoolDeserializer<ConfirmForgotPasswordOutput>(),
	defaultConfig,
);
export const respondToAuthChallenge = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<RespondToAuthChallengeInput>(
		'RespondToAuthChallenge',
	),
	buildUserPoolDeserializer<RespondToAuthChallengeOutput>(),
	defaultConfig,
);
export const resendConfirmationCode = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ResendConfirmationCodeInput>(
		'ResendConfirmationCode',
	),
	buildUserPoolDeserializer<ResendConfirmationCodeOutput>(),
	defaultConfig,
);
export const verifySoftwareToken = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<VerifySoftwareTokenInput>('VerifySoftwareToken'),
	buildUserPoolDeserializer<VerifySoftwareTokenOutput>(),
	defaultConfig,
);
export const associateSoftwareToken = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<AssociateSoftwareTokenInput>(
		'AssociateSoftwareToken',
	),
	buildUserPoolDeserializer<AssociateSoftwareTokenOutput>(),
	defaultConfig,
);
export const setUserMFAPreference = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<SetUserMFAPreferenceInput>('SetUserMFAPreference'),
	buildUserPoolDeserializer<SetUserMFAPreferenceOutput>(),
	defaultConfig,
);
export const getUser = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<GetUserInput>('GetUser'),
	buildUserPoolDeserializer<GetUserOutput>(),
	defaultConfig,
);
export const changePassword = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ChangePasswordInput>('ChangePassword'),
	buildUserPoolDeserializer<ChangePasswordOutput>(),
	defaultConfig,
);
export const confirmDevice = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ConfirmDeviceInput>('ConfirmDevice'),
	buildUserPoolDeserializer<ConfirmDeviceOutput>(),
	defaultConfig,
);
export const forgetDevice = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ForgetDeviceInput>('ForgetDevice'),
	handleEmptyResponseDeserializer<ForgetDeviceOutput>(),
	defaultConfig,
);
export const deleteUser = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<DeleteUserInput>('DeleteUser'),
	handleEmptyResponseDeserializer<DeleteUserOutput>(),
	defaultConfig,
);
export const getUserAttributeVerificationCode = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<GetUserAttributeVerificationCodeInput>(
		'GetUserAttributeVerificationCode',
	),
	buildUserPoolDeserializer<GetUserAttributeVerificationCodeOutput>(),
	defaultConfig,
);
export const globalSignOut = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<GlobalSignOutInput>('GlobalSignOut'),
	buildUserPoolDeserializer<GlobalSignOutOutput>(),
	defaultConfig,
);
export const updateUserAttributes = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<UpdateUserAttributesInput>('UpdateUserAttributes'),
	buildUserPoolDeserializer<UpdateUserAttributesOutput>(),
	defaultConfig,
);
export const verifyUserAttribute = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<VerifyUserAttributeInput>('VerifyUserAttribute'),
	buildUserPoolDeserializer<VerifyUserAttributeOutput>(),
	defaultConfig,
);
export const updateDeviceStatus = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<UpdateDeviceStatusInput>('UpdateDeviceStatus'),
	buildUserPoolDeserializer<UpdateDeviceStatusOutput>(),
	defaultConfig,
);
export const listDevices = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<ListDevicesInput>('ListDevices'),
	buildUserPoolDeserializer<ListDevicesOutput>(),
	defaultConfig,
);
export const deleteUserAttributes = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer<DeleteUserAttributesInput>('DeleteUserAttributes'),
	buildUserPoolDeserializer<DeleteUserAttributesOutput>(),
	defaultConfig,
);
