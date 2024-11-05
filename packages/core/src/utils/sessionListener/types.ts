// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type SessionState = 'started' | 'ended';

export type SessionStateChangeListener = (state: SessionState) => void;

export interface SessionListenerInterface {
	addStateChangeListener(listener: SessionStateChangeListener): void;
	removeStateChangeListener(listener: SessionStateChangeListener): void;
}
