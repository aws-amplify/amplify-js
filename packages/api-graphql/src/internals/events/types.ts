// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Subscription } from 'rxjs';
import type { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

export interface SubscriptionObserver<T> {
	next(value: T): void;
	error(errorValue: any): void;
}

export interface EventsChannel {
	subscribe(
		observer: SubscriptionObserver<any>,
		subOptions?: EventsOptions,
	): Subscription;
	close(): void;
}

export type ResolvedGraphQLAuthModes = Exclude<GraphQLAuthMode, 'identityPool'>;

export interface EventsOptions {
	authMode?: GraphQLAuthMode;
	authToken?: string;
}

export interface PublishedEvent {
	identifier: string;
	index: number;
}

export interface PublishResponse {
	failed: PublishedEvent[];
	successful: PublishedEvent[];
}
