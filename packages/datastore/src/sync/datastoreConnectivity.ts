import Observable, { ZenObservable } from 'zen-observable-ts';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { ReachabilityMonitor } from './datastoreReachability';

const logger = new Logger('DataStore');

const RECONNECTING_IN = 5000; // 5s this may be configurable in the future

type ConnectionStatus = {
	// Might add other params in the future
	online: boolean;
};

/**
 * TODO: ... summarize why we have this intermediate class for reachability.
 *
 * @method status()
 * @method unsubscribe() -
 * @method socketDisconnected() - Feign a disconnect?
 */
export default class DataStoreConnectivity {
	private connectionStatus: ConnectionStatus;
	private observer: ZenObservable.SubscriptionObserver<ConnectionStatus>;
	private subscription: ZenObservable.Subscription;
	private timeout: ReturnType<typeof setTimeout>;
	constructor() {
		this.connectionStatus = {
			online: false,
		};
	}

	/**
	 * Subscribe to an observable stream of connection status updates.
	 *
	 * SIDE EFFECT:
	 * 1. Creates a subscription to `ReachabilityMonitor`.
	 */
	status(): Observable<ConnectionStatus> {
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

			return () => {
				// Am I reading this correctly? Is this a redundant clear?
				clearTimeout(this.timeout);
				this.unsubscribe();
			};
		});
	}

	/**
	 * Stop listening for messages and clear any timeouts lingering from a
	 * `socketDisconnected()` call.
	 *
	 * SIDE EFFECT / CLEAN UP:
	 * 1. Timeout stored on `this` is cleared.
	 * 1. Unsubscribes to `ReachabilityMonitor`.
	 */
	unsubscribe() {
		if (this.subscription) {
			clearTimeout(this.timeout);
			this.subscription.unsubscribe();
		}
	}

	/**
	 * Signal that a disconnect has occurred, even if we still have
	 * connectivity. After a timeout period, the "real" network state is taken
	 * from `ReachabilityMonitor`'s last update and sent to the subscriber.
	 *
	 * SIDE EFFECT:
	 * 1. Creates a timeout, stored on `this`.
	 * 1. Immediately sends an `online: false` event to the subscriber.
	 *
	 * @see ReachabilityMonitor
	 */
	socketDisconnected() {
		if (this.observer && typeof this.observer.next === 'function') {
			this.observer.next({ online: false }); // Notify network issue from the socket

			this.timeout = setTimeout(() => {
				const observerResult = { ...this.connectionStatus }; // copyOf status
				this.observer.next(observerResult);
			}, RECONNECTING_IN); // giving time for socket cleanup and network status stabilization
		}
	}
}
