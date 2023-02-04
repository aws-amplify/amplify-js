// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Source, DocumentNode, GraphQLError } from 'graphql';
export { OperationTypeNode } from 'graphql';

export enum GRAPHQL_AUTH_MODE {
	API_KEY = 'API_KEY',
	AWS_IAM = 'AWS_IAM',
	OPENID_CONNECT = 'OPENID_CONNECT',
	AMAZON_COGNITO_USER_POOLS = 'AMAZON_COGNITO_USER_POOLS',
	AWS_LAMBDA = 'AWS_LAMBDA',
}

export interface GraphQLOptions {
	query: string | DocumentNode;
	variables?: object;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	userAgentSuffix?: string;
}

export interface GraphQLResult<T = object> {
	data?: T;
	errors?: GraphQLError[];
	extensions?: {
		[key: string]: any;
	};
}

export enum GraphQLAuthError {
	NO_API_KEY = 'No api-key configured',
	NO_CURRENT_USER = 'No current user',
	NO_CREDENTIALS = 'No credentials',
	NO_FEDERATED_JWT = 'No federated jwt',
	NO_AUTH_TOKEN = 'No auth token specified',
}

/**
 * GraphQLSource or string, the type of the parameter for calling graphql.parse
 * @see: https://graphql.org/graphql-js/language/#parse
 */
export type GraphQLOperation = Source | string;

export enum CONTROL_MSG {
	CONNECTION_CLOSED = 'Connection closed',
	CONNECTION_FAILED = 'Connection failed',
	REALTIME_SUBSCRIPTION_INIT_ERROR = 'AppSync Realtime subscription init error',
	SUBSCRIPTION_ACK = 'Subscription ack',
	TIMEOUT_DISCONNECT = 'Timeout disconnect',
}

/** @enum {string} */
export enum ConnectionState {
	/*
	 * The connection is alive and healthy
	 */
	Connected = 'Connected',
	/*
	 * The connection is alive, but the connection is offline
	 */
	ConnectedPendingNetwork = 'ConnectedPendingNetwork',
	/*
	 * The connection has been disconnected while in use
	 */
	ConnectionDisrupted = 'ConnectionDisrupted',
	/*
	 * The connection has been disconnected and the network is offline
	 */
	ConnectionDisruptedPendingNetwork = 'ConnectionDisruptedPendingNetwork',
	/*
	 * The connection is in the process of connecting
	 */
	Connecting = 'Connecting',
	/*
	 * The connection is not in use and is being disconnected
	 */
	ConnectedPendingDisconnect = 'ConnectedPendingDisconnect',
	/*
	 * The connection is not in use and has been disconnected
	 */
	Disconnected = 'Disconnected',
	/*
	 * The connection is alive, but a keep alive message has been missed
	 */
	ConnectedPendingKeepAlive = 'ConnectedPendingKeepAlive',
}
