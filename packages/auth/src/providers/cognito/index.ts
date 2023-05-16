// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { signUp } from './apis/signUp';
export { resetPassword } from './apis/resetPassword';
export { confirmResetPassword } from './apis/confirmResetPassword';
export { signIn } from './apis/signIn';

export { ClientMetadata } from './types/models/ClientMetadata';
export { CognitoUserAttributeKey } from './types/models/CognitoUserAttributeKey';
export { CustomAttribute } from './types/models/CustomAttribute';
export { ValidationData } from './types/models/ValidationData';
export { AuthFlowType } from './types/models/AuthFlowType';
export { CognitoConfirmResetPasswordOptions } from './types/options/CognitoConfirmResetPasswordOptions';
export { CognitoSignUpOptions } from './types/options/CognitoSignUpOptions';
export { CognitoResetPasswordOptions } from './types/options/CognitoResetPasswordOptions';
export { CognitoSignInOptions } from './types/options/CognitoSignInOptions';
