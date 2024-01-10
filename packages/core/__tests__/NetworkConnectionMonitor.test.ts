// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Observable, Observer } from 'rxjs';
import { Reachability } from '../src/Reachability';
import { NetworkConnectionMonitor } from '../src/logger';

describe('NetworkConnectionMonitor', () => {
	let reachabilityObserver: Observer<{ online: boolean }>;
	const eventHandler = jest.fn();

	beforeEach(() => {
		jest
			.spyOn(Reachability.prototype, 'networkMonitor')
			.mockImplementationOnce(() => {
				return new Observable(observer => {
					reachabilityObserver = observer;
				});
			})
			// Twice because we subscribe to get the initial state then again to monitor reachability
			.mockImplementationOnce(() => {
				return new Observable(observer => {
					reachabilityObserver = observer;
				});
			});
	});

	afterEach(() => {
		eventHandler.mockReset();
	});

	it('should execute event handler exactly once if device is already online', () => {
		const netMon = new NetworkConnectionMonitor();
		netMon.enableNetworkMonitoringFor(eventHandler);
		expect(eventHandler).toHaveBeenCalledTimes(1);
	});

	it('should not execute event handler if device is already offline', () => {
		jest
			.spyOn(Reachability.prototype, 'isOnline')
			.mockImplementationOnce(() => {
				return false;
			});
		const netMon = new NetworkConnectionMonitor();
		netMon.enableNetworkMonitoringFor(eventHandler);
		expect(eventHandler).toHaveBeenCalledTimes(0);
	});

	it('should subscribe to network event when device is offline, execute the event handler when device comes online then unsubscribe', () => {
		jest
			.spyOn(Reachability.prototype, 'isOnline')
			.mockImplementationOnce(() => {
				return false;
			});

		const netMon = new NetworkConnectionMonitor();
		netMon.enableNetworkMonitoringFor(eventHandler);

		// Should have been called 0 times at this stage since device is offline
		expect(eventHandler).toHaveBeenCalledTimes(0);

		// Replicating device coming online the first time
		reachabilityObserver?.next?.({ online: true });

		// Should be called exactly one time when the device comes online
		expect(eventHandler).toHaveBeenCalledTimes(1);
		eventHandler.mockReset();

		// Replicating device coming online the second time
		reachabilityObserver?.next?.({ online: true });

		// Should not be called since it should have unsubscribed after executing the event handler once
		expect(eventHandler).toHaveBeenCalledTimes(0);
	});
});
