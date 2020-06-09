import Observable, { Observer } from 'zen-observable-ts';

type NetworkStatus = {
	online: boolean;
};

export default class ReachabilityNavigator implements Reachability {
	private static _observers: Array<Observer<NetworkStatus>> = [];
	private _observer: Observer<NetworkStatus> = null;

	networkMonitor(netInfo?: any): Observable<NetworkStatus> {
		return new Observable(observer => {
			observer.next({ online: window.navigator.onLine });

			const notifyOnline = () => observer.next({ online: true });
			const notifyOffline = () => observer.next({ online: false });

			window.addEventListener('online', notifyOnline);
			window.addEventListener('offline', notifyOffline);

			this._observer = observer;
			ReachabilityNavigator._observers.push(observer);

			return () => {
				window.removeEventListener('online', notifyOnline);
				window.removeEventListener('offline', notifyOffline);
				ReachabilityNavigator._observers = ReachabilityNavigator._observers.filter(
					_observer => _observer !== this._observer
				);
			};
		});
	}

	// expose observers to simulate offline mode for integration testing
	private static _observerOverride(status: NetworkStatus): void {
		for (const _observer of ReachabilityNavigator._observers) {
			if (!(_observer.next && typeof _observer.next === 'function')) {
				continue;
			}
			_observer.next(status);
		}
	}
}

interface Reachability {
	networkMonitor(netInfo?: any): Observable<NetworkStatus>;
}
