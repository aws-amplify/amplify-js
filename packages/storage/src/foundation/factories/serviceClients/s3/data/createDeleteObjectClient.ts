// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { s3TransferHandler } from '../utils/runtime';

import type { ServiceClientFactoryInput } from './types';
import {
	createDeleteObjectDeserializer,
	createDeleteObjectSerializer,
} from './shared/serde';
import { defaultConfig } from './base';

export const createDeleteObjectClient = (config?: ServiceClientFactoryInput) =>
	composeServiceApi(
		s3TransferHandler,
		createDeleteObjectSerializer(),
		createDeleteObjectDeserializer(),
		{ ...defaultConfig, responseType: 'text', ...config },
	);
