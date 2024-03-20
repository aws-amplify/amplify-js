// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import flatten from 'lodash/flatten.js';
import { defaultStorage } from '@aws-amplify/core';

import { notifyEventListeners } from '../../../../eventListeners';
import {
	InAppMessagingValidationErrorCode,
	assertServiceError,
} from '../../../errors';
import { InAppMessage } from '../../../types';
import { assertIsInitialized } from '../../../utils';
import { DispatchEventInput } from '../types';
import {
	PINPOINT_KEY_PREFIX,
	STORAGE_KEY_SUFFIX,
	getConflictHandler,
	processInAppMessages,
} from '../utils';

import { syncMessages } from './syncMessages';
import { setConflictHandler } from './setConflictHandler';

/**
 * Triggers an In-App message to be displayed. Use this after your campaigns have been synced to the device using
 * {@link syncMessages}. Based on the messages synced and the event passed to this API, it triggers the display
 * of the In-App message that meets the criteria.
 *
 * @remark
 * If an event would trigger multiple messages, the message closest to expiry will be chosen by default.
 * To change this behavior, you can use the {@link setConflictHandler} API to provide
 * your own logic for resolving message conflicts.
 *
 * @param input The input object that holds the event to be dispatched.
 *
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 * configuration is incorrect, or if In App messaging hasn't been initialized.
 * @throws service exceptions - Thrown when the underlying Pinpoint service returns an error.
 *
 * @returns A promise that will resolve when the operation is complete.
 *
 * @example
 * ```ts
 * // Sync message before disptaching an event
 * await syncMessages();
 *
 * // Dispatch an event
 * await dispatchEvent({ name: 'test_event' });
 * ```
 */
export async function dispatchEvent(input: DispatchEventInput): Promise<void> {
	assertIsInitialized();
	try {
		const key = `${PINPOINT_KEY_PREFIX}${STORAGE_KEY_SUFFIX}`;
		const cachedMessages = await defaultStorage.getItem(key);
		const messages: InAppMessage[] = await processInAppMessages(
			cachedMessages ? JSON.parse(cachedMessages) : [],
			input,
		);
		const flattenedMessages = flatten(messages);
		if (flattenedMessages.length > 0) {
			const conflictHandler = getConflictHandler();
			notifyEventListeners(
				'messageReceived',
				conflictHandler(flattenedMessages),
			);
		}
	} catch (error) {
		assertServiceError(error);
		throw error;
	}
}
