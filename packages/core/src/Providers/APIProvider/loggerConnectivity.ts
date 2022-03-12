import Observable, { ZenObservable } from 'zen-observable-ts';
import { ReachabilityMonitor } from './LoggerReachability';

type ConnectionStatus = {
	online: boolean;
};

// TODO: refactor this to a singleton that supports numerous observers
export default class LoggerConnectivity {
	private connectionStatus: ConnectionStatus;
	private observer: ZenObservable.SubscriptionObserver<ConnectionStatus>;
	private subscription: ZenObservable.Subscription;
	private timeout: ReturnType<typeof setTimeout>;
	constructor() {
		this.connectionStatus = {
			online: false,
		};
	}

	status(): Observable<ConnectionStatus> {
		if (this.observer) {
			throw new Error('Subscriber already exists');
		}
		return new Observable(observer => {
			this.observer = observer;

			this.subscription = ReachabilityMonitor.subscribe(({ online }) => {
				this.connectionStatus.online = online;

				const observerResult = { ...this.connectionStatus };

				observer.next(observerResult);
			});

			return () => {
				clearTimeout(this.timeout);
				this.unsubscribe();
			};
		});
	}

	unsubscribe() {
		if (this.subscription) {
			clearTimeout(this.timeout);
			this.subscription.unsubscribe();
			this.observer = undefined;
		}
	}
}
