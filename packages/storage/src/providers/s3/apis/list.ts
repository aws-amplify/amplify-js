// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	ListAllInput,
	ListPaginateInput,
	ListAllOutput,
	ListPaginateOutput,
} from '../types';
import { list as listInternal } from './internal/list';

type ListApi = {
	/**
	 * List files with given prefix in pages
	 * pageSize defaulted to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The ListPaginateInput object.
	 * @returns A list of keys and metadata with
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(input?: ListPaginateInput): Promise<ListPaginateOutput>;
	/**
	 * List all files from S3. You can set `listAll` to true in `options` to get all the files from S3.
	 * @param input - The ListAllInput object.
	 * @returns A list of keys and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(input?: ListAllInput): Promise<ListAllOutput>;
};

export const list: ListApi = (
	input?: ListAllInput | ListPaginateInput
): Promise<ListAllOutput | ListPaginateOutput> => {
	return listInternal(Amplify, input ?? {});
};
