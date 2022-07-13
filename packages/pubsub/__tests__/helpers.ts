import { Hub } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { ConnectionState, CONNECTION_STATE_CHANGE } from '../src';
import * as constants from '../src/Providers/AWSAppSyncRealTimeProvider/constants';

export function delay(timeout) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(undefined);
		}, timeout);
	});
}

export class FakeWebSocketInterface {
	readonly webSocket: FakeWebSocket;
	readyForUse: Promise<void>;
	hasClosed: Promise<undefined>;
	teardownHubListener: () => void;
	observedConnectionStates: ConnectionState[] = [];
	currentConnectionState: ConnectionState;

	private readyResolve: (value: PromiseLike<any>) => void;
	private connectionStateObservers: ZenObservable.Observer<ConnectionState>[] =
		[];

	constructor() {
		this.readyForUse = new Promise((res, rej) => {
			this.readyResolve = res;
		});
		let closeResolver: (value: PromiseLike<any>) => void;
		this.hasClosed = new Promise((res, rej) => {
			closeResolver = res;
		});
		this.webSocket = new FakeWebSocket(() => closeResolver);

		this.teardownHubListener = Hub.listen('api', (data: any) => {
			const { payload } = data;
			if (payload.event === CONNECTION_STATE_CHANGE) {
				const connectionState = payload.data.connectionState as ConnectionState;
				this.observedConnectionStates.push(connectionState);
				this.connectionStateObservers.forEach(observer => {
					observer?.next?.(connectionState);
				});
				this.currentConnectionState = connectionState;
			}
		});
	}

	allConnectionStateObserver() {
		return new Observable(observer => {
			this.observedConnectionStates.forEach(state => {
				observer.next(state);
			});
			this.connectionStateObservers.push(observer);
		});
	}

	connectionStateObserver() {
		return new Observable(observer => {
			this.connectionStateObservers.push(observer);
		});
	}

	teardown() {
		this.teardownHubListener();
		this.connectionStateObservers.forEach(observer => {
			observer?.complete?.();
		});
	}

	async standardConnectionHandshake() {
		await this.readyForUse;
		await this.triggerOpen();
		await this.handShakeMessage();
	}

	async triggerOpen() {
		// After an open is triggered, the provider has logic that must execute
		//   which changes the function resolvers assigned to the websocket
		await this.runAndResolve(() => {
			this.webSocket.onopen(new Event('', {}));
		});
	}

	async triggerClose() {
		// After a close is triggered, the provider has logic that must execute
		//   which changes the function resolvers assigned to the websocket
		await this.runAndResolve(() => {
			if (this.webSocket.onclose) {
				try {
					this.webSocket.onclose(new CloseEvent('', {}));
				} catch {}
			}
		});
	}

	async closeInterface() {
		await this.triggerClose();
		// Wait for either hasClosed or a half second has passed
		await new Promise(async res => {
			// The interface is closed when the socket "hasClosed"
			this.hasClosed.then(() => res(undefined));
			await this.waitUntilConnectionStateIn([
				'Disconnected',
				'ConnectionDisrupted',
			]);
			res(undefined);
		});
	}

	async triggerError() {
		// After an error is triggered, the provider has logic that must execute
		//   which changes the function resolvers assigned to the websocket
		await this.runAndResolve(() => {
			this.webSocket.onerror(new Event('TestError', {}));
		});
	}

	newWebSocket() {
		setTimeout(() => this.readyResolve(Promise.resolve()), 10);
		return this.webSocket;
	}

	async handShakeMessage() {
		await this.sendMessage(
			new MessageEvent('connection_ack', {
				data: JSON.stringify({
					type: constants.MESSAGE_TYPES.GQL_CONNECTION_ACK,
					payload: { connectionTimeoutMs: 100_000 },
				}),
			})
		);
	}

	async sendDataMessage(data: {}) {
		await this.sendMessage(
			new MessageEvent('data', {
				data: JSON.stringify({
					...data,
					id: this.webSocket.subscriptionId,
				}),
			})
		);
	}

	async sendMessage(message: MessageEvent) {
		// After a message is sent, it takes a few ms for it to enact provider behavior
		await this.runAndResolve(() => {
			this.webSocket.onmessage(message);
		});
	}

	async runAndResolve(fn) {
		fn();
		await Promise.resolve();
	}

	async observesConnectionState(connectionState: ConnectionState) {
		return new Promise<void>((res, rej) => {
			this.allConnectionStateObserver().subscribe(value => {
				if (value === connectionState) {
					res(undefined);
				}
			});
		});
	}

	async waitForConnectionState(connectionStates: ConnectionState[]) {
		return new Promise<void>((res, rej) => {
			this.connectionStateObserver().subscribe(value => {
				if (connectionStates.includes(String(value) as ConnectionState)) {
					res(undefined);
				}
			});
		});
	}

	async waitUntilConnectionStateIn(connectionStates: ConnectionState[]) {
		return new Promise<void>((res, rej) => {
			if (connectionStates.includes(this.currentConnectionState)) {
				res(undefined);
			}
			res(this.waitForConnectionState(connectionStates));
		});
	}
}

class FakeWebSocket implements WebSocket {
	subscriptionId: string | undefined;
	closeResolverFcn: () => (value: PromiseLike<any>) => void;

	binaryType: BinaryType;
	bufferedAmount: number;
	extensions: string;
	onclose: (this: WebSocket, ev: CloseEvent) => any;
	onerror: (this: WebSocket, ev: Event) => any;
	onmessage: (this: WebSocket, ev: MessageEvent<any>) => any;
	onopen: (this: WebSocket, ev: Event) => any;
	protocol: string;
	readyState: number;
	url: string;
	close(code?: number, reason?: string): void {
		const closeResolver = this.closeResolverFcn();
		if (closeResolver) closeResolver(Promise.resolve(undefined));
	}
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
		const parsedInput = JSON.parse(String(data));

		this.subscriptionId = parsedInput.id;
	}
	CLOSED: number;
	CLOSING: number;
	CONNECTING: number;
	OPEN: number;
	addEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(type: unknown, listener: unknown, options?: unknown): void {
		throw new Error('Method not implemented addEventListener.');
	}
	removeEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: unknown,
		listener: unknown,
		options?: unknown
	): void {
		throw new Error('Method not implemented removeEventListener.');
	}
	dispatchEvent(event: Event): boolean {
		throw new Error('Method not implemented dispatchEvent.');
	}

	constructor(closeResolver: () => (value: PromiseLike<any>) => void) {
		this.closeResolverFcn = closeResolver;
	}
}

export async function replaceConstant(
	name: string,
	replacementValue: any,
	testFn: () => Promise<void>
) {
	const initialValue = constants[name];
	Object.defineProperty(constants, name, {
		value: replacementValue,
	});
	try {
		await testFn();
	} finally {
		Object.defineProperty(constants, name, {
			value: initialValue,
		});
	}
}
