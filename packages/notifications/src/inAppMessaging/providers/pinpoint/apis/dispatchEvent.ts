// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PINPOINT_KEY_PREFIX,
	STORAGE_KEY_SUFFIX,
	processInAppMessages,
} from '../utils';
import { InAppMessage } from '../../../types';
import flatten from 'lodash/flatten';
import { defaultStorage } from '@aws-amplify/core';
import { notifyEventListeners } from '../../../../common';
import { assertServiceError } from '../../../errors';
import { DisptachEventInput } from '../types';
import { syncMessages } from './syncMessages';
import { conflictHandler, setConflictHandler } from './setConflictHandler';

/**
 * Trigges an InApp message to be displayed. Use this after the messages have been synced to the devices using
 * {@link syncMessages}. Based on the messages synced and the event passed to this API, it triggers the display
 * of the InApp message that meets the criteria. To change the conflict handler, use the {@link setConflictHandler} API.
 *
 * @param DisptachEventInput The input object that holds the event to be dispatched.
 *
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
 * await dispatchEvent({ name: "test_event" });
 * ```
 */
export async function dispatchEvent(input: DisptachEventInput): Promise<void> {
	try {
		const key = `${PINPOINT_KEY_PREFIX}${STORAGE_KEY_SUFFIX}`;
		const cachedMessages = await defaultStorage.getItem(key);
		const messages: InAppMessage[] = await processInAppMessages(
			cachedMessages ? JSON.parse(cachedMessages) : [],
			input.event
		);
		const flattenedMessages = flatten(messages);

		if (flattenedMessages.length > 0) {
			notifyEventListeners(
				'messageReceived',
				conflictHandler(flattenedMessages)
			);
		}
	} catch (error) {
		assertServiceError(error);
		throw error;
	}
}
