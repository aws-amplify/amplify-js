/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { AbstractInteractionsProvider } from './InteractionsProvider';
import { InteractionsOptions, InteractionsMessage, AcceptType } from '../types';
import {
	LexRuntimeServiceClient,
	PostTextCommand,
	PostContentCommand,
} from '@aws-sdk/client-lex-runtime-service';
import {
	ConsoleLogger as Logger,
	Credentials,
	getAmplifyUserAgent,
	browserOrNode,
} from '@aws-amplify/core';
import { Readable } from 'stream';

const logger = new Logger('AWSLexProvider');

export class AWSLexProvider extends AbstractInteractionsProvider {
	private lexRuntimeServiceClient: LexRuntimeServiceClient;
	private _botsCompleteCallback: object;

	constructor(options: InteractionsOptions = {}) {
		super(options);
		this._botsCompleteCallback = {};
	}

	getProviderName() {
		return 'AWSLexProvider';
	}

	reportBotStatus(data, botname) {
		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', data.dialogState);
		if (
			data.dialogState === 'ReadyForFulfillment' ||
			data.dialogState === 'Fulfilled'
		) {
			if (typeof this._botsCompleteCallback[botname] === 'function') {
				setTimeout(
					() =>
						this._botsCompleteCallback[botname](null, { slots: data.slots }),
					0
				);
			}

			if (
				this._config &&
				typeof this._config[botname].onComplete === 'function'
			) {
				setTimeout(
					() => this._config[botname].onComplete(null, { slots: data.slots }),
					0
				);
			}
		}

		if (data.dialogState === 'Failed') {
			if (typeof this._botsCompleteCallback[botname] === 'function') {
				setTimeout(
					() => this._botsCompleteCallback[botname]('Bot conversation failed'),
					0
				);
			}

			if (
				this._config &&
				typeof this._config[botname].onComplete === 'function'
			) {
				setTimeout(
					() => this._config[botname].onComplete('Bot conversation failed'),
					0
				);
			}
		}
	}

	async sendMessage(
		botname: string,
		message: string | InteractionsMessage
	): Promise<object> {
		if (!this._config[botname]) {
			return Promise.reject('Bot ' + botname + ' does not exist');
		}
		const credentials = await Credentials.get();
		if (!credentials) {
			return Promise.reject('No credentials');
		}

		this.lexRuntimeServiceClient = new LexRuntimeServiceClient({
			region: this._config[botname].region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});

		let params;
		if (typeof message === 'string') {
			params = {
				botAlias: this._config[botname].alias,
				botName: botname,
				inputText: message,
				userId: credentials.identityId,
			};

			logger.debug('postText to lex', message);

			try {
				const postTextCommand = new PostTextCommand(params);
				const data = await this.lexRuntimeServiceClient.send(postTextCommand);
				this.reportBotStatus(data, botname);
				return data;
			} catch (err) {
				return Promise.reject(err);
			}
		} else {
			if (message.options['messageType'] === 'voice') {
				params = {
					botAlias: this._config[botname].alias,
					botName: botname,
					contentType: 'audio/x-l16; sample-rate=16000',
					inputStream: message.content,
					userId: credentials.identityId,
					accept: 'audio/mpeg',
				};
			} else {
				params = {
					botAlias: this._config[botname].alias,
					botName: botname,
					contentType: 'text/plain; charset=utf-8',
					inputStream: message.content,
					userId: credentials.identityId,
					accept: 'audio/mpeg',
				};
			}
			logger.debug('postContent to lex', message);
			try {
				const postContentCommand = new PostContentCommand(params);
				let data = await this.lexRuntimeServiceClient.send(postContentCommand);
				if (message.options['messageType'] === 'voice') {
					const accept: AcceptType = message.options.accept || 'Uint8Array';
					const audioArray = await this.convert(data.audioStream, accept);
					data = { ...data, ...{ audioStream: audioArray } };
				}
				this.reportBotStatus(data, botname);
				return data;
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	onComplete(botname: string, callback) {
		if (!this._config[botname]) {
			throw new ErrorEvent('Bot ' + botname + ' does not exist');
		}
		this._botsCompleteCallback[botname] = callback;
	}

	private convert(
		stream: Readable | ReadableStream | Blob,
		accept: AcceptType
	): Promise<any> {
		/**
		 * This assumes that sdk returns `ReadableStream | Blob` on browser, `Readable` on Node,
		 * and `Blob` on React Native according to https://github.com/aws/aws-sdk-js-v3/issues/843.
		 */
		if (stream instanceof Blob && accept === 'Blob') {
			return Promise.resolve(stream); // no conversion required
		} else if (stream instanceof Readable) {
			return Promise.reject('Node.js is currently not supported.');
		}
		const { isBrowser } = browserOrNode();
		const converter = isBrowser ? this.convertOnBrowser : this.convertOnRN;
		return converter(stream, accept);
	}

	private convertOnBrowser(
		stream: ReadableStream | Blob,
		accept: AcceptType
	): Promise<ArrayBuffer | Blob | Uint8Array> {
		const response = new Response(stream);
		if (accept === 'ArrayBuffer') {
			return response.arrayBuffer();
		} else if (accept === 'Blob') {
			return response.blob();
		} else {
			return response.arrayBuffer().then(buffer => new Uint8Array(buffer));
		}
	}

	private convertOnRN(
		stream: ReadableStream | Blob,
		accept: AcceptType
	): Promise<ArrayBuffer | Blob | Uint8Array> {
		return new Promise(async (res, rej) => {
			if (stream instanceof ReadableStream) {
				return rej(`Unexpected response type 'ReadableStream' in React Native`);
			}
			const blobURL = URL.createObjectURL(stream);
			const request = new XMLHttpRequest();
			request.responseType = 'arraybuffer';
			request.onload = _event => {
				if (accept === 'ArrayBuffer') {
					return res(request.response);
				} else {
					return res(new Uint8Array(request.response));
				}
			};
			request.onerror = rej;
			request.open('GET', blobURL, true);
			request.send();
		});
	}
}
