import Observable from 'zen-observable-ts';
import { ConsoleLogger as Logger } from '../Logger';

const logger = new Logger('Reachability', 'DEBUG');

type NetworkStatus = {
	online: boolean;
};

export default class ReachabilityNavigator implements Reachability {
	networkMonitor(netInfo?: any): Observable<NetworkStatus> {
		/**
		 * Here netinfo refers to @react-native-community/netinfo
		 * This is needed in React Native to enable network detection
		 * We do not import it in Core so that Apps that do not use DataStore
		 * Do not need to install and link this dependency
		 * When using Reachability in React Native, pass NetInfo as a param to networkMonitor
		 */
		if (!(netInfo && netInfo.addEventListener)) {
			throw new Error(
				'NetInfo must be passed to networkMonitor to enable reachability in React Native'
			);
		}
		return new Observable(observer => {
			logger.log('subscribing to reachability in React Native');

			let online;

			const unsubscribe = netInfo.addEventListener(
				({ isInternetReachable }) => {
					if (typeof isInternetReachable === 'boolean') {
						online = isInternetReachable;
						logger.log('Notifying reachability change', online);
						observer.next({ online });
					}
				}
			);

			return () => {
				unsubscribe();
			};
		});
	}
}

interface Reachability {
	networkMonitor(netInfo?: any): Observable<NetworkStatus>;
}
