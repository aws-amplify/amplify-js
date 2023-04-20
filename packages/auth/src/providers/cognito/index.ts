// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { signUp } from './apis/signUp';
export { resetPassword } from './apis/resetPassword';
export { confirmResetPassword } from './apis/confirmResetPassword';

export { ClientMetadata } from './types/models/ClientMetadata';
export { CognitoResendSignUpCodeOptions } from './types/models/CognitoResendSignUpCodeOptions';
export { AuthPluginOptions } from './types/models/AuthPluginOptions';
export { ResendSignUpCodeRequest } from '../../types/requests/ResendSignUpCodeRequest';
export { AuthCodeDeliveryDetails } from './types/models/AuthCodeDeliveryDetails';
export type { CognitoUserAttributeKey } from './types/models/CognitoUserAttributeKey';
export { CustomAttribute } from './types/models/CustomAttribute';
export { ValidationData } from './types/models/ValidationData';
export { CognitoConfirmResetPasswordOptions } from './types/options/CognitoConfirmResetPasswordOptions';
export { CognitoSignUpOptions } from './types/options/CognitoSignUpOptions';
export { CognitoResetPasswordOptions } from './types/options/CognitoResetPasswordOptions';
