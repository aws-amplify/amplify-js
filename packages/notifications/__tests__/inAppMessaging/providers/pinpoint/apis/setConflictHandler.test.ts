// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import {
	initializeInAppMessaging,
	setConflictHandler,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import { setConflictHandler as setConflictHandlerInteral } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	sessionListener: { addStateChangeListener: jest.fn() },
}));
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');
jest.mock('../../../../../src/eventListeners');

const mockSetConflictHandlerInteral = setConflictHandlerInteral as jest.Mock;

describe('setConflictHandler', () => {
	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
		initializeInAppMessaging();
	});

	afterAll(() => {
		clearGlobalContext();
	});

	afterEach(() => {
		mockSetConflictHandlerInteral.mockClear();
	});

	it('can register a custom conflict handler', async () => {
		const customConflictHandler = jest.fn();
		setConflictHandler(customConflictHandler);
		expect(mockSetConflictHandlerInteral).toHaveBeenCalledWith(
			customConflictHandler,
		);
	});
});
