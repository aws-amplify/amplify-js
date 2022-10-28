// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private async _handleRecognizeUtteranceCommand(
		botname: string,
		data: InteractionsMessage,
		baseParams: lexV2BaseReqParams
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
