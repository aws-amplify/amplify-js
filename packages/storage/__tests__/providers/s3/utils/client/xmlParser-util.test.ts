// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { parser as browserParser } from '../../../../../src/providers/s3/utils/client/runtime/index.browser';
import { parser as nodeParser } from '../../../../../src/providers/s3/utils/client/runtime/index';

import cases from './xmlParser-fixture';

describe('xmlParser for browsers', () => {
	cases.forEach(({ spec, xml, expected }) => {
		it(`should parse ${spec} correctly`, () => {
			expect(browserParser.parse(xml)).toEqual(expected);
		});
	});
});

describe('xmlParser for non-browsers', () => {
	cases.forEach(({ spec, xml, expected }) => {
		it(`should parse ${spec} correctly`, () => {
			expect(nodeParser.parse(xml)).toEqual(expected);
		});
	});
});
