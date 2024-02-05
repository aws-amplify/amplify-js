// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Observable, Subscription } from 'rxjs';
import { Reachability } from '..';
import { AsyncReturnType, NetworkStatus } from '../types';

export class NetworkConnectionMonitor {
	/**
	 * @private
	 */
	private _networkMonitoringSubscriptions?: Subscription;
	private _networkMonitor: Observable<NetworkStatus>;
	private _reachability: Reachability;

	constructor() {
		this._reachability = new Reachability();
		this._networkMonitor = this._reachability.networkMonitor();
	}

	/**
	 * Turn network state monitoring on if it isn't on already
	 */
	public enableNetworkMonitoringFor(
		eventHandler: (...args: any) => Promise<any>
	): AsyncReturnType<typeof eventHandler> {
		if (this._reachability.isOnline()) {
			return eventHandler();
		} else {
			return new Promise((resolve, _) => {
				const subscription = this._networkMonitor.subscribe(({ online }) => {
					if (online) {
						const eventHandlerResult = eventHandler();
						subscription.unsubscribe();
						resolve(eventHandlerResult);
					}
				});
				if (!this._networkMonitoringSubscriptions) {
					this._networkMonitoringSubscriptions = subscription;
					return;
				}
				this._networkMonitoringSubscriptions.add(subscription);
			});
		}
	}

	/**
	 * Turn network state monitoring off if it isn't off already
	 */
	public disableNetworkMonitoring() {
		this._networkMonitoringSubscriptions?.unsubscribe();
		this._networkMonitoringSubscriptions = undefined;
	}
}
