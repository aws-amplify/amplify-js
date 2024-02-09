// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CompletionObserver, Observable, from } from 'rxjs';
import { NetworkStatus } from './types';
import { isWebWorker } from '../utils';

export class Reachability {
	private static _observers: Array<CompletionObserver<NetworkStatus>> = [];

	networkMonitor(_?: unknown): Observable<NetworkStatus> {
		const globalObj = isWebWorker()
			? self
			: typeof window !== 'undefined' && window;

		if (!globalObj) {
			return from([{ online: true }]);
		}

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

	// expose observers to simulate offline mode for integration testing
	private static _observerOverride(status: NetworkStatus): void {
		for (const observer of this._observers) {
			if (observer.closed) {
				this._observers = this._observers.filter(
					_observer => _observer !== observer
				);
				continue;
			}

			observer?.next && observer.next(status);
		}
	}
}
