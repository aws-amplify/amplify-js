// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageBrowserValidationErrorCode } from '../errors/validation';
import { assertValidationError } from '../errors/utils/assertValidationError';
import { BucketLocation, Permission } from '../../providers/s3/types/options';

interface CredentialsBucketLocation extends BucketLocation {
	permission: Permission;
}

/**
 * @internal
 */
export const validateCredentialsProviderLocation = (
	actionLocation: CredentialsBucketLocation,
	providerLocation: CredentialsBucketLocation,
): void => {
	validateLocationBucket({
		actionBucket: actionLocation.bucket,
		providerBucket: providerLocation.bucket,
	});
	validateLocationPath({
		actionPath: actionLocation.path,
		providerPath: providerLocation.path,
	});
	validateLocationPermission({
		actionPermission: actionLocation.permission,
		providerPermission: providerLocation.permission,
	});
};

const validateLocationBucket = (input: {
	actionBucket: string;
	providerBucket?: string;
}): void => {
	const { actionBucket, providerBucket } = input;
	if (!providerBucket) {
		return;
	}
	assertValidationError(
		actionBucket === providerBucket,
		StorageBrowserValidationErrorCode.LocationCredentialsBucketMismatch,
	);
};

const validateLocationPath = (input: {
	actionPath: string;
	providerPath?: string;
}): void => {
	const { actionPath, providerPath } = input;
	if (!providerPath) {
		return;
	}
	if (providerPath.endsWith('*')) {
		// Verify if the action path has prefix required by the provider;
		const providerPathPrefix = providerPath.replace(/\*$/, '');
		assertValidationError(
			actionPath.startsWith(providerPathPrefix),
			StorageBrowserValidationErrorCode.LocationCredentialsPathMismatch,
		);
	} else {
		// If provider path is scoped to an object, verify if the action path points to the same object.
		// TODO(@AllanZhengYP) Provider more info in error message: actionPath, providerPath.
		assertValidationError(
			actionPath === providerPath,
			StorageBrowserValidationErrorCode.LocationCredentialsPathMismatch,
		);
	}
};

const validateLocationPermission = (input: {
	actionPermission: Permission;
	providerPermission?: Permission;
}) => {
	const { actionPermission, providerPermission } = input;
	if (!providerPermission) {
		return;
	}
	// TODO(@AllanZhengYP) Provide more info in error message: `API needs permission ${actionPermission}, but provided
	// location credentials provider with permission ${providerPermission}.`
	assertValidationError(
		providerPermission.includes(actionPermission),
		StorageBrowserValidationErrorCode.LocationCredentialsPermissionMismatch,
	);
};
