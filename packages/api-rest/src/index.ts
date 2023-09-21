// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DeleteOperation,
	GetOperation,
	PutOperation,
	PatchOperation,
	PostOperation,
	HeadOperation,
	DeleteOptions,
	GetOptions,
	PutOptions,
	PatchOptions,
	PostOptions,
	HeadOptions,
} from './types';

// TODO[allanzhengyp]: clear them
export { cancel, isCancel } from './API';
export { DocumentType } from './types';

type ApiInput<Options> = {
	// TODO[allanzhengyp]: optional?
	apiName: string;
	path: string;
	options?: Options;
};

export const get = (input: ApiInput<GetOptions>): GetOperation => {
	// TODO;
	return {} as GetOperation;
};

export const del = (input: ApiInput<DeleteOptions>): DeleteOperation => {
	// TODO;
	return {} as DeleteOperation;
};

export const put = (input: ApiInput<PutOptions>): PutOperation => {
	// TODO;
	return {} as PutOperation;
};

export const patch = (input: ApiInput<PatchOptions>): PatchOperation => {
	// TODO;
	return {} as PatchOperation;
};

export const post = (input: ApiInput<PostOptions>): PostOperation => {
	// TODO;
	return {} as PostOperation;
};

export const head = (input: ApiInput<HeadOptions>): HeadOperation => {
	// TODO;
	return {} as HeadOperation;
};
