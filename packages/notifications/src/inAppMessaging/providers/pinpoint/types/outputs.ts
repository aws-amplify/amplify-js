// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventListenerRemover } from '../../../../eventListeners';

/**
 * Output type for OnMessageReceived API.
 */
export type OnMessageReceivedOutput = EventListenerRemover;

/**
 * Output type for OnMessageDisplayed API.
 */
export type OnMessageDisplayedOutput = EventListenerRemover;

/**
 * Output type for OnMessageDismissed API.
 */
export type OnMessageDismissedOutput = EventListenerRemover;

/**
 * Output type for OnMessageActionTaken API.
 */
export type OnMessageActionTakenOutput = EventListenerRemover;
