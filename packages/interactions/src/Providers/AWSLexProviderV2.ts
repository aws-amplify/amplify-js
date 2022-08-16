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
	AWSLexProviderV2Options,
	InteractionsResponse,
	InteractionsMessage,
	RecognizeUtteranceCommandOutputFormatted,
	AWSLexProviderV2SendResponse,
} from '../types';
import {
	LexRuntimeV2Client,
	RecognizeTextCommand,
	RecognizeTextCommandInput,
	RecognizeUtteranceCommand,
	RecognizeUtteranceCommandInput,
	RecognizeUtteranceCommandOutput,
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

	/**
	 * Initialize Interactions with AWS configurations
	 * @param {InteractionsOptions} options - Configuration object for Interactions
	 */
	constructor(options: InteractionsOptions = {}) {
		super(options);
		this._botsCompleteCallback = {};
	}

	/**
	 * get provider name of the plugin
	 * @returns {string} name of the provider
	 */
	public getProviderName() {
		return 'AWSLexProviderV2';
	}

	/**
	 * Configure Interactions part with aws configuration
	 * @param {AWSLexProviderV2Options} config - Configuration of the Interactions
	 * @return {AWSLexProviderV2Options} - Current configuration
	 */
	public configure(
		config: AWSLexProviderV2Options = {}
	): AWSLexProviderV2Options {
		const propertiesToTest = [
			'name',
			'botId',
			'aliasId',
			'localeId',
			'providerName',
			'region',
		];

		Object.keys(config).forEach(botKey => {
			const botConfig = config[botKey];

			// is bot config correct
			if (!propertiesToTest.every(x => x in botConfig)) {
				throw new Error('invalid bot configuration');
			}
		});
		return super.configure(config);
	}

	/**
	 * Send a message to a bot
	 * @async
	 * @param {string} botname - Bot name to send the message
	 * @param {string | InteractionsMessage} message - message to send to the bot
	 * @return {Promise<InteractionsResponse>} A promise resolves to the response from the bot
	 */
	public async sendMessage(
		botname: string,
		message: string | InteractionsMessage
	): Promise<InteractionsResponse> {
		// check if bot exists
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
			};

			logger.debug('postText to lex2', message);
			try {
				const recognizeTextCommand = new RecognizeTextCommand(params);
				const data = await this.lexRuntimeServiceV2Client.send(
					recognizeTextCommand
				);

				this._reportBotStatus(data, botname);
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
				if (!(content instanceof Blob || content instanceof ReadableStream))
					return Promise.reject('invalid content type');

				params = {
					botAliasId: this._config[botname].aliasId,
					botId: this._config[botname].botId,
					localeId: this._config[botname].localeId,
					sessionId: credentials.identityId,
					requestContentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
					inputStream: await convert(content),
				};
			} else {
				if (typeof content !== 'string')
					return Promise.reject('invalid content type');

				params = {
					botAliasId: this._config[botname].aliasId,
					botId: this._config[botname].botId,
					localeId: this._config[botname].localeId,
					sessionId: credentials.identityId,
					requestContentType: 'text/plain; charset=utf-8',
					inputStream: content,
				};
			}
			logger.debug('postContent to lex2', message);
			try {
				const recognizeUtteranceCommand = new RecognizeUtteranceCommand(params);
				const data = await this.lexRuntimeServiceV2Client.send(
					recognizeUtteranceCommand
				);

				const response = await this._formatUtteranceCommandOutput(data);
				this._reportBotStatus(response, botname);
				return response;
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	/**
	 * Attach a onComplete callback function to a bot.
	 * The callback is called once the bot's intent is fulfilled
	 * @param {string} botname - Bot name to attach the onComplete callback
	 * @param {(err, confirmation) => void} callback - callback function to call once intent is completed
	 */
	public onComplete(botname: string, callback: (err, confirmation) => void) {
		// does bot exist
		if (!this._config[botname]) {
			throw new Error('Bot ' + botname + ' does not exist');
		}
		this._botsCompleteCallback[botname] = callback;
	}

	/**
	 * @private
	 */

	/**
	 * call onComplete callback for a bot if configured
	 */
	private _reportBotStatus(
		data: AWSLexProviderV2SendResponse,
		botname: string
	) {
		const sessionState = data?.sessionState;

		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', sessionState?.intent?.state);

		if (
			sessionState?.intent?.state === 'ReadyForFulfillment' ||
			sessionState?.intent?.state === 'Fulfilled'
		) {
			if (typeof this._botsCompleteCallback[botname] === 'function') {
				setTimeout(() => this._botsCompleteCallback[botname](null, data), 0);
			}

			if (
				this._config &&
				typeof this._config[botname].onComplete === 'function'
			) {
				setTimeout(() => this._config[botname].onComplete(null, data), 0);
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

	/**
	 * Format UtteranceCommandOutput's response
	 * decompress attributes
	 * update audioStream format
	 */
	private async _formatUtteranceCommandOutput(
		data: RecognizeUtteranceCommandOutput
	): Promise<RecognizeUtteranceCommandOutputFormatted> {
		const response: RecognizeUtteranceCommandOutputFormatted = {
			...data,
			messages: data.messages ? unGzipBase64AsJson(data.messages) : undefined,
			sessionState: data.sessionState
				? unGzipBase64AsJson(data.sessionState)
				: undefined,
			interpretations: data.interpretations
				? unGzipBase64AsJson(data.interpretations)
				: undefined,
			requestAttributes: data.requestAttributes
				? unGzipBase64AsJson(data.requestAttributes)
				: undefined,
			audioStream: data.audioStream
				? await convert(data.audioStream)
				: undefined,
		};
		return response;
	}
}
