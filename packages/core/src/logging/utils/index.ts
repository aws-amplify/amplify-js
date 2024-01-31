// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { getTimestamp } from './timeUtils';
export { isWithinCurrentLogLevel, logLevelIndex } from './log';
export { createBaseLogger } from './createBaseLogger';
export {
	getConsoleLogLevel,
	setConsoleLogLevel,
	getConsoleLogFunction,
} from './consoleHelpers';
