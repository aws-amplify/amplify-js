// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PersonalizeEvent {
	userId?: string;
	eventId?: string;
	eventType: string;
	properties: Record<string, unknown>;
}

export type RecordInput = PersonalizeEvent;
