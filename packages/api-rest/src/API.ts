// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { RestClient } from './RestClient';
import { PostOptions } from './types';

const restClient = new RestClient({ headers: {}, endpoints: [] });
export function post(url: string, options: PostOptions) {
	return restClient.post(url, options);
}

export function cancel(request: Promise<unknown>, message?: string) {
	return restClient.cancel(request, message);
}

export function isCancel(error: Error) {
	return restClient.isCancel(error);
}
