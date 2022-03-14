import API, { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import Observable, { ZenObservable } from 'zen-observable-ts';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { ReachabilityMonitor } from './datastoreReachability';
import { PollOfflineType } from '../types';

const logger = new Logger('DataStore');

const RECONNECTING_IN = 5000; // 5s this may be configurable in the future

type ConnectionStatus = {
	// Might add other params in the future
	online: boolean;
};

export default class DataStoreConnectivity {
	private connectionStatus: ConnectionStatus;
	private observer: ZenObservable.SubscriptionObserver<ConnectionStatus>;
	private subscription: ZenObservable.Subscription;
	private timeout: ReturnType<typeof setTimeout>;
	private interval: ReturnType<typeof setInterval>;
	constructor() {
		this.connectionStatus = {
			online: false,
		};
	}

	status(pollOffline: PollOfflineType): Observable<ConnectionStatus> {
		if (this.observer) {
			throw new Error('Subscriber already exists');
		}
		return new Observable(observer => {
			this.observer = observer;
			// Will be used to forward socket connection changes, enhancing Reachability

			this.subscription = ReachabilityMonitor.subscribe(({ online }) => {
				this.connectionStatus.online = online;

				const observerResult = { ...this.connectionStatus }; // copyOf status

				observer.next(observerResult);
			});
			if (pollOffline && pollOffline.enabled) {
				this.interval = setInterval(async () => {
					try {
						await API.graphql({
							query: `query MyQuery {
							__typename
						  }`,
							authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
						});

						if (this.connectionStatus.online === false) {
							// do not trigger subscriptions
							this.observer.next({ online: true });
							this.connectionStatus.online = true;
						}
					} catch (err) {
						if (this.connectionStatus.online === true) {
							// do not trigger subscriptions
							this.observer.next({ online: false });
							this.connectionStatus.online = false;
						}
					}
				}, pollOffline.interval || RECONNECTING_IN);
			}

			return () => {
				clearInterval(this.interval);
				clearTimeout(this.timeout);
				this.unsubscribe();
			};
		});
	}

	unsubscribe() {
		if (this.subscription) {
			clearTimeout(this.timeout);
			this.subscription.unsubscribe();
		}
	}

	socketDisconnected() {
		if (this.observer && typeof this.observer.next === 'function') {
			this.connectionStatus.online = false;
			this.observer.next({ online: false }); // Notify network issue from the socket

			this.timeout = setTimeout(() => {
				const observerResult = { ...this.connectionStatus }; // copyOf status
				this.observer.next(observerResult);
			}, RECONNECTING_IN); // giving time for socket cleanup and network status stabilization
		}
	}

	async networkDisconnected() {
		if (this.observer && typeof this.observer.next === 'function') {
			this.connectionStatus.online = false;
			this.observer.next({ online: false }); // Notify network issue from the socket
		}
	}
}
