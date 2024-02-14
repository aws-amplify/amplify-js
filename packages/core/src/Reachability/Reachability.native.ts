// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable } from 'rxjs';
import { loadNetInfo } from '@aws-amplify/react-native';

import { ConsoleLogger } from '../Logger';

import { NetworkStatus } from './types';

const logger = new ConsoleLogger('Reachability', 'DEBUG');

export class Reachability {
	networkMonitor(
		netInfo?: ReturnType<typeof loadNetInfo>,
	): Observable<NetworkStatus> {
		/**
		 * Here netinfo refers to @react-native-community/netinfo
		 * This is needed in React Native to enable network detection
		 * We do not import it in Core so that Apps that do not use DataStore
		 * Do not need to install and link this dependency
		 * When using Reachability in React Native, pass NetInfo as a param to networkMonitor
		 */
		if (!(netInfo && netInfo.addEventListener)) {
			throw new Error(
				'NetInfo must be passed to networkMonitor to enable reachability in React Native',
			);
		}

		return new Observable(observer => {
			logger.log('subscribing to reachability in React Native');

			const unsubscribe = netInfo.addEventListener(
				({ isInternetReachable }) => {
					// `isInternetReachable` can sometimes be `null` initially, so we want
					// to make sure it is a boolean first before sending it to the observer.
					if (typeof isInternetReachable === 'boolean') {
						const online = isInternetReachable;
						logger.log('Notifying reachability change', online);
						observer.next({ online });
					}
				},
			);

			return () => {
				unsubscribe();
			};
		});
	}
}
