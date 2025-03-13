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
import { serializeEvents } from '../../internals/events/utils';

// resolved/actual AuthMode values. identityPool gets resolves to IAM upstream in InternalGraphQLAPI._graphqlSubscribe
type ResolvedGraphQLAuthModes = Exclude<GraphQLAuthMode, 'identityPool'>;

interface AWSAppSyncEventProviderOptions {
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

interface DataPayload {
	id: string;
	event: string;
	type: string;
}

interface DataResponse {
	id: string;
	payload: string;
	type: string;
}

const PROVIDER_NAME = 'AWSAppSyncEventsProvider';
const WS_PROTOCOL_NAME = 'aws-appsync-event-ws';
const CONNECT_URI = ''; // events does not expect a connect uri

export class AWSAppSyncEventProvider extends AWSWebSocketProvider {
	constructor() {
		super({
			providerName: PROVIDER_NAME,
			wsProtocolName: WS_PROTOCOL_NAME,
			connectUri: CONNECT_URI,
		});
		this.allowNoSubscriptions = true;
	}

	getProviderName() {
		return PROVIDER_NAME;
	}

	public async connect(options: AWSAppSyncEventProviderOptions) {
		super.connect(options);
	}

	public subscribe(
		options?: AWSAppSyncEventProviderOptions,
		customUserAgentDetails?: CustomUserAgentDetails,
	) {
		return super.subscribe(options, customUserAgentDetails).pipe();
	}

	public async publish(
		options: AWSAppSyncEventProviderOptions,
		customUserAgentDetails?: CustomUserAgentDetails,
	) {
		return super.publish(options, customUserAgentDetails);
	}

	public closeIfNoActiveSubscription() {
		this._closeSocketIfRequired();
	}

	protected async _prepareSubscriptionPayload({
		options,
		subscriptionId,
		customUserAgentDetails,
		additionalCustomHeaders,
		libraryConfigHeaders,
		publish,
	}: {
		options: AWSAppSyncEventProviderOptions;
		subscriptionId: string;
		customUserAgentDetails: CustomUserAgentDetails | undefined;
		additionalCustomHeaders: Record<string, string>;
		libraryConfigHeaders: Record<string, string>;
		publish?: boolean;
	}): Promise<string> {
		const {
			appSyncGraphqlEndpoint,
			authenticationType,
			query,
			apiKey,
			region,
			variables,
		} = options;

		const data = {
			channel: query,
			events: variables !== undefined ? serializeEvents(variables) : undefined,
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
			channel: query,
			events: variables !== undefined ? serializeEvents(variables) : undefined,
			authorization: {
				...headers,
			},
			payload: {
				events:
					variables !== undefined ? serializeEvents(variables) : undefined,
				channel: query,
				extensions: {
					authorization: {
						...headers,
					},
				},
			},
			type: publish
				? MESSAGE_TYPES.EVENT_PUBLISH
				: MESSAGE_TYPES.EVENT_SUBSCRIBE,
		};

		const serializedSubscriptionMessage = JSON.stringify(subscriptionMessage);

		return serializedSubscriptionMessage;
	}

	protected _handleSubscriptionData(
		message: MessageEvent,
	): [boolean, DataResponse] {
		this.logger.debug(
			`subscription message from AWS AppSync Events: ${message.data}`,
		);

		const {
			id = '',
			event: payload,
			type,
		}: DataPayload = JSON.parse(String(message.data));

		const {
			observer = null,
			query = '',
			variables = {},
		} = this.subscriptionObserverMap.get(id) || {};

		this.logger.debug({ id, observer, query, variables });

		if (type === MESSAGE_TYPES.DATA && payload) {
			const deserializedEvent = JSON.parse(payload);
			if (observer) {
				observer.next({ id, type, event: deserializedEvent });
			} else {
				this.logger.debug(`observer not found for id: ${id}`);
			}

			return [true, { id, type, payload: deserializedEvent }];
		}

		return [false, { id, type, payload }];
	}

	protected _unsubscribeMessage(subscriptionId: string): {
		id: string;
		type: string;
	} {
		return {
			id: subscriptionId,
			type: MESSAGE_TYPES.EVENT_STOP,
		};
	}

	protected _extractConnectionTimeout(data: Record<string, any>): number {
		const { connectionTimeoutMs = DEFAULT_KEEP_ALIVE_TIMEOUT } = data;

		return connectionTimeoutMs;
	}

	protected _extractErrorCodeAndType(data: Record<string, any>): {
		errorCode: number;
		errorType: string;
	} {
		const { errors: [{ errorType = '', errorCode = 0 } = {}] = [] } = data;

		return { errorCode, errorType };
	}
}

export const AppSyncEventProvider = new AWSAppSyncEventProvider();
