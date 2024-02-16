// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

import { EventBufferConfig, IAnalyticsClient } from './';

const logger = new ConsoleLogger('EventBuffer');

export class EventBuffer<T> {
	private list: T[];
	private readonly config: EventBufferConfig;
	private getAnalyticsClient: () => IAnalyticsClient<T>;

	private timer?: ReturnType<typeof setInterval>;

	constructor(
		config: EventBufferConfig,
		getAnalyticsClient: () => IAnalyticsClient<T>,
	) {
		this.list = [];
		this.config = config;
		this.getAnalyticsClient = getAnalyticsClient;
		this.startEventLoop();
	}

	public append(...events: T[]) {
		for (const event of events) {
			if (this.list.length + 1 > this.config.bufferSize) {
				logger.debug(
					`Exceed ${typeof event} event buffer limits, event dropped`,
				);
				continue;
			}
			this.list.push(event);
		}
	}

	public flushAll(): Promise<void> {
		return this.submitEvents(this.list.length);
	}

	public release() {
		this.list = [];
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	public get length() {
		return this.list.length;
	}

	private head(count: number) {
		return this.list.splice(0, count);
	}

	private insertAtBeginning(...data: T[]) {
		this.list.unshift(...data);
	}

	private startEventLoop() {
		if (this.timer) {
			clearInterval(this.timer);
		}

		const { flushSize, flushInterval } = this.config;
		setInterval(() => {
			this.submitEvents(flushSize);
		}, flushInterval);
	}

	private submitEvents(count: number): Promise<void> {
		const events = this.head(count);
		if (events.length === 0) {
			return Promise.resolve();
		}

		return this.getAnalyticsClient()(events).then(result => {
			if (result.length > 0) {
				this.insertAtBeginning(...result);
			}
		});
	}
}
