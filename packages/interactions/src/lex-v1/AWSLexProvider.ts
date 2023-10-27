// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	InteractionsOnCompleteCallback,
	InteractionsMessage,
	InteractionsResponse,
} from '../types/Interactions';
import {
	DialogState,
	LexRuntimeServiceClient,
	PostContentCommand,
	PostContentCommandInput,
	PostContentCommandOutput,
	PostTextCommand,
	PostTextCommandInput,
	PostTextCommandOutput,
} from '@aws-sdk/client-lex-runtime-service';
import { getAmplifyUserAgentObject } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger, fetchAuthSession } from '@aws-amplify/core';
import { convert } from '../utils';
import { AWSLexProviderOption } from './types';

const logger = new ConsoleLogger('AWSLexProvider');

interface PostContentCommandOutputFormatted
	extends Omit<PostContentCommandOutput, 'audioStream'> {
	audioStream?: Uint8Array;
}

type AWSLexProviderSendResponse =
	| PostTextCommandOutput
	| PostContentCommandOutputFormatted;

class AWSLexProvider {
	private readonly _botsCompleteCallback: Record<
		string,
		InteractionsOnCompleteCallback
	> = {};

	/**
	 * @deprecated
	 * This is used internally by 'sendMessage' to call onComplete callback
	 * for a bot if configured
	 */
	reportBotStatus(
		data: AWSLexProviderSendResponse,
		{ name }: AWSLexProviderOption
	) {
		const callback = this._botsCompleteCallback[name];
		if (!callback) {
			return;
		}
		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', data.dialogState);

		switch (data.dialogState) {
			case DialogState.READY_FOR_FULFILLMENT:
			case DialogState.FULFILLED:
				callback(undefined, data);
				break;
			case DialogState.FAILED:
				callback(new Error('Bot conversation failed'));
				break;
			default:
				break;
		}
	}

	async sendMessage(
		botConfig: AWSLexProviderOption,
		message: string | InteractionsMessage
	): Promise<InteractionsResponse> {
		// check if credentials are present
		let session;
		try {
			session = await fetchAuthSession();
		} catch (error) {
			return Promise.reject('No credentials');
		}

		const { name, region, alias } = botConfig;
		const client = new LexRuntimeServiceClient({
			region,
			credentials: session.credentials,
			customUserAgent: getAmplifyUserAgentObject(),
		});

		let params: PostTextCommandInput | PostContentCommandInput;
		if (typeof message === 'string') {
			params = {
				botAlias: alias,
				botName: name,
				inputText: message,
				userId: session.identityId,
			};

			logger.debug('postText to lex', message);
			try {
				const postTextCommand = new PostTextCommand(params);
				const data = await client.send(postTextCommand);

				this.reportBotStatus(data, botConfig);
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
				if (typeof content !== 'object') {
					return Promise.reject('invalid content type');
				}
				const inputStream =
					content instanceof Uint8Array ? content : await convert(content);

				params = {
					botAlias: alias,
					botName: name,
					contentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
					userId: session.identityId,
					accept: 'audio/mpeg',
					inputStream,
				};
			} else {
				if (typeof content !== 'string')
					return Promise.reject('invalid content type');

				params = {
					botAlias: alias,
					botName: name,
					contentType: 'text/plain; charset=utf-8',
					inputStream: content,
					userId: session.identityId,
					accept: 'audio/mpeg',
				};
			}
			logger.debug('postContent to lex', message);
			try {
				const postContentCommand = new PostContentCommand(params);
				const data = await client.send(postContentCommand);

				const audioArray = data.audioStream
					? await convert(data.audioStream)
					: undefined;

				const response = { ...data, ...{ audioStream: audioArray } };

				this.reportBotStatus(response, botConfig);
				return response;
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	onComplete(
		{ name }: AWSLexProviderOption,
		callback: InteractionsOnCompleteCallback
	) {
		this._botsCompleteCallback[name] = callback;
	}
}

export const lexProvider = new AWSLexProvider();
