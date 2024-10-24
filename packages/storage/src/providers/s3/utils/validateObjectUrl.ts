// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { extendedEncodeURIComponent } from '@aws-amplify/core/internals/aws-client-utils';

import { IntegrityError } from '../../../errors/IntegrityError';

export function validateObjectUrl({
	bucketName,
	key,
	objectURL,
}: {
	bucketName?: string;
	key?: string;
	objectURL?: URL;
}): void {
	if (!bucketName || !key || !objectURL) {
		throw new IntegrityError();
	}
	const bucketWithDots = bucketName.includes('.');
	const encodedBucketName = extendedEncodeURIComponent(bucketName);
	const encodedKey = key.split('/').map(extendedEncodeURIComponent).join('/');
	const isPathStyleUrl =
		objectURL.pathname === `/${encodedBucketName}/${encodedKey}`;
	const isSubdomainUrl =
		objectURL.hostname.startsWith(`${encodedBucketName}.`) &&
		objectURL.pathname === `/${encodedKey}`;

	if (!(isPathStyleUrl || (!bucketWithDots && isSubdomainUrl))) {
		throw new IntegrityError();
	}
}
