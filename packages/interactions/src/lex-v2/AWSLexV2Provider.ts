// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	CompletionCallback,
	InteractionsMessage,
	InteractionsResponse,
} from '../types';
import {
	IntentState,
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
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '@aws-amplify/core';
import { convert, unGzipBase64AsJson } from '../utils';
import { v4 as uuid } from 'uuid';
import { AWSLexV2ProviderOption } from './types';

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

type lexV2BaseReqParams = {
	botId: string;
	botAliasId: string;
	localeId: string;
	sessionId: string;
};

class AWSLexV2Provider {
	private readonly _botsCompleteCallback: Record<string, CompletionCallback> =
		{};
	private defaultSessionId: string = uuid();

	/**
	 * Send a message to a bot
	 * @async
	 * @param {AWSLexV2ProviderOption} botConfig - Bot configuration for sending the message
	 * @param {string | InteractionsMessage} message - message to send to the bot
	 * @return {Promise<InteractionsResponse>} A promise resolves to the response from the bot
	 */
	public async sendMessage(
		botConfig: AWSLexV2ProviderOption,
		message: string | InteractionsMessage
	): Promise<InteractionsResponse> {
		// check if credentials are present
		let session;
		try {
			session = await fetchAuthSession();
		} catch (error) {
			return Promise.reject('No credentials');
		}

		const { region, aliasId, localeId, botId } = botConfig;
		const client = new LexRuntimeV2Client({
			region,
			credentials: session.credentials,
			customUserAgent: getAmplifyUserAgentObject(),
		});

		let response: AWSLexV2ProviderSendResponse;

		// common base params for all requests
		const reqBaseParams: lexV2BaseReqParams = {
			botAliasId: aliasId,
			botId,
			localeId,
			sessionId: session.identityId ?? this.defaultSessionId,
		};

		if (typeof message === 'string') {
			response = await this._handleRecognizeTextCommand(
				botConfig,
				message,
				reqBaseParams,
				client
			);
		} else {
			response = await this._handleRecognizeUtteranceCommand(
				botConfig,
				message,
				reqBaseParams,
				client
			);
		}
		return response;
	}

	/**
	 * Attach a onComplete callback function to a bot.
	 * The callback is called once the bot's intent is fulfilled
	 * @param {AWSLexV2ProviderOption} botConfig - Bot configuration to attach the onComplete callback
	 * @param {CompletionCallback} callback - called when Intent Fulfilled
	 */
	public onComplete(
		{ name }: AWSLexV2ProviderOption,
		callback: CompletionCallback
	) {
		this._botsCompleteCallback[name] = callback;
	}

	/**
	 * call onComplete callback for a bot if configured
	 */
	_reportBotStatus(
		data: AWSLexV2ProviderSendResponse,
		{ name }: AWSLexV2ProviderOption
	) {
		const sessionState = data?.sessionState;

		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', sessionState?.intent?.state);
		const callback = this._botsCompleteCallback[name];
		if (!callback) {
			return;
		}

		switch (sessionState?.intent?.state) {
			case IntentState.READY_FOR_FULFILLMENT:
			case IntentState.FULFILLED:
				callback(undefined, data);
				break;
			case IntentState.FAILED:
				callback(new Error('Bot conversation failed'));
				break;
			default:
				break;
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
		return {
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
	}

	/**
	 * handle client's `RecognizeTextCommand`
	 * used for sending simple text message
	 */
	private async _handleRecognizeTextCommand(
		botConfig: AWSLexV2ProviderOption,
		data: string,
		baseParams: lexV2BaseReqParams,
		client: LexRuntimeV2Client
	) {
		logger.debug('postText to lex2', data);

		const params: RecognizeTextCommandInput = {
			...baseParams,
			text: data,
		};

		try {
			const recognizeTextCommand = new RecognizeTextCommand(params);
			const data = await client.send(recognizeTextCommand);

			this._reportBotStatus(data, botConfig);
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
		botConfig: AWSLexV2ProviderOption,
		data: InteractionsMessage,
		baseParams: lexV2BaseReqParams,
		client: LexRuntimeV2Client
	) {
		const {
			content,
			options: { messageType },
		} = data;

		logger.debug('postContent to lex2', data);
		let params: RecognizeUtteranceCommandInput;

		// prepare params
		if (messageType === 'voice') {
			if (typeof content !== 'object') {
				return Promise.reject('invalid content type');
			}

			const inputStream =
				content instanceof Uint8Array ? content : await convert(content);

			params = {
				...baseParams,
				requestContentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
				inputStream,
			};
		} else {
			// text input
			if (typeof content !== 'string')
				return Promise.reject('invalid content type');

			params = {
				...baseParams,
				requestContentType: 'text/plain; charset=utf-8',
				inputStream: content,
			};
		}

		// make API call to lex
		try {
			const recognizeUtteranceCommand = new RecognizeUtteranceCommand(params);
			const data = await client.send(recognizeUtteranceCommand);

			const response = await this._formatUtteranceCommandOutput(data);
			this._reportBotStatus(response, botConfig);
			return response;
		} catch (err) {
			return Promise.reject(err);
		}
	}
}

export const lexProvider = new AWSLexV2Provider();
