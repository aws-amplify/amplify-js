// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
import { AmplifyContext, ConsoleLogger } from '@aws-amplify/core';

import {
	InteractionsMessage,
	InteractionsOnCompleteCallback,
	InteractionsResponse,
} from '../types/Interactions';
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
	// Per-context onComplete callback registry. Keyed on the *resolved*
	// `AmplifyContext` object identity so a callback registered against one
	// context never fires for another (context isolation) — previously this was
	// a single process-global map keyed only by bot name, which leaked callbacks
	// across independent contexts.
	//
	// NOTE (re-configure semantics): `Amplify.configure()` publishes a NEW frozen
	// global context object on every call. A callback registered against the
	// global context before a re-configure is therefore keyed on the OLD context
	// object and will NOT be found after re-configure (the new global context is
	// a different object). Callers relying on the global context must re-register
	// `onComplete` after reconfiguring; callers passing an explicit context keep
	// their callbacks for that context's lifetime. Using a `WeakMap` lets the
	// per-context records be garbage-collected once a context is unreferenced.
	private readonly _botsCompleteCallbackByCtx = new WeakMap<
		AmplifyContext,
		Record<string, InteractionsOnCompleteCallback>
	>();

	/**
	 * @deprecated
	 * This is used internally by 'sendMessage' to call onComplete callback
	 * for a bot if configured
	 */
	reportBotStatus(
		ctx: AmplifyContext,
		data: AWSLexProviderSendResponse,
		{ name }: AWSLexProviderOption,
	) {
		// Only fire callbacks registered against this exact context (isolation).
		const callback = this._botsCompleteCallbackByCtx.get(ctx)?.[name];
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
		ctx: AmplifyContext,
		botConfig: AWSLexProviderOption,
		message: string | InteractionsMessage,
	): Promise<InteractionsResponse> {
		// check if credentials are present
		let session;
		try {
			session = await ctx.fetchAuthSession();
		} catch (error) {
			return Promise.reject(new Error('No credentials'));
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

				this.reportBotStatus(ctx, data, botConfig);

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
					return Promise.reject(new Error('invalid content type'));
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
					return Promise.reject(new Error('invalid content type'));

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

				this.reportBotStatus(ctx, response, botConfig);

				return response;
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	onComplete(
		ctx: AmplifyContext,
		{ name }: AWSLexProviderOption,
		callback: InteractionsOnCompleteCallback,
	) {
		const existing = this._botsCompleteCallbackByCtx.get(ctx);
		if (existing) {
			existing[name] = callback;
		} else {
			this._botsCompleteCallbackByCtx.set(ctx, { [name]: callback });
		}
	}
}

export const lexProvider = new AWSLexProvider();
