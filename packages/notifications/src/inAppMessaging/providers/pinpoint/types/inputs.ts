// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IdentifyUserOptions, InAppMessageConflictHandler } from '.';
import {
	InAppMessagingEvent,
	InAppMessagingIdentifyUserInput,
} from '../../../types';

/**
 * Input type for Pinpoint identifyUser API.
 */
export type IdentifyUserInput =
	InAppMessagingIdentifyUserInput<IdentifyUserOptions>;

/**
 * Input type for Pinpoint dispatchEvent API.
 */
export type DisptachEventInput = InAppMessagingEvent;

/**
 * Input type for Pinpoint SetConflictHandler API.
 */
export type SetConflictHandlerInput = InAppMessageConflictHandler;
