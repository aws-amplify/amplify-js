// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { s3TransferHandler } from '../../../../dI';

import {
	createCopyObjectDeserializer,
	createCopyObjectSerializer,
} from './shared/serde';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';

export const createCopyObjectClient = () => {
	return composeServiceApi(
		s3TransferHandler,
		createCopyObjectSerializer(),
		createCopyObjectDeserializer(),
		{ ...DEFAULT_SERVICE_CLIENT_API_CONFIG, responseType: 'text' },
	);
};
