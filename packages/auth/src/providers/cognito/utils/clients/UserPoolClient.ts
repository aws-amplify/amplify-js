// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

export const UserPoolClient = {
	// TODO: update when config is typed properly
	region: Amplify.config['aws_cognito_region'],
	clientId: Amplify.config['aws_user_pools_web_client_id'],
};
