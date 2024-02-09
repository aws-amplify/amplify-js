// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingError } from '../../../errors';
import { FetchRemoteLoggingConstraints } from '../types/configuration';

import { fetchRemoteLoggingConstraintsFromApiGateway } from './fetchRemoteLoggingConstraintsFromApiGateway';
import { resolveConfig } from './resolveConfig';
import { resolveCredentials } from './resolveCredentials';

export const fetchRemoteLoggingConstraints: FetchRemoteLoggingConstraints =
	async (endpoint: string) => {
		const { credentials } = await resolveCredentials();
		const { region } = resolveConfig();
		try {
			return await fetchRemoteLoggingConstraintsFromApiGateway(
				{ credentials, region },
				endpoint,
			);
		} catch (error) {
			throw new LoggingError({
				name: 'RemoteLoggingConstraintsFailure',
				message: 'Failed to fetch remote logging constraints',
				underlyingError: error,
			});
		}
	};
