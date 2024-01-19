// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const isNode = () =>
	typeof process !== 'undefined' &&
	process.versions != null &&
	process.versions.node != null;
