// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthFlowType, ClientMetadata } from '../models';

export type CognitoSignInOptions = {
	authFlowType: AuthFlowType;
	clientMetadata?: ClientMetadata
}
