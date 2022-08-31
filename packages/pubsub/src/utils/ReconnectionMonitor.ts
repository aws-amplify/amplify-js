import { Observer } from 'zen-observable-ts';
import { RECONNECT_DELAY } from '../Providers/constants';

export enum ReconnectEvent {
	RECONNECT = 'RECONNECT',
}

export class ReconnectionMonitor {
	private reconnectObservers: Observer<void>[] = [];

	addObserver(reconnectObserver: Observer<void>) {
		this.reconnectObservers.push(reconnectObserver);
	}

	record(event: ReconnectEvent) {
		if (event === ReconnectEvent.RECONNECT) {
			setTimeout(() => {
				this.reconnectObservers.forEach(reconnectObserver => {
					reconnectObserver.next?.();
				});
			}, RECONNECT_DELAY);
		}
	}

	close() {
		this.reconnectObservers.forEach(reconnectObserver => {
			reconnectObserver.complete?.();
		});
	}
}
