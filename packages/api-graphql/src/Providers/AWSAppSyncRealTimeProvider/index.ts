// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CustomUserAgentDetails,
	DocumentType,
	GraphQLAuthMode,
	USER_AGENT_HEADER,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import { CustomHeaders } from '@aws-amplify/data-schema/runtime';

import { DEFAULT_KEEP_ALIVE_TIMEOUT, MESSAGE_TYPES } from '../constants';
import { AWSWebSocketProvider } from '../AWSWebSocketProvider';
import { awsRealTimeHeaderBasedAuth } from '../AWSWebSocketProvider/authHeaders';

// resolved/actual AuthMode values. identityPool gets resolves to IAM upstream in InternalGraphQLAPI._graphqlSubscribe
type ResolvedGraphQLAuthModes = Exclude<GraphQLAuthMode, 'identityPool'>;

export interface AWSAppSyncRealTimeProviderOptions {
	appSyncGraphqlEndpoint?: string;
	authenticationType?: ResolvedGraphQLAuthModes;
	query?: string;
	variables?: DocumentType;
	apiKey?: string;
	region?: string;
	libraryConfigHeaders?(): Promise<Record<string, unknown> | Headers>;
	additionalHeaders?: CustomHeaders;
	additionalCustomHeaders?: Record<string, string>;
	authToken?: string;
}

interface DataObject extends Record<string, unknown> {
	data: Record<string, unknown>;
}

interface DataPayload {
	id: string;
	payload: DataObject;
	type: string;
}

const PROVIDER_NAME = 'AWSAppSyncRealTimeProvider';
const WS_PROTOCOL_NAME = 'graphql-ws';
const CONNECT_URI = '/connect';

export class AWSAppSyncRealTimeProvider extends AWSWebSocketProvider {
	constructor() {
		super({
			providerName: PROVIDER_NAME,
			wsProtocolName: WS_PROTOCOL_NAME,
			connectUri: CONNECT_URI,
		});
	}

	getProviderName() {
		return PROVIDER_NAME;
	}

	public subscribe(
		options?: AWSAppSyncRealTimeProviderOptions,
		customUserAgentDetails?: CustomUserAgentDetails,
	) {
		return super.subscribe(options, customUserAgentDetails);
	}

	protected async _prepareSubscriptionPayload({
		options,
		subscriptionId,
		customUserAgentDetails,
		additionalCustomHeaders,
		libraryConfigHeaders,
	}: {
		options: AWSAppSyncRealTimeProviderOptions;
		subscriptionId: string;
		customUserAgentDetails: CustomUserAgentDetails | undefined;
		additionalCustomHeaders: Record<string, string>;
		libraryConfigHeaders: Record<string, string>;
	}): Promise<string> {
		const {
			appSyncGraphqlEndpoint,
			authenticationType,
			query,
			variables,
			apiKey,
			region,
		} = options;
		const data = {
			query,
			variables,
		};
		const serializedData = JSON.stringify(data);

		const headers = {
			...(await awsRealTimeHeaderBasedAuth({
				apiKey,
				appSyncGraphqlEndpoint,
				authenticationType,
				payload: serializedData,
				canonicalUri: '',
				region,
				additionalCustomHeaders,
			})),
			...libraryConfigHeaders,
			...additionalCustomHeaders,
			[USER_AGENT_HEADER]: getAmplifyUserAgent(customUserAgentDetails),
		};

		const subscriptionMessage = {
			id: subscriptionId,
			payload: {
				data: serializedData,
				extensions: {
					authorization: {
						...headers,
					},
				},
			},
			type: MESSAGE_TYPES.GQL_START,
		};

		const serializedSubscriptionMessage = JSON.stringify(subscriptionMessage);

		return serializedSubscriptionMessage;
	}

	protected _handleSubscriptionData(
		message: MessageEvent,
	): [boolean, DataPayload] {
		this.logger.debug(
			`subscription message from AWS AppSync RealTime: ${message.data}`,
		);

		const { id = '', payload, type } = JSON.parse(String(message.data));

		const {
			observer = null,
			query = '',
			variables = {},
		} = this.subscriptionObserverMap.get(id) || {};

		this.logger.debug({ id, observer, query, variables });

		if (type === MESSAGE_TYPES.DATA && payload && payload.data) {
			if (observer) {
				observer.next(payload);
			} else {
				this.logger.debug(`observer not found for id: ${id}`);
			}

			return [true, { id, type, payload }];
		}

		return [false, { id, type, payload }];
	}

	protected _unsubscribeMessage(subscriptionId: string): {
		id: string;
		type: string;
	} {
		return {
			id: subscriptionId,
			type: MESSAGE_TYPES.GQL_STOP,
		};
	}

	protected _extractConnectionTimeout(data: Record<string, any>): number {
		const {
			payload: { connectionTimeoutMs = DEFAULT_KEEP_ALIVE_TIMEOUT } = {},
		} = data;

		return connectionTimeoutMs;
	}

	protected _extractErrorCodeAndType(data: any): {
		errorCode: number;
		errorType: string;
	} {
		const {
			payload: { errors: [{ errorType = '', errorCode = 0 } = {}] = [] } = {},
		} = data;

		return { errorCode, errorType };
	}
}
