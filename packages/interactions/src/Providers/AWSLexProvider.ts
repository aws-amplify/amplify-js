// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AbstractInteractionsProvider } from './InteractionsProvider';
import {
	InteractionsOptions,
	AWSLexProviderOptions,
	InteractionsResponse,
	InteractionsMessage,
} from '../types';
import {
	LexRuntimeServiceClient,
	PostTextCommand,
	PostTextCommandInput,
	PostTextCommandOutput,
	PostContentCommand,
	PostContentCommandInput,
	PostContentCommandOutput,
} from '@aws-sdk/client-lex-runtime-service';
import {
	ConsoleLogger as Logger,
	Credentials,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { convert } from './AWSLexProviderHelper/utils';

const logger = new Logger('AWSLexProvider');

interface PostContentCommandOutputFormatted
	extends Omit<PostContentCommandOutput, 'audioStream'> {
	audioStream?: Uint8Array;
}

type AWSLexProviderSendResponse =
	| PostTextCommandOutput
	| PostContentCommandOutputFormatted;

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

	configure(config: AWSLexProviderOptions = {}): AWSLexProviderOptions {
		const propertiesToTest = ['name', 'alias', 'region'];

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
	 * @private
	 * @deprecated
	 * This is used internally by 'sendMessage' to call onComplete callback
	 * for a bot if configured
	 */
	reportBotStatus(data: AWSLexProviderSendResponse, botname: string) {
		// Check if state is fulfilled to resolve onFullfilment promise
		logger.debug('postContent state', data.dialogState);
		if (
			data.dialogState === 'ReadyForFulfillment' ||
			data.dialogState === 'Fulfilled'
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

		this.lexRuntimeServiceClient = new LexRuntimeServiceClient({
			region: this._config[botname].region,
			credentials,
			customUserAgent: getAmplifyUserAgent(),
		});

		let params: PostTextCommandInput | PostContentCommandInput;
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
					botAlias: this._config[botname].alias,
					botName: botname,
					contentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
					userId: credentials.identityId,
					accept: 'audio/mpeg',
					inputStream,
				};
			} else {
				if (typeof content !== 'string')
					return Promise.reject('invalid content type');

				params = {
					botAlias: this._config[botname].alias,
					botName: botname,
					contentType: 'text/plain; charset=utf-8',
					inputStream: content,
					userId: credentials.identityId,
					accept: 'audio/mpeg',
				};
			}
			logger.debug('postContent to lex', message);
			try {
				const postContentCommand = new PostContentCommand(params);
				const data = await this.lexRuntimeServiceClient.send(
					postContentCommand
				);

				const audioArray = data.audioStream
					? await convert(data.audioStream)
					: undefined;

				const response = { ...data, ...{ audioStream: audioArray } };

				this.reportBotStatus(response, botname);
				return response;
			} catch (err) {
				return Promise.reject(err);
			}
		}
	}

	onComplete(botname: string, callback: (err, confirmation) => void) {
		// does bot exist
		if (!this._config[botname]) {
			throw new Error('Bot ' + botname + ' does not exist');
		}
		this._botsCompleteCallback[botname] = callback;
	}
}
