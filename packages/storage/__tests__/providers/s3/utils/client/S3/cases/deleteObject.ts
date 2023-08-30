// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { deleteObject } from '../../../../../../../src/providers/s3/utils/client';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html
const deleteObjectHappyCase: ApiFunctionalTestCase<typeof deleteObject> = [
	'happy case',
	'deleteObject',
	deleteObject,
	defaultConfig,
	{
		Bucket: 'bucket',
		Key: 'key',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key',
		}),
		method: 'DELETE',
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: '',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
	},
];

export default [deleteObjectHappyCase];
