// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolvePrefix as defaultPrefixResolver } from '../../../../utils/resolvePrefix';
import { ResolvePrefixInput } from '../../../../types/inputs';

/**
 * Resolves the object prefix based on the {@link accessLevel} and {@link targetIdentityId}.
 *
 * This is the default prefix resolver used by the storage category and S3 provider.
 * You can use this util function to determine the "full path" of an object in your
 * interest.
 *
 * @param input The input that's required to resolve prefix.
 * @param input.accessLevel The access level associated with the prefix.
 * @param input.targetIdentityId  The target identity associated with the prefix,
 * if `undefined`, its value will be the identity id of current signed in user.
 * @returns resolved prefix.
 *
 * @example
 * import { defaultPrefixResolver } from 'aws-amplify/storage/s3/utils';
 * import { StorageAccessLevel } from '@aws-amplify/core';
 *
 * async function getFullPathForKey({
 *   key,
 *   accessLevel = 'guest',
 *   targetIdentityId,
 * }: {
 *   key: string,
 *   accessLevel?: StorageAccessLevel,
 *   targetIdentityId?: string,
 * }) {
 *   const prefix = await defaultPrefixResolver({
 *     accessLevel,
 *     targetIdentityId,
 *   });
 *
 *   return `${prefix}${key}`;
 * }
 *
 * const fullPath = await getFullPathForKey({ key: ''my-file.txt, accessLevel: 'private' });
 */
export const accessLevelAndIdentityAwarePrefixResolver = async (
	input: ResolvePrefixInput
) => {
	const { accessLevel, targetIdentityId } = input;
	const { identityId } = await Amplify.Auth.fetchAuthSession();
	return defaultPrefixResolver({
		accessLevel,
		targetIdentityId: targetIdentityId ?? identityId,
	});
};
