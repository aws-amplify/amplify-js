// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import type {
	ConfirmForgotPasswordCommandInput as ConfirmForgotPasswordInput,
	ConfirmForgotPasswordCommandOutput as ConfirmForgotPasswordOutput,
	ForgotPasswordCommandInput as ForgotPasswordInput,
	ForgotPasswordCommandOutput as ForgotPasswordOutput,
	ResendConfirmationCodeCommandInput as ResendConfirmationCodeInput,
	ResendConfirmationCodeCommandOutput as ResendConfirmationCodeOutput,
	SignUpCommandInput as SignUpInput,
	SignUpCommandOutput as SignUpOutput,
	InitiateAuthCommandInput as InitiateAuthInput,
	InitiateAuthCommandOutput as InitiateAuthOutput,
	RespondToAuthChallengeCommandInput as RespondToAuthChallengeInput,
	RespondToAuthChallengeCommandOutput as RespondToAuthChallengeOutput,
	ConfirmSignUpCommandOutput as ConfirmSignUpOutput,
	ConfirmSignUpCommandInput as ConfirmSignUpInput,
	VerifySoftwareTokenCommandInput as VerifySoftwareTokenInput,
	VerifySoftwareTokenCommandOutput as VerifySoftwareTokenOutput,
	AssociateSoftwareTokenCommandInput as AssociateSoftwareTokenInput,
	AssociateSoftwareTokenCommandOutput as AssociateSoftwareTokenOutput,
	SetUserMFAPreferenceCommandInput as SetUserMFAPreferenceInput,
	SetUserMFAPreferenceCommandOutput as SetUserMFAPreferenceOutput,
	GetUserCommandInput as GetUserInput,
	GetUserCommandOutput as GetUserOutput,
	ChangePasswordCommandInput as ChangePasswordInput,
	ChangePasswordCommandOutput as ChangePasswordOutput,
	ConfirmDeviceCommandInput as ConfirmDeviceInput,
	ConfirmDeviceCommandOutput as ConfirmDeviceOutput,
	ForgetDeviceCommandInput as ForgetDeviceInput,
	ForgetDeviceCommandOutput as ForgetDeviceOutput,
	DeleteUserCommandInput as DeleteUserInput,
	DeleteUserCommandOutput as DeleteUserOutput,
	GetUserAttributeVerificationCodeCommandInput as GetUserAttributeVerificationCodeInput,
	GetUserAttributeVerificationCodeCommandOutput as GetUserAttributeVerificationCodeOutput,
	GlobalSignOutCommandInput as GlobalSignOutInput,
	GlobalSignOutCommandOutput as GlobalSignOutOutput,
	UpdateUserAttributesCommandInput as UpdateUserAttributesInput,
	UpdateUserAttributesCommandOutput as UpdateUserAttributesOutput,
	VerifyUserAttributeCommandInput as VerifyUserAttributeInput,
	VerifyUserAttributeCommandOutput as VerifyUserAttributeOutput,
	UpdateDeviceStatusCommandInput as UpdateDeviceStatusInput,
	UpdateDeviceStatusCommandOutput as UpdateDeviceStatusOutput,
	ListDevicesCommandInput as ListDevicesInput,
	ListDevicesCommandOutput as ListDevicesOutput,
} from './types';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	buildHttpRpcRequest,
	cognitoUserPoolTransferHandler,
	defaultConfig,
	getSharedHeaders,
} from './base';
import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
import { assertServiceError } from '../../../../../errors/utils/assertServiceError';
import { AuthError } from '../../../../../errors/AuthError';

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
	| 'UpdateDeviceStatus'
	| 'ListDevices';

const buildUserPoolSerializer =
	(operation: ClientOperation) =>
	<Input>(input: Input, endpoint: Endpoint): HttpRequest => {
		const headers = getSharedHeaders(operation);
		const body = JSON.stringify(input);
		return buildHttpRpcRequest(endpoint, headers, body);
	};

const userPoolDeserializer = async <Output>(
	response: HttpResponse
): Promise<Output> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		assertServiceError(error);
		throw new AuthError({ name: error.name, message: error.message });
	} else {
		const body = await parseJsonBody(response);
		return body as Output;
	}
};

export const initiateAuth = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('InitiateAuth')<InitiateAuthInput>,
	userPoolDeserializer<InitiateAuthOutput>,
	defaultConfig
);

export const signUp = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('SignUp')<SignUpInput>,
	userPoolDeserializer<SignUpOutput>,
	defaultConfig
);
export const confirmSignUp = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ConfirmSignUp')<ConfirmSignUpInput>,
	userPoolDeserializer<ConfirmSignUpOutput>,
	defaultConfig
);
export const forgotPassword = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ForgotPassword')<ForgotPasswordInput>,
	userPoolDeserializer<ForgotPasswordOutput>,
	defaultConfig
);
export const confirmForgotPassword = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ConfirmForgotPassword')<ConfirmForgotPasswordInput>,
	userPoolDeserializer<ConfirmForgotPasswordOutput>,
	defaultConfig
);
export const respondToAuthChallenge = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer(
		'RespondToAuthChallenge'
	)<RespondToAuthChallengeInput>,
	userPoolDeserializer<RespondToAuthChallengeOutput>,
	defaultConfig
);
export const resendConfirmationCode = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer(
		'ResendConfirmationCode'
	)<ResendConfirmationCodeInput>,
	userPoolDeserializer<ResendConfirmationCodeOutput>,
	defaultConfig
);
export const verifySoftwareToken = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('VerifySoftwareToken')<VerifySoftwareTokenInput>,
	userPoolDeserializer<VerifySoftwareTokenOutput>,
	defaultConfig
);
export const associateSoftwareToken = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer(
		'AssociateSoftwareToken'
	)<AssociateSoftwareTokenInput>,
	userPoolDeserializer<AssociateSoftwareTokenOutput>,
	defaultConfig
);
export const setUserMFAPreference = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('SetUserMFAPreference')<SetUserMFAPreferenceInput>,
	userPoolDeserializer<SetUserMFAPreferenceOutput>,
	defaultConfig
);
export const getUser = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('GetUser')<GetUserInput>,
	userPoolDeserializer<GetUserOutput>,
	defaultConfig
);
export const changePassword = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ChangePassword')<ChangePasswordInput>,
	userPoolDeserializer<ChangePasswordOutput>,
	defaultConfig
);
export const confirmDevice = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ConfirmDevice')<ConfirmDeviceInput>,
	userPoolDeserializer<ConfirmDeviceOutput>,
	defaultConfig
);
export const forgetDevice = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ForgetDevice')<ForgetDeviceInput>,
	userPoolDeserializer<ForgetDeviceOutput>,
	defaultConfig
);

export const deleteUser = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('DeleteUser')<DeleteUserInput>,
	userPoolDeserializer<DeleteUserOutput>,
	defaultConfig
);
export const getUserAttributeVerificationCode = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer(
		'GetUserAttributeVerificationCode'
	)<GetUserAttributeVerificationCodeInput>,
	userPoolDeserializer<GetUserAttributeVerificationCodeOutput>,
	defaultConfig
);
export const globalSignOut = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('GlobalSignOut')<GlobalSignOutInput>,
	userPoolDeserializer<GlobalSignOutOutput>,
	defaultConfig
);
export const updateUserAttributes = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('UpdateUserAttributes')<UpdateUserAttributesInput>,
	userPoolDeserializer<UpdateUserAttributesOutput>,
	defaultConfig
);
export const verifyUserAttribute = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('VerifyUserAttribute')<VerifyUserAttributeInput>,
	userPoolDeserializer<VerifyUserAttributeOutput>,
	defaultConfig
);
export const updateDeviceStatus = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('UpdateDeviceStatus')<UpdateDeviceStatusInput>,
	userPoolDeserializer<UpdateDeviceStatusOutput>,
	defaultConfig
);
export const listDevices = composeServiceApi(
	cognitoUserPoolTransferHandler,
	buildUserPoolSerializer('ListDevices')<ListDevicesInput>,
	userPoolDeserializer<ListDevicesOutput>,
	defaultConfig
);
