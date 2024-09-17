// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { s3TransferHandler } from '../../../../dI';

import {
	createDeleteObjectDeserializer,
	createDeleteObjectSerializer,
} from './shared/serde';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createDeleteObjectClient = () => {
	return composeServiceApi(
		s3TransferHandler,
		createDeleteObjectSerializer(),
		createDeleteObjectDeserializer(),
		{ ...DEFAULT_SERVICE_CLIENT_API_CONFIG, responseType: 'text' },
	);
};
