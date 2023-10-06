// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PINPOINT_KEY_PREFIX,
	STORAGE_KEY_SUFFIX,
	processInAppMessages,
} from '../utils';
import { InAppMessage, InAppMessagingEvent } from '../../../types';
import flatten from 'lodash/flatten';
import { defaultStorage } from '@aws-amplify/core';
import { notifyEventListeners } from '../../../../common';
import { assertServiceError } from '../../../errors';
import { InAppMessageConflictHandler } from '../types';

let conflictHandler: InAppMessageConflictHandler = defaultConflictHandler;

export function internalSetConflictHandler(
	handler: InAppMessageConflictHandler
): void {
	conflictHandler = handler;
}

export async function dispatchEvent(event: InAppMessagingEvent): Promise<void> {
	try {
		const key = `${PINPOINT_KEY_PREFIX}${STORAGE_KEY_SUFFIX}`;
		const cachedMessages = await defaultStorage.getItem(key);
		const messages: InAppMessage[] = await processInAppMessages(
			cachedMessages ? JSON.parse(cachedMessages) : [],
			event
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

function defaultConflictHandler(messages: InAppMessage[]): InAppMessage {
	// default behavior is to return the message closest to expiry
	// this function assumes that messages processed by providers already filters out expired messages
	const sorted = messages.sort((a, b) => {
		const endDateA = a.metadata?.endDate;
		const endDateB = b.metadata?.endDate;
		// if both message end dates are falsy or have the same date string, treat them as equal
		if (endDateA === endDateB) {
			return 0;
		}
		// if only message A has an end date, treat it as closer to expiry
		if (endDateA && !endDateB) {
			return -1;
		}
		// if only message B has an end date, treat it as closer to expiry
		if (!endDateA && endDateB) {
			return 1;
		}
		// otherwise, compare them
		return new Date(endDateA) < new Date(endDateB) ? -1 : 1;
	});
	// always return the top sorted
	return sorted[0];
}
