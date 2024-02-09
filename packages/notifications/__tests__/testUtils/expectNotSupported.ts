// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const ERROR_MSG = 'Function not supported on current platform';

export const expectNotSupported = (call: unknown) => {
	expect(call).toThrow(ERROR_MSG);
};

export const expectNotSupportedAsync = async (call: unknown) => {
	await expect(call).rejects.toThrow(ERROR_MSG);
};
