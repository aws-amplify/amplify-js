// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Global manual mock for `@aws-amplify/storage` used across the predictions
// test suite. The predictions package only consumes `getUrl` from storage,
// so a minimal stub is sufficient. Individual tests can still call
// `jest.mock('@aws-amplify/storage', ...)` locally to override behavior.
module.exports = {
	getUrl: jest.fn().mockResolvedValue({ url: new URL('https://mocked/') }),
};
