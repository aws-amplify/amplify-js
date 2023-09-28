// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Cache } from '@aws-amplify/core';
import { isBrowser } from '@aws-amplify/core/lib/utils';
import { v4 as uuid } from 'uuid';

const PERSONALIZE_CACHE = '_awsct';
const PERSONALIZE_CACHE_USERID = '_awsct_uid';
const PERSONALIZE_CACHE_SESSIONID = '_awsct_sid';
const DEFAULT_CACHE_PREFIX = 'personalize';
const TIMER_INTERVAL = 30 * 1000;
const DELIMITER = '.';
const CACHE_EXPIRY_IN_DAYS = 7;

const cachePrefix = (key: string): string =>
	isBrowser() ? key + DELIMITER + window.location.host : DEFAULT_CACHE_PREFIX;

const getCache = (key: string) => Cache.getItem(cachePrefix(key));

const setCache = (key: string, value: unknown) => {
	const expiredAt = new Date(
		Date.now() + 3_600_000 * 24 * CACHE_EXPIRY_IN_DAYS
	);
	Cache.setItem(cachePrefix(key), value, {
		expires: expiredAt.getTime(),
	});
};

export const resolveCachedSession = (trackingId: string) => {
	let sessionId: string | undefined = getCache(PERSONALIZE_CACHE_SESSIONID);
	if (!sessionId) {
		sessionId = uuid();
		setCache(PERSONALIZE_CACHE_SESSIONID, sessionId);
	}

	const userId: string | undefined = getCache(PERSONALIZE_CACHE_USERID);

	return {
		sessionId,
		userId,
	};
};

export const updateCachedSession = (
	newUserId: string,
	currentSessionId: string,
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
		const newSessionId = uuid();
		setCache(PERSONALIZE_CACHE_SESSIONID, newSessionId);
		setCache(PERSONALIZE_CACHE_USERID, newUserId);
	} else if (isRequireUpdateSession) {
		setCache(PERSONALIZE_CACHE_USERID, newUserId);
	}
};
