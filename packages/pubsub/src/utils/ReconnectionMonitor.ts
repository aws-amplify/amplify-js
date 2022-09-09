import { Observer } from 'zen-observable-ts';
import { RECONNECT_DELAY, RECONNECT_INTERVAL } from '../Providers/constants';

export enum ReconnectEvent {
	RECONNECT = 'RECONNECT',
	HALT_RECONNECT = 'HALT_RECONNECT',
}

export class ReconnectionMonitor {
	private reconnectObservers: Observer<void>[] = [];
	private reconnectIntervalId?: ReturnType<typeof setInterval>;

	addObserver(reconnectObserver: Observer<void>) {
		this.reconnectObservers.push(reconnectObserver);
	}

	record(event: ReconnectEvent) {
		if (event === ReconnectEvent.RECONNECT) {
			const triggerReconnect = () => {
				this.reconnectObservers.forEach(reconnectObserver => {
					reconnectObserver.next?.();
				});
			};
			// If the reconnect interval isn't set
			if (this.reconnectIntervalId === undefined) {
				setTimeout(() => {
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
		}
	}

	close() {
		this.reconnectObservers.forEach(reconnectObserver => {
			reconnectObserver.complete?.();
		});
	}
}
