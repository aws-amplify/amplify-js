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
	AWSLexV2ProviderOptions,
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
} from '@aws-sdk/client-lex-runtime-v2';
import {
	ConsoleLogger as Logger,
	Credentials,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { convert, unGzipBase64AsJson } from './AWSLexProviderHelper/convert';

const logger = new Logger('AWSLexV2Provider');

interface RecognizeUtteranceCommandOutputFormatted
	extends Omit<
		RecognizeUtteranceCommandOutput,
		| 'messages'
		| 'interpretations'
		| 'sessionState'
		| 'requestAttributes'
		| 'audioStream'
	> {
	messages?: RecognizeTextCommandOutput['messages'];
	sessionState?: RecognizeTextCommandOutput['sessionState'];
	interpretations?: RecognizeTextCommandOutput['interpretations'];
	requestAttributes?: RecognizeTextCommandOutput['requestAttributes'];
	audioStream?: Uint8Array;
}

type AWSLexV2ProviderSendResponse =
	| RecognizeTextCommandOutput
	| RecognizeUtteranceCommandOutputFormatted;

export class AWSLexV2Provider extends AbstractInteractionsProvider {
	private _lexRuntimeServiceV2Client: LexRuntimeV2Client;
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
		return 'AWSLexV2Provider';
	}

	/**
	 * Configure Interactions part with aws configuration
	 * @param {AWSLexV2ProviderOptions} config - Configuration of the Interactions
	 * @return {AWSLexV2ProviderOptions} - Current configuration
	 */
	public configure(
		config: AWSLexV2ProviderOptions = {}
	): AWSLexV2ProviderOptions {
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

		this._lexRuntimeServiceV2Client = new LexRuntimeV2Client({
			region: this._config[botname].region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});

		let response: AWSLexV2ProviderSendResponse;
		if (typeof message === 'string') {
			response = await this._handleRecognizeTextCommand(
				botname,
				message,
				credentials.identityId
			);
		} else {
			response = await this._handleRecognizeUtteranceCommand(
				botname,
				message,
				credentials.identityId
			);
		}
		return response;
	}

	/**
	 * Attach a onComplete callback function to a bot.
	 * The callback is called once the bot's intent is fulfilled
	 * @param {string} botname - Bot name to attach the onComplete callback
	 * @param {(err: Error | null, confirmation: InteractionsResponse) => void} callback - called when Intent Fulfilled
	 */
	public onComplete(
		botname: string,
		callback: (err: Error | null, confirmation: InteractionsResponse) => void
	) {
		// does bot exist
		if (!this._config[botname]) {
			throw new Error('Bot ' + botname + ' does not exist');
		}
		this._botsCompleteCallback[botname] = callback;
	}

	/**
	 * @private
	 * call onComplete callback for a bot if configured
	 */
	private _reportBotStatus(
		data: AWSLexV2ProviderSendResponse,
		botname: string
	) {
		const sessionState = data?.sessionState;

		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', sessionState?.intent?.state);

		const isConfigOnCompleteAttached =
			typeof this._config?.[botname].onComplete === 'function';

		const isApiOnCompleteAttached =
			typeof this._botsCompleteCallback?.[botname] === 'function';

		// no onComplete callbacks added
		if (!isConfigOnCompleteAttached && !isApiOnCompleteAttached) return;

		if (
			sessionState?.intent?.state === 'ReadyForFulfillment' ||
			sessionState?.intent?.state === 'Fulfilled'
		) {
			if (isApiOnCompleteAttached) {
				setTimeout(() => this._botsCompleteCallback?.[botname](null, data), 0);
			}

			if (isConfigOnCompleteAttached) {
				setTimeout(() => this._config[botname].onComplete(null, data), 0);
			}
		}

		if (sessionState?.intent?.state === 'Failed') {
			const error = new Error('Bot conversation failed');
			if (isApiOnCompleteAttached) {
				setTimeout(() => this._botsCompleteCallback[botname](error), 0);
			}

			if (isConfigOnCompleteAttached) {
				setTimeout(() => this._config[botname].onComplete(error), 0);
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
			messages: await unGzipBase64AsJson(data.messages),
			sessionState: await unGzipBase64AsJson(data.sessionState),
			interpretations: await unGzipBase64AsJson(data.interpretations),
			requestAttributes: await unGzipBase64AsJson(data.requestAttributes),
			inputTranscript: await unGzipBase64AsJson(data.inputTranscript),
			audioStream: data.audioStream
				? await convert(data.audioStream)
				: undefined,
		};
		return response;
	}

	/**
	 * handle client's `RecognizeTextCommand`
	 * used for sending simple text message
	 */
	private async _handleRecognizeTextCommand(
		botname: string,
		data: string,
		sessionId: string
	) {
		logger.debug('postText to lex2', data);

		const params: RecognizeTextCommandInput = {
			botAliasId: this._config[botname].aliasId,
			botId: this._config[botname].botId,
			localeId: this._config[botname].localeId,
			text: data,
			sessionId,
		};

		try {
			const recognizeTextCommand = new RecognizeTextCommand(params);
			const data = await this._lexRuntimeServiceV2Client.send(
				recognizeTextCommand
			);

			this._reportBotStatus(data, botname);
			return data;
		} catch (err) {
			return Promise.reject(err);
		}
	}

	/**
	 * handle client's `RecognizeUtteranceCommand`
	 * used for obj text or obj voice message
	 */
	private async _handleRecognizeUtteranceCommand(
		botname: string,
		data: InteractionsMessage,
		sessionId: string
	) {
		const {
			content,
			options: { messageType },
		} = data;

		logger.debug('postContent to lex2', data);
		let params: RecognizeUtteranceCommandInput;

		// prepare params
		if (messageType === 'voice') {
			// voice input
			if (!(content instanceof Blob || content instanceof ReadableStream))
				return Promise.reject('invalid content type');

			params = {
				botAliasId: this._config[botname].aliasId,
				botId: this._config[botname].botId,
				localeId: this._config[botname].localeId,
				sessionId,
				requestContentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
				inputStream: await convert(content),
			};
		} else {
			// text input
			if (typeof content !== 'string')
				return Promise.reject('invalid content type');

			params = {
				botAliasId: this._config[botname].aliasId,
				botId: this._config[botname].botId,
				localeId: this._config[botname].localeId,
				sessionId,
				requestContentType: 'text/plain; charset=utf-8',
				inputStream: content,
			};
		}

		// make API call to lex
		try {
			const recognizeUtteranceCommand = new RecognizeUtteranceCommand(params);
			const data = await this._lexRuntimeServiceV2Client.send(
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
