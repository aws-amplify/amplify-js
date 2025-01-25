// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

export const MAX_DELAY_MS = 5000;

export const NON_RETRYABLE_CODES = [400, 401, 403];
export const NON_RETRYABLE_ERROR_TYPES = [
	'BadRequestException',
	'UnauthorizedException',
];

export const CONNECTION_STATE_CHANGE = 'ConnectionStateChange';

export enum MESSAGE_TYPES {
	/**
	 * Client -> Server message.
	 * This message type is the first message after handshake and this will initialize AWS AppSync RealTime communication
	 */
	GQL_CONNECTION_INIT = 'connection_init',
	/**
	 * Server -> Client message
	 * This message type is in case there is an issue with AWS AppSync RealTime when establishing connection
	 */
	GQL_CONNECTION_ERROR = 'connection_error',
	/**
	 * Server -> Client message.
	 * This message type is for the ack response from AWS AppSync RealTime for GQL_CONNECTION_INIT message
	 */
	GQL_CONNECTION_ACK = 'connection_ack',
	/**
	 * Client -> Server message.
	 * This message type is for register subscriptions with AWS AppSync RealTime
	 */
	GQL_START = 'start',
	/**
	 * Server -> Client message.
	 * This message type is for the ack response from AWS AppSync RealTime for GQL_START message
	 */
	GQL_START_ACK = 'start_ack',
	/**
	 * Server -> Client message.
	 * This message type is for subscription message from AWS AppSync RealTime or Events
	 */
	DATA = 'data',
	/**
	 * Server -> Client message.
	 * This message type helps the client to know is still receiving messages from AWS AppSync RealTime
	 */
	GQL_CONNECTION_KEEP_ALIVE = 'ka',
	/**
	 * Client -> Server message.
	 * This message type is for unregister subscriptions with AWS AppSync RealTime
	 */
	GQL_STOP = 'stop',
	/**
	 * Server -> Client message.
	 * This message type is for the ack response from AWS AppSync RealTime for GQL_STOP message
	 */
	GQL_COMPLETE = 'complete',
	/**
	 * Server -> Client message.
	 * This message type is for sending error messages from AWS AppSync RealTime to the client
	 */
	GQL_ERROR = 'error', // Server -> Client
	/**
	 * Client -> Server message.
	 * This message type is for registering subscriptions with Events
	 */
	EVENT_SUBSCRIBE = 'subscribe',
	/**
	 * Client -> Server message.
	 * This message type is for publishing a message with Events
	 */
	EVENT_PUBLISH = 'publish',
	/**
	 * Server -> Client message.
	 * Server acknowledges successful subscription
	 */
	EVENT_SUBSCRIBE_ACK = 'subscribe_success',
	/**
	 * Server -> Client message.
	 * Server acknowledges successful publish
	 */
	EVENT_PUBLISH_ACK = 'publish_success',
	/**
	 * Client -> Server message.
	 * This message type is for unregister subscriptions with AWS AppSync RealTime
	 */
	EVENT_STOP = 'unsubscribe',
	/**
	 * Server -> Client message.
	 * This is the ack response from AWS AppSync Events to EVENT_STOP message
	 */
	EVENT_COMPLETE = 'unsubscribe_success',
}

export enum SUBSCRIPTION_STATUS {
	PENDING,
	CONNECTED,
	FAILED,
}

export enum SOCKET_STATUS {
	CLOSED,
	READY,
	CONNECTING,
}

export const AWS_APPSYNC_REALTIME_HEADERS = {
	accept: 'application/json, text/javascript',
	'content-encoding': 'amz-1.0',
	'content-type': 'application/json; charset=UTF-8',
};

/**
 * Time in milleseconds to wait for GQL_CONNECTION_INIT message
 */
export const CONNECTION_INIT_TIMEOUT = 15000;

/**
 * Time in milleseconds to wait for GQL_START_ACK message
 */
export const START_ACK_TIMEOUT = 15000;

/**
 * Default Time in milleseconds to wait for GQL_CONNECTION_KEEP_ALIVE message
 */
export const DEFAULT_KEEP_ALIVE_TIMEOUT = 5 * 60 * 1000;

/**
 * Default Time in milleseconds between monitoring checks of keep alive status
 */
export const DEFAULT_KEEP_ALIVE_HEARTBEAT_TIMEOUT = 5 * 1000;

/**
 * Default Time in milleseconds to alert for missed GQL_CONNECTION_KEEP_ALIVE message
 */
export const DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT = 65 * 1000;

/**
 * Default delay time in milleseconds between when reconnect is triggered vs when it is attempted
 */
export const RECONNECT_DELAY = 5 * 1000;

/**
 * Default interval time in milleseconds between when reconnect is re-attempted
 */
export const RECONNECT_INTERVAL = 60 * 1000;
