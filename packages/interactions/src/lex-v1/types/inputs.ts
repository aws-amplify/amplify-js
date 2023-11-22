// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InteractionsOnCompleteInput,
	InteractionsSendInput,
} from '~/src/types';

/**
 * Input type for LexV1 send API.
 */
export type SendInput = InteractionsSendInput;

/**
 * Input type for LexV1 onComplete API.
 */
export type OnCompleteInput = InteractionsOnCompleteInput;
