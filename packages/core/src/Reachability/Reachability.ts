// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Observable, { ZenObservable } from 'zen-observable-ts';
import { isWebWorker } from '../libraryUtils';
import { NetworkStatus } from './types';

export class Reachability {
	private static _observers: Array<
		ZenObservable.SubscriptionObserver<NetworkStatus>
	> = [];

	networkMonitor(_?: unknown): Observable<NetworkStatus> {
		const globalObj = isWebWorker() ? self : window;

		return new Observable(observer => {
			observer.next({ online: globalObj.navigator.onLine });

			const notifyOnline = () => observer.next({ online: true });
			const notifyOffline = () => observer.next({ online: false });

			globalObj.addEventListener('online', notifyOnline);
			globalObj.addEventListener('offline', notifyOffline);

			Reachability._observers.push(observer);

			return () => {
				globalObj.removeEventListener('online', notifyOnline);
				globalObj.removeEventListener('offline', notifyOffline);

				Reachability._observers = Reachability._observers.filter(
					_observer => _observer !== observer
				);
			};
		});
	}
}
