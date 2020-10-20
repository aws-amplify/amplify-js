import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import Observable, { ZenObservable } from 'zen-observable-ts';

type NetworkStatus = {
	online: boolean;
};

export default class ReachabilityNavigator implements Reachability {
	private static _observers: Array<
		ZenObservable.SubscriptionObserver<NetworkStatus>
	> = [];

	networkMonitor(netInfo?: any): Observable<NetworkStatus> {
		if (browserOrNode().isNode) {
			return Observable.from([{ online: true }]);
		}

		return new Observable(observer => {
			const online = isWebWorker()
				? self.navigator.onLine
				: window.navigator.onLine;

			observer.next({ online });

			const notifyOnline = () => observer.next({ online: true });
			const notifyOffline = () => observer.next({ online: false });

			window.addEventListener('online', notifyOnline);
			window.addEventListener('offline', notifyOffline);

			ReachabilityNavigator._observers.push(observer);

			return () => {
				window.removeEventListener('online', notifyOnline);
				window.removeEventListener('offline', notifyOffline);

				ReachabilityNavigator._observers = ReachabilityNavigator._observers.filter(
					_observer => _observer !== observer
				);
			};
		});
	}

	// expose observers to simulate offline mode for integration testing
	private static _observerOverride(status: NetworkStatus): void {
		for (const observer of ReachabilityNavigator._observers) {
			if (observer.closed) {
				ReachabilityNavigator._observers = ReachabilityNavigator._observers.filter(
					_observer => _observer !== observer
				);
				continue;
			}
			observer.next(status);
		}
	}
}

interface Reachability {
	networkMonitor(netInfo?: any): Observable<NetworkStatus>;
}
