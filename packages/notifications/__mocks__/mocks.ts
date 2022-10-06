/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
export const mockHub = {
	listen: jest.fn(),
};

export const mockInAppMessagingProvider = {
	configure: jest.fn(),
	getCategory: jest.fn(),
	getInAppMessages: jest.fn(),
	getProviderName: jest.fn(),
	getSubCategory: jest.fn(),
	identifyUser: jest.fn(),
	processInAppMessages: jest.fn(),
};

export const mockStorage = {
	getItem: jest.fn(),
	removeItem: jest.fn(),
	setItem: jest.fn(),
	sync: jest.fn(),
};
