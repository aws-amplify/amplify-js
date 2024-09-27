// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isDnsCompatibleBucketName } from '../../../../../../src/foundation/factories/serviceClients/s3data/validators/isDnsCompatibleBucketName';

describe('isDnsCompatibleBucketName', () => {
	it.each([
		'valid-bucket-name',
		'a.bucket.name',
		'bucket123',
		'123invalid-start',
		'bucket--name',
	])('should return true for dns compatible bucket name: %s', bucketName => {
		expect(isDnsCompatibleBucketName(bucketName)).toBe(true);
	});

	it.each([
		'', // Empty string
		'fo', // too short
		'bucketnamewithtoolongcharactername'.repeat(5), // Name longer than 63 characters
		'invalid.bucket..name', // consecutive dots
		'bucket_name_with_underscores', // contains underscores
		'.bucketwithleadingperiod', // leading period
		'.bucketwithtrailingperiod', // trailing period
		'bucketCapitalLetters', // capital letters
		'bucketnameendswith-', // ends with a hyphen
		'255.255.255.255', // IP address
		'::1', // IPv6 address
	])('should return false for dns incompatible bucket name: %s', bucketName => {
		expect(isDnsCompatibleBucketName(bucketName)).toBe(false);
	});
});
