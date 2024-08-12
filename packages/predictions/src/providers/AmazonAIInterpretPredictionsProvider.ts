// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	Category,
	PredictionsAction,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import {
	ComprehendClient,
	DetectDominantLanguageCommand,
	DetectEntitiesCommand,
	DetectEntitiesCommandInput,
	DetectKeyPhrasesCommand,
	DetectKeyPhrasesCommandInput,
	DetectSentimentCommand,
	DetectSentimentCommandInput,
	DetectSyntaxCommand,
	DetectSyntaxCommandInput,
	Entity,
	SyntaxToken,
} from '@aws-sdk/client-comprehend';

import { PredictionsValidationErrorCode } from '../errors/types/validation';
import { assertValidationError } from '../errors/utils/assertValidationError';
import {
	DetectParams,
	InterpretTextInput,
	InterpretTextOthers,
	InterpretTextOutput,
	KeyPhrases,
	TextEntities,
	TextSentiment,
	TextSyntax,
	isInterpretTextOthers,
	isValidInterpretInput,
} from '../types';

export class AmazonAIInterpretPredictionsProvider {
	private comprehendClient?: ComprehendClient;

	getProviderName() {
		return 'AmazonAIInterpretPredictionsProvider';
	}

	interpret(input: InterpretTextInput): Promise<InterpretTextOutput> {
		assertValidationError(
			isValidInterpretInput(input),
			PredictionsValidationErrorCode.InvalidInput,
		);

		return this.interpretText(input);
	}

	async interpretText(input: InterpretTextInput): Promise<InterpretTextOutput> {
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials,
		);

		const { interpretText = {} } =
			Amplify.getConfig().Predictions?.interpret ?? {};
		const { region = '', defaults = {} } = interpretText;
		const { type: defaultType = '' } = defaults;

		const { text: textSource } = input;
		const { source, type = defaultType } = textSource;
		const { text } = source;
		let sourceLanguage;
		if (isInterpretTextOthers(textSource)) {
			sourceLanguage = (textSource as InterpretTextOthers).source.language;
		}

		this.comprehendClient = new ComprehendClient({
			credentials,
			region,
			customUserAgent: getAmplifyUserAgentObject({
				category: Category.Predictions,
				action: PredictionsAction.Interpret,
			}),
		});

		const doAll = type === 'all';

		let languageCode = sourceLanguage;
		if (doAll || type === 'language') {
			const languageDetectionParams = {
				Text: text,
			};
			languageCode = await this.detectLanguage(languageDetectionParams);
		}

		let entitiesPromise: Promise<TextEntities[]> | undefined;
		if (doAll || type === 'entities') {
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage,
			);
			const entitiesDetectionParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			entitiesPromise = this.detectEntities(entitiesDetectionParams);
		}

		let sentimentPromise: Promise<TextSentiment> | undefined;
		if (doAll || type === 'sentiment') {
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage,
			);
			const sentimentParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			sentimentPromise = this.detectSentiment(sentimentParams);
		}

		let syntaxPromise: Promise<TextSyntax[]> | undefined;
		if (doAll || type === 'syntax') {
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage,
			);
			const syntaxParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			syntaxPromise = this.detectSyntax(syntaxParams);
		}

		let keyPhrasesPromise: Promise<KeyPhrases> | undefined;
		if (doAll || type === 'keyPhrases') {
			assertValidationError(
				!!languageCode,
				PredictionsValidationErrorCode.NoLanguage,
			);

			const keyPhrasesParams = {
				Text: text,
				LanguageCode: languageCode,
			};
			keyPhrasesPromise = this.detectKeyPhrases(keyPhrasesParams);
		}
		const [textEntities, sentiment, syntax, keyPhrases] = await Promise.all([
			entitiesPromise,
			sentimentPromise,
			syntaxPromise,
			keyPhrasesPromise,
		]);

		return {
			textInterpretation: {
				keyPhrases,
				language: languageCode,
				sentiment,
				syntax,
				textEntities,
			},
		};
	}

	private async detectKeyPhrases(params: DetectParams): Promise<KeyPhrases> {
		try {
			const detectKeyPhrasesCommand = new DetectKeyPhrasesCommand(
				params as DetectKeyPhrasesCommandInput,
			);
			const data = await this.comprehendClient!.send(detectKeyPhrasesCommand);
			const { KeyPhrases: keyPhrases = [] } = data || {};

			return keyPhrases.map(({ Text: text }) => {
				return { text };
			});
		} catch (err: any) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add',
				);
			} else {
				throw err;
			}
		}
	}

	private async detectSyntax(params: DetectParams): Promise<TextSyntax[]> {
		try {
			const detectSyntaxCommand = new DetectSyntaxCommand(
				params as DetectSyntaxCommandInput,
			);
			const data = await this.comprehendClient!.send(detectSyntaxCommand);
			const { SyntaxTokens = [] } = data || {};

			return this.serializeSyntaxFromComprehend(SyntaxTokens);
		} catch (err: any) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add',
				);
			} else {
				throw err;
			}
		}
	}

	private serializeSyntaxFromComprehend(tokens: SyntaxToken[]): TextSyntax[] {
		let response: TextSyntax[] = [];
		if (tokens && Array.isArray(tokens)) {
			response = tokens.map(
				({ Text: text = '', PartOfSpeech: { Tag: syntax = '' } = {} }) => {
					return { text, syntax };
				},
			);
		}

		return response;
	}

	private async detectSentiment(params: DetectParams): Promise<TextSentiment> {
		try {
			const detectSentimentCommand = new DetectSentimentCommand(
				params as DetectSentimentCommandInput,
			);
			const data = await this.comprehendClient!.send(detectSentimentCommand);
			const {
				Sentiment: predominant = '',
				SentimentScore: {
					Positive: positive = 0,
					Negative: negative = 0,
					Neutral: neutral = 0,
					Mixed: mixed = 0,
				} = {},
			} = data ?? {};

			return { predominant, positive, negative, neutral, mixed };
		} catch (err: any) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add',
				);
			} else {
				throw err;
			}
		}
	}

	private async detectEntities(params: DetectParams): Promise<TextEntities[]> {
		try {
			const detectEntitiesCommand = new DetectEntitiesCommand(
				params as DetectEntitiesCommandInput,
			);
			const data = await this.comprehendClient!.send(detectEntitiesCommand);
			const { Entities = [] } = data || {};

			return this.serializeEntitiesFromComprehend(Entities);
		} catch (err: any) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add',
				);
			} else {
				throw err;
			}
		}
	}

	private serializeEntitiesFromComprehend(data: Entity[]): TextEntities[] {
		let response: TextEntities[] = [];
		if (data && Array.isArray(data)) {
			response = data.map(({ Type: type, Text: text }) => {
				return { type, text };
			});
		}

		return response;
	}

	private async detectLanguage(params: { Text: string }): Promise<string> {
		try {
			const detectDominantLanguageCommand = new DetectDominantLanguageCommand(
				params,
			);
			const data = await this.comprehendClient!.send(
				detectDominantLanguageCommand,
			);
			const { Languages: [{ LanguageCode }] = [{ LanguageCode: undefined }] } =
				data ?? {};
			assertValidationError(
				!!LanguageCode,
				PredictionsValidationErrorCode.NoLanguage,
			);

			return LanguageCode;
		} catch (err: any) {
			if (err.code === 'AccessDeniedException') {
				throw new Error(
					'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
						'amplify predictions add',
				);
			} else {
				throw err;
			}
		}
	}
}
