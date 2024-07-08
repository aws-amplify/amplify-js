// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { validateCredentialsProviderLocation } from '../../../src/storageBrowser/locationCredentialsStore/validators';
import {
	StorageBrowserValidationErrorCode,
	validationErrorMap,
} from '../../../src/storage-browser/errors/validation';

jest.mock('../../../src/storageBrowser/locationCredentialsStore/registry');

const mockBucket = 'MOCK_BUCKET';

describe('validateCredentialsProviderLocation', () => {
	it('should NOT throw if action path matches credentials path prefix', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: mockBucket,
					path: 'path/to/*',
					permission: 'READ',
				},
			);
		}).not.toThrow();
	});

	it('should throw if action path does not path credentials path prefix', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: mockBucket,
					path: 'path/to/other/*',
					permission: 'READ',
				},
			);
		}).toThrow(
			validationErrorMap[
				StorageBrowserValidationErrorCode.LocationCredentialsPathMismatch
			].message,
		);
	});

	it('should NOT throw if action path matches credentials object path', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
			);
		}).not.toThrow();
	});

	it('should throw if action path does not match credentials object path', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: mockBucket,
					path: 'path/to/object2',
					permission: 'READ',
				},
			);
		}).toThrow(
			validationErrorMap[
				StorageBrowserValidationErrorCode.LocationCredentialsPathMismatch
			].message,
		);
	});

	it('should throw if action bucket and credentials bucket does not match', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: 'bucket-1',
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: 'bucket-2',
					path: 'path/to/object',
					permission: 'READ',
				},
			);
		}).toThrow(
			validationErrorMap[
				StorageBrowserValidationErrorCode.LocationCredentialsBucketMismatch
			].message,
		);
	});

	it('should not throw if READ action permission matches READWRITE credentials permission', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: mockBucket,
					path: 'path/to/*',
					permission: 'READWRITE',
				},
			);
		}).not.toThrow();
	});

	it('should not throw if WRITE action permission matches READWRITE credentials permission', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'WRITE',
				},
				{
					bucket: mockBucket,
					path: 'path/to/*',
					permission: 'READWRITE',
				},
			);
		}).not.toThrow();
	});

	it('should throw if READ action permission does not match WRITE credentials permission', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READ',
				},
				{
					bucket: mockBucket,
					path: 'path/to/*',
					permission: 'WRITE',
				},
			);
		}).toThrow(
			validationErrorMap[
				StorageBrowserValidationErrorCode.LocationCredentialsPermissionMismatch
			].message,
		);
	});

	it('should throw if WRITE action permission does not match READ credentials permission', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'WRITE',
				},
				{
					bucket: mockBucket,
					path: 'path/to/*',
					permission: 'READ',
				},
			);
		}).toThrow(
			validationErrorMap[
				StorageBrowserValidationErrorCode.LocationCredentialsPermissionMismatch
			].message,
		);
	});

	it('should throw if READWRITE action permission does not match READ credentials permission', () => {
		expect(() => {
			validateCredentialsProviderLocation(
				{
					bucket: mockBucket,
					path: 'path/to/object',
					permission: 'READWRITE',
				},
				{
					bucket: mockBucket,
					path: 'path/to/*',
					permission: 'READ',
				},
			);
		}).toThrow(
			validationErrorMap[
				StorageBrowserValidationErrorCode.LocationCredentialsPermissionMismatch
			].message,
		);
	});
});
