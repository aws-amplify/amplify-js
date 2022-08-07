/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
	InteractionsResponse,
	InteractionsMessage,
} from '../types';
import {
	LexRuntimeV2Client,
	RecognizeTextCommand,
	RecognizeTextCommandInput,
	RecognizeUtteranceCommand,
	RecognizeUtteranceCommandInput,
	SessionState,
} from '@aws-sdk/client-lex-runtime-v2';
import {
	ConsoleLogger as Logger,
	Credentials,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { convert, unGzipBase64AsJson } from './AWSLexProviderHelper/convert';

const logger = new Logger('AWSLex2Provider');

export class AWSLex2Provider extends AbstractInteractionsProvider {
	// @ts-ignore
	private lex2RuntimeServiceClient: LexRuntimeV2Client;
	private _botsCompleteCallback: object;

	constructor(options: InteractionsOptions = {}) {
		super(options);
		this._botsCompleteCallback = {};
	}

	getProviderName() {
		return 'AWSLex2Provider';
	}

	reportBotStatus(botname: string, sessionState?: SessionState) {
		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', sessionState?.intent?.state);
		if (
			sessionState?.intent?.state === 'ReadyForFulfillment' ||
			sessionState?.intent?.state === 'Fulfilled'
		) {
			// @ts-ignore
			if (typeof this._botsCompleteCallback[botname] === 'function') {
				setTimeout(
					() =>
						// @ts-ignore
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
			// @ts-ignore
			if (typeof this._botsCompleteCallback[botname] === 'function') {
				setTimeout(
					// @ts-ignore
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
		if (!this._config[botname]) {
			return Promise.reject('Bot ' + botname + ' does not exist');
		}
		const credentials = await Credentials.get();
		if (!credentials) {
			return Promise.reject('No credentials');
		}
		this.lex2RuntimeServiceClient = new LexRuntimeV2Client({
			region: this._config[botname].region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});
		let params: RecognizeTextCommandInput | RecognizeUtteranceCommandInput;
		if (typeof message === 'string') {
			params = {
				botAliasId: this._config[botname].botAliasId,
				botId: this._config[botname].botId,
				localeId: this._config[botname].localeId,
				text: message,
				sessionId: credentials.identityId,
			};

			logger.debug('postText to lex2', message);

			try {
				const postTextCommand = new RecognizeTextCommand(params);
				const data = await this.lex2RuntimeServiceClient.send(postTextCommand);
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
					botAliasId: this._config[botname].botAliasId,
					botId: this._config[botname].botId,
					localeId: this._config[botname].localeId,
					sessionId: credentials.identityId,
					requestContentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
					inputStream: await convert(content as Blob),
				} as RecognizeUtteranceCommandInput;
			} else {
				params = {
					botAliasId: this._config[botname].botAliasId,
					botId: this._config[botname].botId,
					localeId: this._config[botname].localeId,
					sessionId: credentials.identityId,
					requestContentType: 'text/plain; charset=utf-8',
					inputStream: content as string,
				} as RecognizeUtteranceCommandInput;
			}
			logger.debug('postContent to lex2', message);
			try {
				// @ts-ignore
				const postContentCommand = new RecognizeUtteranceCommand(params);
				const data = await this.lex2RuntimeServiceClient.send(
					postContentCommand
				);
				// @ts-ignore
				const audioArray = await convert(data.audioStream);
				this.reportBotStatus(
					botname,
					data.sessionState
						? unGzipBase64AsJson<SessionState>(data.sessionState)
						: undefined
				);
				return { ...data, ...{ audioStream: audioArray } };
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	// @ts-ignore
	onComplete(botname: string, callback) {
		if (!this._config[botname]) {
			throw new ErrorEvent('Bot ' + botname + ' does not exist');
		}
		// @ts-ignore
		this._botsCompleteCallback[botname] = callback;
	}
}
