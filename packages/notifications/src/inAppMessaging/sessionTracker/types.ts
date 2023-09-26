// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type SessionState = 'started' | 'ended';

export type SessionStateChangeHandler = (state: SessionState) => void;

export interface SessionTrackerInterface {
	start: () => SessionState;
	end: () => SessionState;
}
