// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { extendedEncodeURIComponent } from '../../../../../src/clients/middleware/signing/utils/extendedEncodeURIComponent';

describe('extendedEncodeURIComponent', () => {
	test('encodes additional characters', () => {
		expect(extendedEncodeURIComponent("!'()*")).toBe('%21%27%28%29%2A');
	});
});
