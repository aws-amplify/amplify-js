// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	GetUrlInput,
	GetUrlOutput,
	GetUrlWithPathInput,
	GetUrlWithPathOutput,
} from '../../src/providers/s3/types';
import { resolveFinalKey } from '../utils/resolveFinalKey';
import { constructContentDisposition } from '../utils/constructContentDisposition';
import {
	DEFAULT_PRESIGN_EXPIRATION,
	MAX_URL_EXPIRATION,
} from '../utils/constants';

/**
 * Dependency injection interfaces for GetUrl foundation layer
 */
export interface S3ConfigProvider {
	bucket: string;
	region: string;
	credentials: any; // AWSCredentials or function returning Promise<AWSCredentials>
	customEndpoint?: string;
	forcePathStyle?: boolean;
}

export interface IdentityProvider {
	identityId?: string;
	keyPrefix: string;
}

export interface ValidationResult {
	inputType: string;
	objectKey: string;
}

export interface ValidationProvider {
	validateStorageInput(input: any, identityId?: string): ValidationResult;
	validateBucketOwner(bucketOwner?: string): void;
	assertValidation(condition: boolean, errorCode: string): void;
}

export interface S3ServiceClient {
	getPresignedGetObjectUrl(config: any, params: any): Promise<string>;
	headObject?(config: any, params: any): Promise<any>;
}

export interface GetUrlDependencies {
	s3Config: S3ConfigProvider;
	identity: IdentityProvider;
	validator: ValidationProvider;
	s3Client: S3ServiceClient;
}

/**
 * Calculate URL expiration based on options and credential expiration
 */
const calculateUrlExpiration = (
	requestedExpirationInSec?: number,
	credentialExpiration?: Date,
): number => {
	let urlExpirationInSec =
		requestedExpirationInSec ?? DEFAULT_PRESIGN_EXPIRATION;

	if (credentialExpiration) {
		const awsCredExpirationInSec = Math.floor(
			(credentialExpiration.getTime() - Date.now()) / 1000,
		);
		urlExpirationInSec = Math.min(awsCredExpirationInSec, urlExpirationInSec);
	}

	return urlExpirationInSec;
};

/**
 * Construct response object with URL and expiration
 */
const constructGetUrlResponse = (
	url: string,
	expirationInSec: number,
): { url: URL; expiresAt: Date } => {
	return {
		url: new URL(url),
		expiresAt: new Date(Date.now() + expirationInSec * 1000),
	};
};

/**
 * Validate expiration against maximum limits
 */
const validateExpirationLimits = (expirationInSec: number): boolean => {
	const maxUrlExpirationInSec = MAX_URL_EXPIRATION / 1000;

	return expirationInSec <= maxUrlExpirationInSec;
};

/**
 * Core getUrl business logic - pure function with dependency injection
 */
export const getUrlFlow = async (
	input: GetUrlInput | GetUrlWithPathInput,
	dependencies: GetUrlDependencies,
): Promise<GetUrlOutput | GetUrlWithPathOutput> => {
	const { s3Config, identity, validator, s3Client } = dependencies;
	const { options: getUrlOptions } = input;

	// Input validation and transformation
	const { inputType, objectKey } = validator.validateStorageInput(
		input,
		identity.identityId,
	);
	validator.validateBucketOwner(getUrlOptions?.expectedBucketOwner);

	// Construct final S3 key using existing utility
	const finalKey = resolveFinalKey(inputType, objectKey, identity.keyPrefix);

	// Optional object existence validation
	if (getUrlOptions?.validateObjectExistence && s3Client.headObject) {
		await s3Client.headObject(s3Config, {
			Bucket: s3Config.bucket,
			Key: finalKey,
			ExpectedBucketOwner: getUrlOptions?.expectedBucketOwner,
		});
	}

	// Resolve credentials if function
	const resolvedCredential =
		typeof s3Config.credentials === 'function'
			? await s3Config.credentials()
			: s3Config.credentials;

	// Calculate URL expiration
	const urlExpirationInSec = calculateUrlExpiration(
		getUrlOptions?.expiresIn,
		resolvedCredential.expiration,
	);

	// Validate expiration limits
	validator.assertValidation(
		validateExpirationLimits(urlExpirationInSec),
		'UrlExpirationMaxLimitExceed',
	);

	// Prepare S3 parameters
	const s3Params = {
		Bucket: s3Config.bucket,
		Key: finalKey,
		...(getUrlOptions?.contentDisposition && {
			ResponseContentDisposition: constructContentDisposition(
				getUrlOptions.contentDisposition,
			),
		}),
		...(getUrlOptions?.contentType && {
			ResponseContentType: getUrlOptions.contentType,
		}),
		ResponseCacheControl: getUrlOptions?.cacheControl,
		ExpectedBucketOwner: getUrlOptions?.expectedBucketOwner,
	};

	// Generate presigned URL
	const url = await s3Client.getPresignedGetObjectUrl(
		{
			...s3Config,
			credentials: resolvedCredential,
			expiration: urlExpirationInSec,
		},
		s3Params,
	);

	// Construct and return response
	return constructGetUrlResponse(url, urlExpirationInSec);
};
