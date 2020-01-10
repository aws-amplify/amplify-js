import * as Observable from 'zen-observable';

type NetworkStatus = {
	online: boolean;
};

export default class ReachabilityNavigator implements Reachability {
	networkMonitor(): Observable<NetworkStatus> {
		return new Observable(observer => {
			observer.next({ online: window.navigator.onLine });

			const notifyOnline = () => observer.next({ online: true });
			const notifyOffline = () => observer.next({ online: false });

			window.addEventListener('online', notifyOnline);
			window.addEventListener('offline', notifyOffline);

			return () => {
				window.removeEventListener('online', notifyOnline);
				window.removeEventListener('offline', notifyOffline);
			};
		});
	}
}

interface Reachability {
	networkMonitor(): Observable<NetworkStatus>;
}
