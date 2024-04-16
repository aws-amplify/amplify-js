// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getConflictHandler,
	setConflictHandler,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils/conflictHandlerManager';
import {
	closestExpiryMessage,
	customHandledMessage,
	inAppMessages,
} from '../../../../testUtils/data';

describe('conflictHandlerManager', () => {
	const newConflictHandler = jest.fn(() => customHandledMessage);

	afterEach(() => {
		newConflictHandler.mockClear();
	});

	it('has a default conflict handler to start', () => {
		const defaultConflictHandler = getConflictHandler();
		expect(defaultConflictHandler).toBeDefined();
		expect(defaultConflictHandler(inAppMessages)).toStrictEqual(
			closestExpiryMessage,
		);
	});

	it('can set and get a custom conflict handler', () => {
		setConflictHandler(newConflictHandler);
		const customConflictHandler = getConflictHandler();
		expect(customConflictHandler).toBe(newConflictHandler);
		expect(customConflictHandler(inAppMessages)).toStrictEqual(
			customHandledMessage,
		);
	});
});
