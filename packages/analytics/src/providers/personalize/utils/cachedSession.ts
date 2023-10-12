// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Cache } from '@aws-amplify/core';
import { isBrowser, amplifyUuid } from '@aws-amplify/core/internals/utils';

const PERSONALIZE_CACHE_USERID = '_awsct_uid';
const PERSONALIZE_CACHE_SESSIONID = '_awsct_sid';
const DEFAULT_CACHE_PREFIX = 'personalize';
const DELIMITER = '.';
const CACHE_EXPIRY_IN_DAYS = 7;

const normalize = (key: string): string =>
	[key, isBrowser() ? window.location.host : DEFAULT_CACHE_PREFIX].join(
		DELIMITER
	);

const getCache = (key: string) => Cache.getItem(normalize(key));

const setCache = (key: string, value: unknown) => {
	const expiredAt = new Date(
		Date.now() + 3_600_000 * 24 * CACHE_EXPIRY_IN_DAYS
	);
	Cache.setItem(normalize(key), value, {
		expires: expiredAt.getTime(),
	});
};

export const resolveCachedSession = async () => {
	let sessionId: string | undefined = await getCache(
		PERSONALIZE_CACHE_SESSIONID
	);
	if (!sessionId) {
		sessionId = amplifyUuid();
		setCache(PERSONALIZE_CACHE_SESSIONID, sessionId);
	}

	const userId: string | undefined = await getCache(PERSONALIZE_CACHE_USERID);

	return {
		sessionId,
		userId,
	};
};

export const updateCachedSession = (
	newUserId?: string,
	currentSessionId?: string,
	currentUserId?: string
) => {
	const isNoCachedSession = !currentSessionId;
	const isSignOutCase = !newUserId && !currentUserId;
	const isSwitchUserCase =
		!!newUserId && !!currentUserId && newUserId !== currentUserId;

	const isRequireNewSession =
		isNoCachedSession || isSignOutCase || isSwitchUserCase;
	const isRequireUpdateSession =
		!!currentSessionId && !currentUserId && !!newUserId;

	if (isRequireNewSession) {
		const newSessionId = amplifyUuid();
		setCache(PERSONALIZE_CACHE_SESSIONID, newSessionId);
		setCache(PERSONALIZE_CACHE_USERID, newUserId);
	} else if (isRequireUpdateSession) {
		setCache(PERSONALIZE_CACHE_USERID, newUserId);
	}
};
