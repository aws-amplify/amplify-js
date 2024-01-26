// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingError } from '../../../errors';
import {
	LoggingConstraints,
	RemoteConfiguration,
} from '../types/configuration';
import { setLoggingConstraints } from './loggingConstraints';

let interval: ReturnType<typeof setInterval> | undefined;

export const setUpRemoteConfigurationRefresh = ({
	endpoint,
	refreshIntervalInSeconds,
}: RemoteConfiguration) => {
	const refreshRemoteLoggingConstraints =
		getRemoteLoggingConstraintsRefresher(endpoint);
	if (interval) {
		clearInterval(interval);
	}
	const refreshIntervalInMilliseconds = refreshIntervalInSeconds * 1000;
	refreshRemoteLoggingConstraints();
	interval = setInterval(
		refreshRemoteLoggingConstraints,
		refreshIntervalInMilliseconds
	);
};

const fetchRemoteLoggingConstraints = async (
	endpoint: string
): Promise<LoggingConstraints> => {
	try {
		const result = await fetch(endpoint);
		const resultString = await result.text();
		return JSON.parse(resultString);
	} catch (error) {
		throw new LoggingError({
			name: 'RemoteLoggingConstraintsFailure',
			message: 'Failed to fetch remote logging constraints',
			underlyingError: error,
		});
	}
};

const getRemoteLoggingConstraintsRefresher = (endpoint: string) => async () => {
	try {
		setLoggingConstraints(await fetchRemoteLoggingConstraints(endpoint));
	} catch (e) {
		// Logging error here since the background refreshing aren't awaited on and so thrown errors cannot be caught.
		// TODO: Update to use logging itself for ... logging.
	}
};
