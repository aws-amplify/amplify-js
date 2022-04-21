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
	readyForUse: Promise<undefined>;
	hasClosed: Promise<undefined>;

	private readyResolve: (value: PromiseLike<any>) => void;

	constructor() {
		this.readyForUse = new Promise((res, rej) => {
			this.readyResolve = res;
		});
		let closeResolver: (value: PromiseLike<any>) => void;
		this.hasClosed = new Promise((res, rej) => {
			closeResolver = res;
		});
		this.webSocket = new FakeWebSocket(closeResolver);
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
			if (this.webSocket.onclose)
				this.webSocket.onclose(new CloseEvent('', {}));
		});
	}

	async closeInterface() {
		await this.triggerClose();
		// Wait for either hasClosed or a half second has passed
		await new Promise(res => {
			// The interface is closed when the socket "hasClosed"
			this.hasClosed.then(() => res(undefined));

			// The provider can get pretty wrapped around itself,
			// but its safe to continue after half a second, even if it hasn't closed the socket
			delay(500).then(() => res(undefined));
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
		setTimeout(() => this.readyResolve(undefined), 10);
		return this.webSocket;
	}

	async handShakeMessage() {
		await this.sendMessage(
			new MessageEvent('connection_ack', {
				data: JSON.stringify({
					type: constants.MESSAGE_TYPES.GQL_CONNECTION_ACK,
					payload: { keepAliveTimeout: 100_000 },
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
}

class FakeWebSocket implements WebSocket {
	subscriptionId: string | undefined;
	closeResolver?: (value: PromiseLike<any>) => void;

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
		if (this.closeResolver) this.closeResolver(undefined);
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

	constructor(closeResolver?: (value: PromiseLike<any>) => void) {
		this.closeResolver = closeResolver;
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
