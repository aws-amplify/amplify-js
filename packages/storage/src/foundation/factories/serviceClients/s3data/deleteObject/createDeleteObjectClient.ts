// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { s3TransferHandler } from '../../../../dI';
import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from '../constants';

import { createDeleteObjectSerializer } from './createDeleteObjectSerializer';
import { createDeleteObjectDeserializer } from './createDeleteObjectDeserializer';

export const createDeleteObjectClient = () => {
	return composeServiceApi(
		s3TransferHandler,
		createDeleteObjectSerializer(),
		createDeleteObjectDeserializer(),
		{ ...DEFAULT_SERVICE_CLIENT_API_CONFIG, responseType: 'text' },
	);
};
