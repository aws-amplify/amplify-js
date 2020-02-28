import { default as NetInfo } from '@react-native-community/netinfo';
import * as Observable from 'zen-observable';
import { ConsoleLogger as Logger } from '../Logger';

const logger = new Logger('Reachability', 'DEBUG');

type NetworkStatus = {
	online: boolean;
};

export default class ReachabilityNavigator implements Reachability {
	networkMonitor(): Observable<NetworkStatus> {
		return new Observable(observer => {
			logger.log('subscribing to reachability');

			let online = false;

			NetInfo.fetch().then(({ isInternetReachable }) => {
				online = isInternetReachable;

				logger.log('Notifying initial reachability state', online);

				observer.next({ online });
			});

			const id = setInterval(async () => {
				const { isInternetReachable } = await NetInfo.fetch();

				if (online !== isInternetReachable) {
					online = isInternetReachable;

					logger.log('Notifying reachability change', online);

					observer.next({ online });
				}
			}, 2000);

			return () => {
				logger.log('unsubscribing reachability');

				clearInterval(id);
			};
		});
	}
}

interface Reachability {
	networkMonitor(): Observable<NetworkStatus>;
}
