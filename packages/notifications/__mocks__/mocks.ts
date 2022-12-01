// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
