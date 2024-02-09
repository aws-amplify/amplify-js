// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type NetworkStatus = {
	online: boolean;
};

// TODO: can reuse the type defined at packages/core/src/utils/deDupeAsyncFunction.ts#L5
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
	T extends (...args: any) => Promise<infer R> ? R : any;
