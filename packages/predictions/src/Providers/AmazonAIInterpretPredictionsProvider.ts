import { Credentials } from '@aws-amplify/core';
import { AbstractInterpretPredictionsProvider } from '../types/Providers';

import {
	InterpretTextInput,
	InterpretTextOutput,
	InterpretTextCategories,
	TextEntities,
	TextSentiment,
	TextSyntax,
	KeyPhrases,
} from '../types';
import { Comprehend } from 'aws-sdk';

export default class AmazonAIInterpretPredictionsProvider extends AbstractInterpretPredictionsProvider {
	constructor() {
		super();
	}

	getProviderName() {
		return 'AmazonAIInterpretPredictionsProvider';
	}

	interpretText(input: InterpretTextInput): Promise<InterpretTextOutput> {
		return new Promise(async (res, rej) => {
			const credentials = await Credentials.get();
			if (!credentials) return rej('No credentials');
			const {
				interpretText: {
					region = '',
					defaults: { type: interpretTypeConfig = '' } = {},
				} = {},
			} = this._config;
			const {
				text: {
					source: { text = '' } = {},
					type: interpretType = interpretTypeConfig,
				} = {},
			} = ({} = input);

			const {
				text: { source: { language = undefined } = {} } = {},
			} = ({} = input as any); // language is only required for specific interpret types

			const comprehend = new Comprehend({
				credentials,
				region,
			});

			const doAll = interpretType === InterpretTextCategories.ALL;

			let languagePromise: Promise<string>;
			if (doAll || interpretType === InterpretTextCategories.LANGUAGE) {
				const languageDetectionParams = {
					Text: text,
				};
				languagePromise = this.detectLanguage(
					languageDetectionParams,
					comprehend
				);
			}

			let entitiesPromise: Promise<Array<TextEntities>>;
			if (doAll || interpretType === InterpretTextCategories.ENTITIES) {
				const LanguageCode = language || (await languagePromise);
				if (!LanguageCode) {
					return rej('language code is required on source for this selection');
				}
				const entitiesDetectionParams = {
					Text: text,
					LanguageCode,
				};
				entitiesPromise = this.detectEntities(
					entitiesDetectionParams,
					comprehend
				);
			}

			let sentimentPromise: Promise<TextSentiment>;
			if (doAll || interpretType === InterpretTextCategories.SENTIMENT) {
				const LanguageCode = language || (await languagePromise);
				if (!LanguageCode) {
					return rej('language code is required on source for this selection');
				}
				const sentimentParams = {
					Text: text,
					LanguageCode,
				};
				sentimentPromise = this.detectSentiment(sentimentParams, comprehend);
			}

			let syntaxPromise: Promise<Array<TextSyntax>>;
			if (doAll || interpretType === InterpretTextCategories.SYNTAX) {
				const LanguageCode = language || (await languagePromise);
				if (!LanguageCode) {
					return rej('language code is required on source for this selection');
				}
				const syntaxParams = {
					Text: text,
					LanguageCode,
				};
				syntaxPromise = this.detectSyntax(syntaxParams, comprehend);
			}

			let keyPhrasesPromise: Promise<Array<KeyPhrases>>;
			if (doAll || interpretType === InterpretTextCategories.KEY_PHRASES) {
				const LanguageCode = language || (await languagePromise);
				if (!LanguageCode) {
					return rej('language code is required on source for this selection');
				}
				const keyPhrasesParams = {
					Text: text,
					LanguageCode,
				};
				keyPhrasesPromise = this.detectKeyPhrases(keyPhrasesParams, comprehend);
			}
			try {
				const results = await Promise.all([
					languagePromise,
					entitiesPromise,
					sentimentPromise,
					syntaxPromise,
					keyPhrasesPromise,
				]);
				res({
					textInterpretation: {
						keyPhrases: results[4] || [],
						language: results[0] || '',
						sentiment: results[2],
						syntax: results[3] || [],
						textEntities: results[1] || [],
					},
				});
			} catch (err) {
				rej(err);
			}
		});
	}

	private detectKeyPhrases(params, comprehend): Promise<Array<KeyPhrases>> {
		return new Promise((res, rej) => {
			comprehend.detectKeyPhrases(params, (err, data) => {
				const { KeyPhrases = [] } = data || {};
				if (err) {
					if (err.code === 'AccessDeniedException') {
						rej(
							'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
								'amplify predictions add'
						);
					} else {
						rej(err.message);
					}
				} else {
					res(
						KeyPhrases.map(({ Text: text }) => {
							return { text };
						})
					);
				}
			});
		});
	}

	private detectSyntax(params, comprehend): Promise<Array<TextSyntax>> {
		return new Promise((res, rej) => {
			comprehend.detectSyntax(params, (err, data) => {
				const { SyntaxTokens = [] } = data || {};
				if (err) {
					if (err.code === 'AccessDeniedException') {
						rej(
							'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
								'amplify predictions add'
						);
					} else {
						rej(err.message);
					}
				} else {
					res(this.serializeSyntaxFromComprehend(SyntaxTokens));
				}
			});
		});
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

	private detectSentiment(params, comprehend): Promise<TextSentiment> {
		return new Promise((res, rej) => {
			comprehend.detectSentiment(params, (err, data) => {
				if (err) {
					if (err.code === 'AccessDeniedException') {
						rej(
							'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
								'amplify predictions add'
						);
					} else {
						rej(err.message);
					}
				} else {
					const {
						Sentiment: predominant = '',
						SentimentScore: {
							Positive: positive = 0,
							Negative: negative = 0,
							Neutral: neutral = 0,
							Mixed: mixed = 0,
						} = {},
					} = ({} = data);
					res({ predominant, positive, negative, neutral, mixed });
				}
			});
		});
	}

	private detectEntities(params, comprehend): Promise<Array<TextEntities>> {
		return new Promise((res, rej) => {
			comprehend.detectEntities(params, (err, data) => {
				const { Entities = [] } = data || {};
				if (err) {
					if (err.code === 'AccessDeniedException') {
						rej(
							'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
								'amplify predictions add'
						);
					} else {
						rej(err.message);
					}
				} else {
					res(this.serializeEntitiesFromComprehend(Entities));
				}
			});
		});
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

	private detectLanguage(params, comprehend): Promise<string> {
		return new Promise((res, rej) => {
			comprehend.detectDominantLanguage(params, (err, data) => {
				if (err) {
					if (err.code === 'AccessDeniedException') {
						rej(
							'Not authorized, did you enable Interpret Text on predictions category Amplify CLI? try: ' +
								'amplify predictions add'
						);
					} else {
						rej(err.message);
					}
				} else {
					const { Languages: [{ LanguageCode }] = [''] } = ({} = data || {});
					if (!LanguageCode) {
						rej('Language not detected');
					}
					res(data.Languages[0].LanguageCode);
				}
			});
		});
	}
}
