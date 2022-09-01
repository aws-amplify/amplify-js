import { Hub } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { ConnectionState as CS, CONNECTION_STATE_CHANGE } from '../src';
import * as constants from '../src/Providers/constants';

export function delay(timeout) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(undefined);
		}, timeout);
	});
}

export class HubConnectionListener {
	teardownHubListener: () => void;
	observedConnectionStates: CS[] = [];
	currentConnectionState: CS;

	private connectionStateObservers: ZenObservable.Observer<CS>[] = [];

	constructor(channel: string) {
		let closeResolver: (value: PromiseLike<any>) => void;

		this.teardownHubListener = Hub.listen(channel, (data: any) => {
			const { payload } = data;
			if (payload.event === CONNECTION_STATE_CHANGE) {
				const connectionState = payload.data.connectionState as CS;
				this.observedConnectionStates.push(connectionState);
				this.connectionStateObservers.forEach(observer => {
					observer?.next?.(connectionState);
				});
				this.currentConnectionState = connectionState;
			}
		});
	}

	/**
	 * @returns {Observable<ConnectionState>} - The observable that emits all ConnectionState updates (past and future)
	 */
	allConnectionStateObserver() {
		return new Observable(observer => {
			this.observedConnectionStates.forEach(state => {
				observer.next(state);
			});
			this.connectionStateObservers.push(observer);
		});
	}

	/**
	 * @returns {Observable<ConnectionState>} - The observable that emits ConnectionState updates (past and future)
	 */
	connectionStateObserver() {
		return new Observable(observer => {
			this.connectionStateObservers.push(observer);
		});
	}

	/**
	 * Tear down the Fake Socket state
	 */
	teardown() {
		this.teardownHubListener();
		this.connectionStateObservers.forEach(observer => {
			observer?.complete?.();
		});
	}

	async waitForConnectionState(connectionStates: CS[]) {
		return new Promise<void>((res, rej) => {
			this.connectionStateObserver().subscribe(value => {
				if (connectionStates.includes(String(value) as CS)) {
					res(undefined);
				}
			});
		});
	}

	async waitUntilConnectionStateIn(connectionStates: CS[]) {
		return new Promise<void>((res, rej) => {
			if (connectionStates.includes(this.currentConnectionState)) {
				res(undefined);
			}
			res(this.waitForConnectionState(connectionStates));
		});
	}
}

export class FakeWebSocketInterface {
	readonly webSocket: FakeWebSocket;
	readyForUse: Promise<void>;
	hasClosed: Promise<undefined>;
	hubConnectionListener: HubConnectionListener;

	private readyResolve: (value: PromiseLike<any>) => void;

	constructor() {
		this.hubConnectionListener = new HubConnectionListener('api');
		this.readyForUse = new Promise((res, rej) => {
			this.readyResolve = res;
		});
		let closeResolver: (value: PromiseLike<any>) => void;
		this.hasClosed = new Promise((res, rej) => {
			closeResolver = res;
		});
		this.webSocket = new FakeWebSocket(() => closeResolver);
	}

	get observedConnectionStates() {
		return this.hubConnectionListener.observedConnectionStates;
	}

	allConnectionStateObserver() {
		return this.hubConnectionListener.allConnectionStateObserver();
	}

	connectionStateObserver() {
		return this.hubConnectionListener.connectionStateObserver();
	}

	teardown() {
		this.hubConnectionListener.teardown();
	}

	/**
	 * Once ready for use, send onOpen and the connection_ack
	 */
	async standardConnectionHandshake() {
		await this.readyForUse;
		await this.triggerOpen();
		await this.handShakeMessage();
	}

	/**
	 * After an open is triggered, the provider has logic that must execute
	 * which changes the function resolvers assigned to the websocket
	 */
	async triggerOpen() {
		await this.runAndResolve(() => {
			this.webSocket.onopen(new Event('', {}));
		});
	}

	/**
	 * After a close is triggered, the provider has logic that must execute
	 * which changes the function resolvers assigned to the websocket
	 */
	async triggerClose() {
		await this.runAndResolve(() => {
			if (this.webSocket.onclose) {
				try {
					this.webSocket.onclose(new CloseEvent('', {}));
				} catch {}
			}
		});
	}

	/**
	 * Close the interface and wait until the connection is either disconnected or disrupted
	 */
	async closeInterface() {
		await this.triggerClose();
		// Wait for either hasClosed or a half second has passed
		await new Promise(async res => {
			// The interface is closed when the socket "hasClosed"
			this.hasClosed.then(() => res(undefined));
			await this.waitUntilConnectionStateIn([CS.Disconnected]);
			res(undefined);
		});
	}

	/**
	 * After an error is triggered, the provider has logic that must execute
	 * which changes the function resolvers assigned to the websocket
	 */
	async triggerError() {
		await this.runAndResolve(() => {
			this.webSocket.onerror(new Event('TestError', {}));
		});
	}

	/**
	 * Produce a websocket with a short delay to mimic reality
	 * @returns A websocket
	 */
	newWebSocket() {
		setTimeout(() => this.readyResolve(Promise.resolve()), 10);
		return this.webSocket;
	}

	/**
	 * Send a connection_ack
	 */
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

	/**
	 * Send a data message
	 */
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

	/**
	 * Emit a message on the socket
	 */
	async sendMessage(message: MessageEvent) {
		// After a message is sent, it takes a few ms for it to enact provider behavior
		await this.runAndResolve(() => {
			this.webSocket.onmessage(message);
		});
	}

	/**
	 * Run a gicommand and resolve to allow internal behavior to execute
	 */
	async runAndResolve(fn) {
		fn();
		await Promise.resolve();
	}

	/**
	 * DELETE THIS?
	 */
	async observesConnectionState(connectionState: CS) {
		return new Promise<void>((res, rej) => {
			this.allConnectionStateObserver().subscribe(value => {
				if (value === connectionState) {
					res(undefined);
				}
			});
		});
	}

	/**
	 * @returns a Promise that will wait for one of the provided states to be observed
	 */
	async waitForConnectionState(connectionStates: CS[]) {
		return this.hubConnectionListener.waitForConnectionState(connectionStates);
	}

	/**
	 * @returns a Promise that will wait until the current state is one of the provided states
	 */
	async waitUntilConnectionStateIn(connectionStates: CS[]) {
		return this.hubConnectionListener.waitUntilConnectionStateIn(
			connectionStates
		);
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
