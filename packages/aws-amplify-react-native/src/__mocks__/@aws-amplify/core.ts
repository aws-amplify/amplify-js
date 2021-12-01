/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

// export unmocked core modules
export * from '@aws-amplify/core';

// mock log functions
const mockDebug = jest.fn();
const mockError = jest.fn();
const mockInfo = jest.fn();
const mockWarn = jest.fn();
const mockLog = jest.fn();

const mockVerbose = jest.fn();
const mockAddPluggable = jest.fn();
const mockListPluggables = jest.fn();

// mock logger
const ConsoleLogger = jest.fn().mockImplementation(() => {
	return {
		addPluggable: mockAddPluggable,
		debug: mockDebug,
		error: mockError,
		info: mockInfo,
		listPluggables: mockListPluggables,
		log: mockLog,
		verbose: mockVerbose,
		warn: mockWarn,
	};
});

export { ConsoleLogger };
