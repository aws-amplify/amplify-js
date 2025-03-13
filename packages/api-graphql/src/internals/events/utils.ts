// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';
import {
	DocumentType,
	GraphQLAuthMode,
} from '@aws-amplify/core/internals/utils';

import type { ResolvedGraphQLAuthModes } from './types';

export const normalizeAuth = (
	explicitAuthMode: GraphQLAuthMode | undefined,
	defaultAuthMode: ResolvedGraphQLAuthModes,
): ResolvedGraphQLAuthModes => {
	if (!explicitAuthMode) {
		return defaultAuthMode;
	}

	if (explicitAuthMode === 'identityPool') {
		return 'iam';
	}

	return explicitAuthMode;
};

export const configure = () => {
	const config = Amplify.getConfig();

	const eventsConfig = config.API?.Events;

	if (!eventsConfig) {
		throw new Error(
			'Amplify configuration is missing. Have you called Amplify.configure()?',
		);
	}

	const configAuthMode = normalizeAuth(eventsConfig.defaultAuthMode, 'apiKey');

	const options = {
		appSyncGraphqlEndpoint: eventsConfig.endpoint,
		region: eventsConfig.region,
		authenticationType: configAuthMode,
		apiKey: eventsConfig.apiKey,
	};

	return options;
};

/**
 * Event API expects an array of JSON strings
 *
 * @param events - JSON-serializable value or an array of values
 * @returns array of JSON strings
 */
export const serializeEvents = (
	events: DocumentType | DocumentType[],
): string[] => {
	if (Array.isArray(events)) {
		return events.map((ev, idx) => {
			const eventJson = JSON.stringify(ev);
			if (eventJson === undefined) {
				throw new Error(
					`Event must be a valid JSON value. Received ${ev} at index ${idx}`,
				);
			}

			return eventJson;
		});
	}

	const eventJson = JSON.stringify(events);
	if (eventJson === undefined) {
		throw new Error(`Event must be a valid JSON value. Received ${events}`);
	}

	return [eventJson];
};
