// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	initializeInAppMessaging,
	setConflictHandler,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import { setConflictHandler as setConflictHandlerInteral } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');
jest.mock('../../../../../src/eventListeners');

const mockSetConflictHandlerInteral = setConflictHandlerInteral as jest.Mock;

describe('setConflictHandler', () => {
	beforeAll(() => {
		initializeInAppMessaging();
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
