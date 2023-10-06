// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessageConflictHandler } from '../types';
import { internalSetConflictHandler } from './dispatchEvent';

export function setConflictHandler(handler: InAppMessageConflictHandler): void {
	internalSetConflictHandler(handler);
}
