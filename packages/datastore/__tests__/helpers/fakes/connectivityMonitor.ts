import { Observable, Subscriber } from 'rxjs';

type ConnectionStatus = {
	online: boolean;
};

/**
 * Used to simulate connectivity changes, which are handled by the sync
 * processors. This does not disconnect any other mocked services.
 */
export class FakeDataStoreConnectivity {
	private connectionStatus: ConnectionStatus;
	private observer?: Subscriber<ConnectionStatus>;

	constructor() {
		this.connectionStatus = {
			online: true,
		};
	}

	status(): Observable<ConnectionStatus> {
		if (this.observer) {
			throw new Error('Subscriber already exists');
		}
		return new Observable(observer => {
			// the real connectivity monitor subscribes to reachability events here and
			// basically just forwards them through.
			this.observer = observer;
			this.observer?.next(this.connectionStatus);
			return () => {
				this.unsubscribe();
			};
		});
	}

	/**
	 * Signal to datastore (especially sync processors) that we're ONLINE.
	 *
	 * The real connectivity monitor sends this signal when the platform reachability
	 * monitor says we have GAINED basic connectivity.
	 */
	simulateConnect() {
		this.connectionStatus = { online: true };
		this.observer?.next(this.connectionStatus);
	}

	/**
	 * Signal to datastore (especially sync processors) that we're OFFLINE.
	 *
	 * The real connectivity monitor sends this signal when the platform reachability
	 * monitor says we have LOST basic connectivity.
	 */
	simulateDisconnect() {
		this.connectionStatus = { online: false };
		this.observer?.next(this.connectionStatus);
	}

	unsubscribe() {
		this.observer = undefined;
	}
	async stop() {
		this.unsubscribe();
	}

	socketDisconnected() {
		if (this.observer && typeof this.observer.next === 'function') {
			this.observer.next({ online: false }); // Notify network issue from the socket
		}
	}
}
