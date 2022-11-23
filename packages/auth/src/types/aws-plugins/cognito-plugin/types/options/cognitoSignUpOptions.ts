// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClientMetadata, ValidationData } from '../models'

export type CognitoSignUpOptions = {
	validationData?: ValidationData;
	clientMetaData?: ClientMetadata;
}
