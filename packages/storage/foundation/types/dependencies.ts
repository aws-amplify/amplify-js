// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Shared dependency injection interfaces for foundation layer
export interface S3ConfigProvider {
	bucket: string;
	region: string;
	credentials: any;
	customEndpoint?: string;
	forcePathStyle?: boolean;
}

export interface IdentityProvider {
	identityId?: string;
	keyPrefix: string;
}

export interface ValidationProvider {
	validateStorageInput(
		inputData: any,
		userIdentityId?: string,
	): { inputType: string; objectKey: string };
	validateBucketOwner(bucketOwner?: string): void;
	assertValidation?(condition: boolean, errorCode: string): void;
}

export interface S3ServiceClient {
	getPresignedGetObjectUrl?(config: any, params: any): Promise<string>;
	headObject?(config: any, params: any): Promise<any>;
}

export interface GetUrlDependencies {
	s3Config: S3ConfigProvider;
	identity: IdentityProvider;
	validator: ValidationProvider;
	s3Client: S3ServiceClient;
}

export interface GetPropertiesDependencies {
	s3Config: S3ConfigProvider;
	identity: IdentityProvider;
	validator: ValidationProvider;
	s3Client: S3ServiceClient;
}
