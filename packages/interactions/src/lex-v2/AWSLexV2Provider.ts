// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
	amplifyUuid,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import { AmplifyContext, ConsoleLogger } from '@aws-amplify/core';

import {
	convert,
	createPerContextCallbackRegistry,
	unGzipBase64AsJson,
} from '../utils';
import {
	InteractionsMessage,
	InteractionsOnCompleteCallback,
	InteractionsResponse,
} from '../types/Interactions';

import { AWSLexV2ProviderOption } from './types';

const logger = new ConsoleLogger('AWSLexV2Provider');

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

interface lexV2BaseReqParams {
	botId: string;
	botAliasId: string;
	localeId: string;
	sessionId: string;
}

class AWSLexV2Provider {
	// Per-context onComplete callback registry (context isolation). See
	// `createPerContextCallbackRegistry` for the full documentation, including
	// the re-configure semantics (`Amplify.configure()` publishes a NEW frozen
	// global context object, so callbacks registered against a prior global
	// context are intentionally not carried over).
	private readonly _botsCompleteCallbackByCtx =
		createPerContextCallbackRegistry<InteractionsOnCompleteCallback>();

	private defaultSessionId: string = amplifyUuid();

	/**
	 * Send a message to a bot
	 * @async
	 * @param {AmplifyContext} ctx - Amplify context used to resolve credentials
	 * @param {AWSLexV2ProviderOption} botConfig - Bot configuration for sending the message
	 * @param {string | InteractionsMessage} message - message to send to the bot
	 * @return {Promise<InteractionsResponse>} A promise resolves to the response from the bot
	 */
	public async sendMessage(
		ctx: AmplifyContext,
		botConfig: AWSLexV2ProviderOption,
		message: string | InteractionsMessage,
	): Promise<InteractionsResponse> {
		// check if credentials are present
		let session;
		try {
			session = await ctx.fetchAuthSession();
		} catch (error) {
			return Promise.reject(new Error('No credentials'));
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
				ctx,
				botConfig,
				message,
				reqBaseParams,
				client,
			);
		} else {
			response = await this._handleRecognizeUtteranceCommand(
				ctx,
				botConfig,
				message,
				reqBaseParams,
				client,
			);
		}

		return response;
	}

	/**
	 * Attach a onComplete callback function to a bot.
	 * The callback is called once the bot's intent is fulfilled
	 * @param {AmplifyContext} ctx - Amplify context the callback is scoped to
	 * @param {AWSLexV2ProviderOption} botConfig - Bot configuration to attach the onComplete callback
	 * @param {InteractionsOnCompleteCallback} callback - called when Intent Fulfilled
	 */
	public onComplete(
		ctx: AmplifyContext,
		{ name }: AWSLexV2ProviderOption,
		callback: InteractionsOnCompleteCallback,
	) {
		this._botsCompleteCallbackByCtx.set(ctx, name, callback);
	}

	/**
	 * call onComplete callback for a bot if configured
	 */
	_reportBotStatus(
		ctx: AmplifyContext,
		data: AWSLexV2ProviderSendResponse,
		{ name }: AWSLexV2ProviderOption,
	) {
		const sessionState = data?.sessionState;

		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', sessionState?.intent?.state);
		// Only fire callbacks registered against this exact context (isolation).
		const callback = this._botsCompleteCallbackByCtx.get(ctx, name);
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
		data: RecognizeUtteranceCommandOutput,
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
		ctx: AmplifyContext,
		botConfig: AWSLexV2ProviderOption,
		data: string,
		baseParams: lexV2BaseReqParams,
		client: LexRuntimeV2Client,
	) {
		logger.debug('postText to lex2', data);

		const params: RecognizeTextCommandInput = {
			...baseParams,
			text: data,
		};

		try {
			const recognizeTextCommand = new RecognizeTextCommand(params);
			const resultData = await client.send(recognizeTextCommand);

			this._reportBotStatus(ctx, resultData, botConfig);

			return resultData;
		} catch (err) {
			return Promise.reject(err);
		}
	}

	/**
	 * handle client's `RecognizeUtteranceCommand`
	 * used for obj text or obj voice message
	 */
	private async _handleRecognizeUtteranceCommand(
		ctx: AmplifyContext,
		botConfig: AWSLexV2ProviderOption,
		data: InteractionsMessage,
		baseParams: lexV2BaseReqParams,
		client: LexRuntimeV2Client,
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
				return Promise.reject(new Error('invalid content type'));
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
				return Promise.reject(new Error('invalid content type'));

			params = {
				...baseParams,
				requestContentType: 'text/plain; charset=utf-8',
				inputStream: content,
			};
		}

		// make API call to lex
		try {
			const recognizeUtteranceCommand = new RecognizeUtteranceCommand(params);
			const resultData = await client.send(recognizeUtteranceCommand);

			const response = await this._formatUtteranceCommandOutput(resultData);
			this._reportBotStatus(ctx, response, botConfig);

			return response;
		} catch (err) {
			return Promise.reject(err);
		}
	}
}

export const lexProvider = new AWSLexV2Provider();
