// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum StateMachineHubEventName {
	STATE_TRANSITION = 'STATE_TRANSITION',
	NULL_TRANSITION = 'NULL_TRANSITION',
	STATE_GUARD_FAILURE = 'STATE_GUARD_FAILURE',
	NEXT_STATE_NOT_FOUND = 'NEXT_STATE_NOT_FOUND',
}
