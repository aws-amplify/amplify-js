/**
 * @jest-environment node
 */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	extractContent,
	mapOSPlatform,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils/helpers';

import {
	nonBrowserConfigTestCases,
	pinpointInAppMessage,
	extractedContent,
	nativeButtonOverrides,
} from '../../../../testUtils/data';
import { mergeExpectedContentWithExpectedOverride, mergeInAppMessageWithOverrides } from '../../../../testUtils/mergeInAppMessageWithOverrides';

jest.mock('@aws-amplify/core');

jest.mock('@aws-amplify/core/internals/utils', () => {
	const originalModule = jest.requireActual(
		'@aws-amplify/core/internals/utils',
	);
	return {
		...originalModule,
		getClientInfo: jest.fn(), // Setup as a Jest mock function without implementation
	};
});

describe('InAppMessaging Provider Utils (running natively)', () => {
	describe('mapOSPlatform method', () => {
		nonBrowserConfigTestCases.forEach(({ os, expectedPlatform }) => {
			test(`correctly maps OS "${os}" to ConfigPlatformType "${expectedPlatform}"`, () => {
				const result = mapOSPlatform(os);
				expect(result).toBe(expectedPlatform);
			});
		});
	});

	describe('extractContent with overrides', () => {
		nativeButtonOverrides.forEach(
			({ buttonOverrides, configPlatform, mappedPlatform }) => {
				const message = mergeInAppMessageWithOverrides(
					pinpointInAppMessage,
					mappedPlatform,
					buttonOverrides,
				);
				const expectedContent = mergeExpectedContentWithExpectedOverride(
					extractedContent[0],
					buttonOverrides,
				);

				test(`correctly extracts content for ${configPlatform}`, () => {
					const utils = require('@aws-amplify/core/internals/utils');
					// Dynamically override the mock for getClientInfo
					utils.getClientInfo.mockImplementation(() => ({
						platform: configPlatform,
					}));

					const [firstContent] = extractContent(message);
					expect(firstContent.primaryButton).toStrictEqual(
						expectedContent.primaryButton,
					);
					expect(firstContent.secondaryButton).toStrictEqual(
						expectedContent.secondaryButton,
					);
				});
			},
		);
	});
});
