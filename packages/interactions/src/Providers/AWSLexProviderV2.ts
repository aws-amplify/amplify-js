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
import {
	InteractionsOptions,
	AWSLexProviderV2Options,
	InteractionsResponse,
	InteractionsMessage,
} from '../types';
import {
	LexRuntimeV2Client,
	RecognizeTextCommand,
	RecognizeTextCommandInput,
	RecognizeTextCommandOutput,
	RecognizeUtteranceCommand,
	RecognizeUtteranceCommandInput,
	RecognizeUtteranceCommandOutput,
	SessionState,
} from '@aws-sdk/client-lex-runtime-v2';

import {
	ConsoleLogger as Logger,
	Credentials,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { convert, unGzipBase64AsJson } from './AWSLexProviderHelper/convert';

const logger = new Logger('AWSLexProviderV2');

export class AWSLexProviderV2 extends AbstractInteractionsProvider {
	private lexRuntimeServiceV2Client: LexRuntimeV2Client;
	private _botsCompleteCallback: object;

	constructor(options: InteractionsOptions = {}) {
		super(options);
		this._botsCompleteCallback = {};
	}

	getProviderName(): string {
		return 'AWSLexProviderV2';
	}

	configure(config: AWSLexProviderV2Options = {}): InteractionsOptions {
		const propertiesToTest = [
			'name',
			'botId',
			'aliasId',
			'localeId',
			'providerName',
			'region',
		];

		Object.keys(config).map(botKey => {
			const botConfig = config[botKey];

			// is bot config correct
			if (
				!propertiesToTest.every(x => {
					return x in botConfig;
				})
			) {
				throw new Error('invalid bot configuration');
			}
		});
		return super.configure(config);
	}

	reportBotStatus(botname: string, sessionState?: SessionState) {
		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', sessionState?.intent?.state);
		if (
			sessionState?.intent?.state === 'ReadyForFulfillment' ||
			sessionState?.intent?.state === 'Fulfilled'
		) {
			if (typeof this._botsCompleteCallback[botname] === 'function') {
				setTimeout(
					() =>
						this._botsCompleteCallback[botname](null, {
							slots: sessionState?.intent?.slots,
						}),
					0
				);
			}

			if (
				this._config &&
				typeof this._config[botname].onComplete === 'function'
			) {
				setTimeout(
					() =>
						this._config[botname].onComplete(null, {
							slots: sessionState?.intent?.slots,
						}),
					0
				);
			}
		}

		if (sessionState?.intent?.state === 'Failed') {
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
	): Promise<InteractionsResponse> {
		// check message type
		if (
			!(
				typeof message === 'string' || // simple text message
				// obj text message
				(message?.options?.messageType === 'text' &&
					typeof message?.content === 'string') ||
				// obj voice message
				(message?.options?.messageType === 'voice' &&
					message?.content instanceof Blob)
			)
		) {
			return Promise.reject(`message type isn't supported`);
		}

		if (!this._config[botname]) {
			return Promise.reject('Bot ' + botname + ' does not exist');
		}

		// check if credentials are present
		let credentials;
		try {
			credentials = await Credentials.get();
		} catch (error) {
			return Promise.reject('No credentials');
		}

		this.lexRuntimeServiceV2Client = new LexRuntimeV2Client({
			region: this._config[botname].region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});
		let params: RecognizeTextCommandInput | RecognizeUtteranceCommandInput;
		if (typeof message === 'string') {
			params = {
				botAliasId: this._config[botname].aliasId,
				botId: this._config[botname].botId,
				localeId: this._config[botname].localeId,
				text: message,
				sessionId: credentials.identityId,
			} as RecognizeTextCommandInput;

			logger.debug('postText to lex2', message);

			try {
				const recognizeTextCommand = new RecognizeTextCommand(params);
				const data: RecognizeTextCommandOutput =
					await this.lexRuntimeServiceV2Client.send(recognizeTextCommand);

				this.reportBotStatus(botname, data.sessionState);
				return data;
			} catch (err) {
				return Promise.reject(err);
			}
		} else {
			const {
				content,
				options: { messageType },
			} = message;
			if (messageType === 'voice') {
				params = {
					botAliasId: this._config[botname].aliasId,
					botId: this._config[botname].botId,
					localeId: this._config[botname].localeId,
					sessionId: credentials.identityId,
					requestContentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
					inputStream: await convert(content as Blob | ReadableStream),
				} as RecognizeUtteranceCommandInput;
			} else {
				params = {
					botAliasId: this._config[botname].aliasId,
					botId: this._config[botname].botId,
					localeId: this._config[botname].localeId,
					sessionId: credentials.identityId,
					requestContentType: 'text/plain; charset=utf-8',
					inputStream: content as string,
				} as RecognizeUtteranceCommandInput;
			}
			logger.debug('postContent to lex2', message);
			try {
				const recognizeUtteranceCommand = new RecognizeUtteranceCommand(params);
				const data: RecognizeUtteranceCommandOutput =
					await this.lexRuntimeServiceV2Client.send(recognizeUtteranceCommand);

				const audioArray = await convert(
					data.audioStream as Blob | ReadableStream
				);

				const sessionState = data.sessionState
					? unGzipBase64AsJson<SessionState>(data.sessionState)
					: undefined;

				const messages = data.messages
					? unGzipBase64AsJson(data.messages)
					: undefined;

				const interpretations = data.interpretations
					? unGzipBase64AsJson(data.interpretations)
					: undefined;

				this.reportBotStatus(botname, sessionState);
				return {
					...data,
					...{
						audioStream: audioArray,
						messages,
						sessionState,
						interpretations,
					},
				};
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	onComplete(botname: string, callback) {
		// check input format
		if (!(typeof botname === 'string' && typeof callback === 'function')) {
			throw new Error(`message type isn't supported`);
		}

		// does bot exist
		if (!this._config[botname]) {
			throw new Error('Bot ' + botname + ' does not exist');
		}
		this._botsCompleteCallback[botname] = callback;
	}
}
