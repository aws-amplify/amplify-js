// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	syncMessages = (): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					const messages = await pluggable.getInAppMessages();
					const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
					await this.setMessages(key, messages);
				} catch (err) {
					logger.error('Failed to sync messages', err);
					throw err;
				}
			})
		);

	clearMessages = (): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				await this.removeMessages(key);
			})
		);

	dispatchEvent = async (event: InAppMessagingEvent): Promise<void> => {
		const messages: InAppMessage[][] = await Promise.all<InAppMessage[]>(
			this.pluggables.map(async pluggable => {
				const key = `${pluggable.getProviderName()}${STORAGE_KEY_SUFFIX}`;
				const messages = await this.getMessages(key);
				return pluggable.processInAppMessages(messages, event);
			})
		);

		const flattenedMessages = flatten(messages);

		if (flattenedMessages.length) {
			notifyMessageInteractionEventListeners(
				this.conflictHandler(flattenedMessages),
				InAppMessageInteractionEvent.MESSAGE_RECEIVED
			);
		}
	};

	identifyUser = (userId: string, userInfo: UserInfo): Promise<void[]> =>
		Promise.all<void>(
			this.pluggables.map(async pluggable => {
				try {
					await pluggable.identifyUser(userId, userInfo);
				} catch (err) {
					logger.error('Failed to identify user', err);
					throw err;
				}
			})
		);

	onMessageReceived = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);

	onMessageDisplayed = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_DISPLAYED
		);

	onMessageDismissed = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_DISMISSED
		);

	onMessageActionTaken = (
		handler: OnMessageInteractionEventHandler
	): OnMessageInteractionEventListener =>
		addMessageInteractionEventListener(
			handler,
			InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN
		);

	notifyMessageInteraction = (
		message: InAppMessage,
		event: InAppMessageInteractionEvent
	): void => {
		notifyMessageInteractionEventListeners(message, event);
	};

	setConflictHandler = (handler: InAppMessageConflictHandler): void => {
		this.conflictHandler = handler;
	};

	private analyticsListener: HubCallback = ({ payload }: HubCapsule) => {
		const { event, data } = payload;
		switch (event) {
			case 'record': {
				this.dispatchEvent(data);
				break;
			}
			default:
				break;
		}
	};

	private syncStorage = async (): Promise<void> => {
		const { storage } = this.config;
		try {
			// Only run sync() if it's available (i.e. React Native)
			if (typeof storage.sync === 'function') {
				await storage.sync();
			}
			this.storageSynced = true;
		} catch (err) {
			logger.error('Failed to sync storage', err);
		}
	};

	private getMessages = async (key: string): Promise<any> => {
		try {
			if (!this.storageSynced) {
				await this.syncStorage();
			}
			const { storage } = this.config;
			const storedMessages = storage.getItem(key);
			return storedMessages ? JSON.parse(storedMessages) : [];
		} catch (err) {
			logger.error('Failed to retrieve in-app messages from storage', err);
		}
	};

	private setMessages = async (
		key: string,
		messages: InAppMessage[]
	): Promise<void> => {
		if (!messages) {
			return;
		}

		try {
			if (!this.storageSynced) {
				await this.syncStorage();
			}
			const { storage } = this.config;
			storage.setItem(key, JSON.stringify(messages));
		} catch (err) {
			logger.error('Failed to store in-app messages', err);
		}
	};

	private removeMessages = async (key: string): Promise<void> => {
		try {
			if (!this.storageSynced) {
				await this.syncStorage();
			}
			const { storage } = this.config;
			storage.removeItem(key);
		} catch (err) {
			logger.error('Failed to remove in-app messages from storage', err);
		}
	};

	private defaultConflictHandler = (messages: InAppMessage[]): InAppMessage => {
		// default behavior is to return the message closest to expiry
		// this function assumes that messages processed by providers already filters out expired messages
		const sorted = messages.sort((a, b) => {
			const endDateA = a.metadata?.endDate;
			const endDateB = b.metadata?.endDate;
			// if both message end dates are falsy or have the same date string, treat them as equal
			if (endDateA === endDateB) {
				return 0;
			}
			// if only message A has an end date, treat it as closer to expiry
			if (endDateA && !endDateB) {
				return -1;
			}
			// if only message B has an end date, treat it as closer to expiry
			if (!endDateA && endDateB) {
				return 1;
			}
			// otherwise, compare them
			return new Date(endDateA) < new Date(endDateB) ? -1 : 1;
		});
		// always return the top sorted
		return sorted[0];
	};
}
