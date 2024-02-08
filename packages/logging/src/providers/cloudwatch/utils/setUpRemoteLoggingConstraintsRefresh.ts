// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	FetchRemoteLoggingConstraints,
	RemoteLoggingConstraintsRefreshConfiguration,
} from '../types/configuration';

import { fetchRemoteLoggingConstraints as defaultFetchRemoteLoggingConstraints } from './fetchRemoteLoggingConstraints';
import { setLoggingConstraints } from './loggingConstraintsHelpers';

let interval: ReturnType<typeof setInterval> | undefined;

export const setUpRemoteLoggingConstraintsRefresh = async ({
	endpoint,
	refreshIntervalInSeconds = 1200, // default 20 minutes
	fetchRemoteLoggingConstraints = defaultFetchRemoteLoggingConstraints,
}: RemoteLoggingConstraintsRefreshConfiguration) => {
	// Try to fetch remote logging constraints immediately. If errors are thrown here, they can be caught to provide
	// better insight into what may have gone wrong. Future attemps by the refreshing will only be able to log errors.
	setLoggingConstraints(await fetchRemoteLoggingConstraints(endpoint));
	const refreshRemoteLoggingConstraints = getRemoteLoggingConstraintsRefresher(
		endpoint,
		fetchRemoteLoggingConstraints,
	);
	if (interval) {
		clearInterval(interval);
	}
	const refreshIntervalInMilliseconds = refreshIntervalInSeconds * 1000;
	interval = setInterval(
		refreshRemoteLoggingConstraints,
		refreshIntervalInMilliseconds,
	);
};

const getRemoteLoggingConstraintsRefresher =
	(
		endpoint: string,
		fetchRemoteLoggingConstraints: FetchRemoteLoggingConstraints,
	) =>
	async () => {
		try {
			setLoggingConstraints(await fetchRemoteLoggingConstraints(endpoint));
		} catch (e) {
			// Logging error here since the background refreshing aren't awaited on and so thrown errors cannot be caught.
			// TODO: Update to use logging itself for ... logging.
		}
	};
