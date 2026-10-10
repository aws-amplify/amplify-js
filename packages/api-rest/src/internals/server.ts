// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Pattern 6 (Phase C4): the server entry is a bare re-export of the ctx-native
// internal `post` API. The internal `post` already accepts an `AmplifyContext`
// (or, transitionally, an `AmplifyClassV6` that it bridges) as its first
// argument, so the previous `resolveServerContext` wrapper is no longer needed.
export {
	post,
	cancel,
	updateRequestToBeCancellable,
} from '../apis/common/internalPost';
