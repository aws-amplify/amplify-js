// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	Category,
	PredictionsAction,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';

import {
	InterpretTextInput,
	InterpretTextOutput,
	InterpretTextCategories,
	TextEntities,
	TextSentiment,
	TextSyntax,
	KeyPhrases,
	InterpretTextOthers,
	isInterpretTextInput,
} from '../types';
import {
	ComprehendClient,
	DetectSyntaxCommand,
	DetectEntitiesCommand,
	DetectDominantLanguageCommand,
	DetectKeyPhrasesCommand,
	DetectSentimentCommand,
} from '@aws-sdk/client-comprehend';
import { assertValidationError } from '../errors/utils/assertValidationError';
import { PredictionsValidationErrorCode } from '../errors/types/validation';

export class AmazonAIInterpretPredictionsProvider {
	private comprehendClient: ComprehendClient;

	getCategory(): string {
		return 'Interpret';
	}

	getProviderName() {
		return 'AmazonAIInterpretPredictionsProvider';
	}

	interpret(input: InterpretTextInput): Promise<InterpretTextOutput> {
		if (isInterpretTextInput(input)) {
			return this.interpretText(input);
		}
	}

	async interpretText(input: InterpretTextInput): Promise<InterpretTextOutput> {
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials
		);

		const { interpretText = {} } =
			Amplify.getConfig().Predictions?.interpret ?? {};
		const { region = '', defaults = {} } = interpretText;
		const { type: defaultType = '' } = defaults;

		const { text: textSource } = input;
		const { source, type = defaultType } = textSource;
		const { text, language } = (source as any) ?? {};

		this.comprehendClient = new ComprehendClient({
			credentials,
			region,
			customUserAgent: getAmplifyUserAgentObject({
				category: Category.Predictions,
				action: PredictionsAction.Interpret,
			}),
		});

		const doAll = type === InterpretTextCategories.ALL;

		let languagePromise: Promise<string>;
		if (doAll || type === InterpretTextCategories.LANGUAGE) {
			const languageDetectionParams = {
				Text: text,
			};
			languagePromise = this.detectLanguage(languageDetectionParams);
		}

		let entitiesPromise: Promise<Array<TextEntities>>;
		if (doAll || type === InterpretTextCategories.ENTITIES) {
			const languageCode = language || (await languagePromise);
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage
			);
			const entitiesDetectionParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			entitiesPromise = this.detectEntities(entitiesDetectionParams);
		}

		let sentimentPromise: Promise<TextSentiment>;
		if (doAll || type === InterpretTextCategories.SENTIMENT) {
			const languageCode = language || (await languagePromise);
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage
			);
			const sentimentParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			sentimentPromise = this.detectSentiment(sentimentParams);
		}

		let syntaxPromise: Promise<Array<TextSyntax>>;
		if (doAll || type === InterpretTextCategories.SYNTAX) {
			const languageCode = language || (await languagePromise);
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage
			);
			const syntaxParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			syntaxPromise = this.detectSyntax(syntaxParams);
		}

		let keyPhrasesPromise: Promise<Array<KeyPhrases>>;
		if (doAll || type === InterpretTextCategories.KEY_PHRASES) {
			const languageCode = language || (await languagePromise);
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage
			);

			const keyPhrasesParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			keyPhrasesPromise = this.detectKeyPhrases(keyPhrasesParams);
		}
		const results = await Promise.all([
			languagePromise,
			entitiesPromise,
			sentimentPromise,
			syntaxPromise,
			keyPhrasesPromise,
		]);
		return {
			textInterpretation: {
				keyPhrases: results[4] || [],
				language: results[0] || '',
				sentiment: results[2],
				syntax: <TextSyntax[]>results[3] || [],
				textEntities: <TextEntities[]>results[1] || [],
			},
		};
	}

	private async detectKeyPhrases(params): Promise<Array<KeyPhrases>> {
		try {
			const detectKeyPhrasesCommand = new DetectKeyPhrasesCommand(params);
			const data = await this.comprehendClient.send(detectKeyPhrasesCommand);
			const { KeyPhrases = [] } = data || {};
			return KeyPhrases.map(({ Text: text }) => {
				return { text };
			});
		} catch (err) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add'
				);
			} else {
				throw err;
			}
		}
	}

	private async detectSyntax(params): Promise<Array<TextSyntax>> {
		try {
			const detectSyntaxCommand = new DetectSyntaxCommand(params);
			const data = await this.comprehendClient.send(detectSyntaxCommand);
			const { SyntaxTokens = [] } = data || {};
			return this.serializeSyntaxFromComprehend(SyntaxTokens);
		} catch (err) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add'
				);
			} else {
				throw err;
			}
		}
	}

	private serializeSyntaxFromComprehend(tokens): Array<TextSyntax> {
		let response = [];
		if (tokens && Array.isArray(tokens)) {
			response = tokens.map(
				({ Text: text = '', PartOfSpeech: { Tag: syntax = '' } = {} }) => {
					return { text, syntax };
				}
			);
		}
		return response;
	}

	private async detectSentiment(params): Promise<TextSentiment> {
		try {
			const detectSentimentCommand = new DetectSentimentCommand(params);
			const data = await this.comprehendClient.send(detectSentimentCommand);
			const {
				Sentiment: predominant = '',
				SentimentScore: {
					Positive: positive = 0,
					Negative: negative = 0,
					Neutral: neutral = 0,
					Mixed: mixed = 0,
				} = {},
			} = ({} = data);
			return { predominant, positive, negative, neutral, mixed };
		} catch (err) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add'
				);
			} else {
				throw err;
			}
		}
	}

	private async detectEntities(params): Promise<Array<TextEntities>> {
		try {
			const detectEntitiesCommand = new DetectEntitiesCommand(params);
			const data = await this.comprehendClient.send(detectEntitiesCommand);
			const { Entities = [] } = data || {};
			return this.serializeEntitiesFromComprehend(Entities);
		} catch (err) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add'
				);
			} else {
				throw err;
			}
		}
	}

	private serializeEntitiesFromComprehend(data): Array<TextEntities> {
		let response = [];
		if (data && Array.isArray(data)) {
			response = data.map(({ Type: type, Text: text }) => {
				return { type, text };
			});
		}
		return response;
	}

	private async detectLanguage(params): Promise<string> {
		try {
			const detectDominantLanguageCommand = new DetectDominantLanguageCommand(
				params
			);
			const data = await this.comprehendClient.send(
				detectDominantLanguageCommand
			);
			const { Languages: [{ LanguageCode }] = [{}] } = ({} = data || {});
			assertValidationError(
				!!LanguageCode,
				PredictionsValidationErrorCode.NoLanguage
			);

			return LanguageCode;
		} catch (err) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add'
				);
			} else {
				throw err;
			}
		}
	}
}
