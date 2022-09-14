import { Observer } from 'zen-observable-ts';
import { RECONNECT_DELAY, RECONNECT_INTERVAL } from '../Providers/constants';

export enum ReconnectEvent {
	START_RECONNECT = 'START_RECONNECT',
	HALT_RECONNECT = 'HALT_RECONNECT',
}

export class ReconnectionMonitor {
	private reconnectObservers: Observer<void>[] = [];
	private reconnectIntervalId?: ReturnType<typeof setInterval>;
	private reconnectSetTimeoutId?: ReturnType<typeof setTimeout>;

	/**
	 * Add reconnect observer to the list of observers to alert on reconnect
	 */
	addObserver(reconnectObserver: Observer<void>) {
		this.reconnectObservers.push(reconnectObserver);
	}

	/**
	 * Given a reconnect event, start the appropriate behavior
	 */
	record(event: ReconnectEvent) {
		if (event === ReconnectEvent.START_RECONNECT) {
			const triggerReconnect = () => {
				this.reconnectObservers.forEach(reconnectObserver => {
					reconnectObserver.next?.();
				});
			};
			// If the reconnect interval isn't set
			if (this.reconnectIntervalId === undefined) {
				this.reconnectSetTimeoutId = setTimeout(() => {
					// Reconnect now
					triggerReconnect();
					// Retry reconnect every periodically until it works
					this.reconnectIntervalId = setInterval(() => {
						triggerReconnect();
					}, RECONNECT_INTERVAL);
				}, RECONNECT_DELAY);
			}
		}

		if (event === ReconnectEvent.HALT_RECONNECT) {
			if (this.reconnectIntervalId) {
				clearInterval(this.reconnectIntervalId);
				this.reconnectIntervalId = undefined;
			}
			if (this.reconnectSetTimeoutId) {
				clearTimeout(this.reconnectSetTimeoutId);
				this.reconnectSetTimeoutId = undefined;
			}
		}
	}

	/**
	 * Complete all reconnect observers
	 */
	close() {
		this.reconnectObservers.forEach(reconnectObserver => {
			reconnectObserver.complete?.();
		});
	}
}
