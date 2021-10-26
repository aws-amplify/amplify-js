import { Credentials } from '@aws-amplify/core';
import {
	ComprehendClient,
	DetectSyntaxCommand,
	DetectEntitiesCommand,
	DetectDominantLanguageCommand,
	DetectKeyPhrasesCommand,
	DetectSentimentCommand,
} from '@aws-sdk/client-comprehend';

ComprehendClient.prototype.send = jest.fn((command, callback) => {
	if (command instanceof DetectEntitiesCommand) {
		const resultDetectEntities = {
			Entities: [
				{
					BeginOffset: 22,
					EndOffset: 29,
					Score: 0.9780097603797913,
					Text: 'William',
					Type: 'PERSON',
				},
			],
		};
		return Promise.resolve(resultDetectEntities);
	} else if (command instanceof DetectDominantLanguageCommand) {
		const resultDominantLanguage = {
			Languages: [{ LanguageCode: 'en-US' }],
		};
		return Promise.resolve(resultDominantLanguage);
	} else if (command instanceof DetectSentimentCommand) {
		const resultDetectSentiment = {
			Sentiment: 'NEUTRAL',
			SentimentScore: {
				Mixed: 0.0065774936228990555,
				Negative: 0.03728577867150307,
				Neutral: 0.8279294967651367,
				Positive: 0.1282072812318802,
			},
		};
		return Promise.resolve(resultDetectSentiment);
	} else if (command instanceof DetectSyntaxCommand) {
		const resultSyntax = {
			SyntaxTokens: [
				{
					BeginOffset: 0,
					EndOffset: 4,
					PartOfSpeech: { Score: 0.9982878565788269, Tag: 'INTJ' },
					Text: 'Well',
					TokenId: 1,
				},
				{
					BeginOffset: 5,
					EndOffset: 9,
					PartOfSpeech: { Score: 0.9992488026618958, Tag: 'PRON' },
					Text: 'this',
					TokenId: 2,
				},
				{
					BeginOffset: 10,
					EndOffset: 12,
					PartOfSpeech: { Score: 0.9981074333190918, Tag: 'VERB' },
					Text: 'is',
					TokenId: 3,
				},
				{
					BeginOffset: 13,
					EndOffset: 16,
					PartOfSpeech: { Score: 0.9999936819076538, Tag: 'DET' },
					Text: 'the',
					TokenId: 4,
				},
				{
					BeginOffset: 17,
					EndOffset: 20,
					PartOfSpeech: { Score: 0.9993390440940857, Tag: 'NOUN' },
					Text: 'end',
					TokenId: 5,
				},
				{
					BeginOffset: 20,
					EndOffset: 21,
					PartOfSpeech: { Score: 0.9999994039535522, Tag: 'PUNCT' },
					Text: ',',
					TokenId: 6,
				},
				{
					BeginOffset: 22,
					EndOffset: 29,
					PartOfSpeech: { Score: 0.9975669384002686, Tag: 'PROPN' },
					Text: 'William',
					TokenId: 7,
				},
				{
					BeginOffset: 30,
					EndOffset: 34,
					PartOfSpeech: { Score: 0.9923363327980042, Tag: 'PRON' },
					Text: 'what',
					TokenId: 8,
				},
				{
					BeginOffset: 35,
					EndOffset: 37,
					PartOfSpeech: { Score: 0.9964040517807007, Tag: 'AUX' },
					Text: 'do',
					TokenId: 9,
				},
				{
					BeginOffset: 38,
					EndOffset: 41,
					PartOfSpeech: { Score: 0.999998927116394, Tag: 'PRON' },
					Text: 'you',
					TokenId: 10,
				},
				{
					BeginOffset: 42,
					EndOffset: 47,
					PartOfSpeech: { Score: 0.9999972581863403, Tag: 'VERB' },
					Text: 'think',
					TokenId: 11,
				},
				{
					BeginOffset: 48,
					EndOffset: 53,
					PartOfSpeech: { Score: 0.9784705638885498, Tag: 'ADP' },
					Text: 'about',
					TokenId: 12,
				},
				{
					BeginOffset: 54,
					EndOffset: 60,
					PartOfSpeech: { Score: 0.9995352029800415, Tag: 'ADJ' },
					Text: 'global',
					TokenId: 13,
				},
				{
					BeginOffset: 61,
					EndOffset: 68,
					PartOfSpeech: { Score: 0.9905871748924255, Tag: 'NOUN' },
					Text: 'warming',
					TokenId: 14,
				},
				{
					BeginOffset: 68,
					EndOffset: 69,
					PartOfSpeech: { Score: 0.9999977350234985, Tag: 'PUNCT' },
					Text: '?',
					TokenId: 15,
				},
			],
		};
		return Promise.resolve(resultSyntax);
	} else if (command instanceof DetectKeyPhrasesCommand) {
		const resultKeyPhrases = {
			KeyPhrases: [
				{
					BeginOffset: 13,
					EndOffset: 20,
					Score: 0.9969043135643005,
					Text: 'the end',
				},
				{
					BeginOffset: 22,
					EndOffset: 29,
					Score: 0.9268588423728943,
					Text: 'William',
				},
				{
					BeginOffset: 54,
					EndOffset: 68,
					Score: 0.9987823963165283,
					Text: 'global warming',
				},
			],
		};
		return Promise.resolve(resultKeyPhrases);
	}
}) as any;

// Mocks before importing provider to avoid race condition with provider instantiation
import { AmazonAIInterpretPredictionsProvider } from '../../src/Providers';
import { InterpretTextCategories } from '../../src';

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

jest.spyOn(Credentials, 'get').mockImplementation(() => {
	return Promise.resolve(credentials);
});

const textToTest =
	'Well this is the end, William what do you think about global warming?';

describe('Predictions interpret provider test', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('interpretText tests', () => {
		const happyConfig = {
			interpretText: {
				region: 'us-west-2',
				proxy: false,
				defaults: {
					languageCode: 'en-US',
					type: 'ALL',
				},
			},
		};

		test('happy case credentials exist detectEntities', async () => {
			const predictionsProvider = new AmazonAIInterpretPredictionsProvider();
			predictionsProvider.configure(happyConfig);

			const detectEntitiesSpy = jest.spyOn(ComprehendClient.prototype, 'send');
			expect.assertions(2);

			await expect(
				predictionsProvider.interpret({
					text: {
						source: {
							text: textToTest,
							language: 'en-US',
						},
						type: InterpretTextCategories.ENTITIES,
					},
				})
			).resolves.toMatchObject({
				textInterpretation: {
					textEntities: [{ text: 'William', type: 'PERSON' }],
				},
			});

			const sdkParams = {
				LanguageCode: 'en-US',
				Text: textToTest,
			};

			expect(detectEntitiesSpy.mock.calls[0][0].input).toEqual(sdkParams);
		});

		test('happy case credentials exists detectDominantLanguage', async () => {
			const predictionsProvider = new AmazonAIInterpretPredictionsProvider();
			predictionsProvider.configure(happyConfig);

			const dominantLanguageSpy = jest.spyOn(
				ComprehendClient.prototype,
				'send'
			);

			expect.assertions(2);

			await expect(
				predictionsProvider.interpret({
					text: {
						source: {
							text: textToTest,
						},
						type: InterpretTextCategories.LANGUAGE,
					},
				})
			).resolves.toMatchObject({
				textInterpretation: {
					language: 'en-US',
				},
			});

			const sdkParams = {
				Text: textToTest,
			};

			expect(dominantLanguageSpy.mock.calls[0][0].input).toEqual(sdkParams);
		});

		test('happy case credentials exists detect sentiment', async () => {
			const predictionsProvider = new AmazonAIInterpretPredictionsProvider();
			predictionsProvider.configure(happyConfig);

			const sentimentSpy = jest.spyOn(ComprehendClient.prototype, 'send');

			expect.assertions(2);

			await expect(
				predictionsProvider.interpret({
					text: {
						source: {
							text: textToTest,
							language: 'en-US',
						},
						type: InterpretTextCategories.SENTIMENT,
					},
				})
			).resolves.toMatchObject({
				textInterpretation: {
					sentiment: {
						mixed: 0.0065774936228990555,
						negative: 0.03728577867150307,
						neutral: 0.8279294967651367,
						positive: 0.1282072812318802,
						predominant: 'NEUTRAL',
					},
				},
			});

			const sdkParams = {
				LanguageCode: 'en-US',
				Text: textToTest,
			};

			expect(sentimentSpy.mock.calls[0][0].input).toEqual(sdkParams);
		});

		test('happy case credentials exists detect syntax', async () => {
			const predictionsProvider = new AmazonAIInterpretPredictionsProvider();
			predictionsProvider.configure(happyConfig);

			const syntaxSpy = jest.spyOn(ComprehendClient.prototype, 'send');

			expect.assertions(2);

			await expect(
				predictionsProvider.interpret({
					text: {
						source: {
							text: textToTest,
							language: 'en-US',
						},
						type: InterpretTextCategories.SYNTAX,
					},
				})
			).resolves.toMatchObject({
				textInterpretation: {
					syntax: [
						{ syntax: 'INTJ', text: 'Well' },
						{ syntax: 'PRON', text: 'this' },
						{ syntax: 'VERB', text: 'is' },
						{ syntax: 'DET', text: 'the' },
						{ syntax: 'NOUN', text: 'end' },
						{ syntax: 'PUNCT', text: ',' },
						{ syntax: 'PROPN', text: 'William' },
						{ syntax: 'PRON', text: 'what' },
						{ syntax: 'AUX', text: 'do' },
						{ syntax: 'PRON', text: 'you' },
						{ syntax: 'VERB', text: 'think' },
						{ syntax: 'ADP', text: 'about' },
						{ syntax: 'ADJ', text: 'global' },
						{ syntax: 'NOUN', text: 'warming' },
						{ syntax: 'PUNCT', text: '?' },
					],
				},
			});

			const sdkParams = {
				LanguageCode: 'en-US',
				Text: textToTest,
			};

			expect(syntaxSpy.mock.calls[0][0].input).toEqual(sdkParams);
		});

		test('happy case credentials exists detect key phrases', async () => {
			const predictionsProvider = new AmazonAIInterpretPredictionsProvider();
			predictionsProvider.configure(happyConfig);

			const keyPhrasesSpy = jest.spyOn(ComprehendClient.prototype, 'send');

			expect.assertions(2);

			await expect(
				predictionsProvider.interpret({
					text: {
						source: {
							text: textToTest,
							language: 'en-US',
						},
						type: InterpretTextCategories.KEY_PHRASES,
					},
				})
			).resolves.toMatchObject({
				textInterpretation: {
					keyPhrases: [
						{ text: 'the end' },
						{ text: 'William' },
						{ text: 'global warming' },
					],
				},
			});

			const sdkParams = {
				LanguageCode: 'en-US',
				Text: textToTest,
			};

			expect(keyPhrasesSpy.mock.calls[0][0].input).toEqual(sdkParams);
		});

		test("happy case credentials type: 'ALL'", async () => {
			const predictionsProvider = new AmazonAIInterpretPredictionsProvider();
			predictionsProvider.configure(happyConfig);
			await expect(
				predictionsProvider.interpret({
					text: {
						source: {
							text: textToTest,
						},
						type: InterpretTextCategories.ALL,
					},
				})
			).resolves.toMatchObject({
				textInterpretation: {
					keyPhrases: [
						{ text: 'the end' },
						{ text: 'William' },
						{ text: 'global warming' },
					],
					language: 'en-US',
					sentiment: {
						mixed: 0.0065774936228990555,
						negative: 0.03728577867150307,
						neutral: 0.8279294967651367,
						positive: 0.1282072812318802,
						predominant: 'NEUTRAL',
					},
					syntax: [
						{ syntax: 'INTJ', text: 'Well' },
						{ syntax: 'PRON', text: 'this' },
						{ syntax: 'VERB', text: 'is' },
						{ syntax: 'DET', text: 'the' },
						{ syntax: 'NOUN', text: 'end' },
						{ syntax: 'PUNCT', text: ',' },
						{ syntax: 'PROPN', text: 'William' },
						{ syntax: 'PRON', text: 'what' },
						{ syntax: 'AUX', text: 'do' },
						{ syntax: 'PRON', text: 'you' },
						{ syntax: 'VERB', text: 'think' },
						{ syntax: 'ADP', text: 'about' },
						{ syntax: 'ADJ', text: 'global' },
						{ syntax: 'NOUN', text: 'warming' },
						{ syntax: 'PUNCT', text: '?' },
					],
					textEntities: [{ text: 'William', type: 'PERSON' }],
				},
			});

			const keyPhrasesSpy = jest.spyOn(ComprehendClient.prototype, 'send');
			const syntaxSpy = jest.spyOn(ComprehendClient.prototype, 'send');
			const sentimentSpy = jest.spyOn(ComprehendClient.prototype, 'send');
			const dominantLanguageSpy = jest.spyOn(
				ComprehendClient.prototype,
				'send'
			);
			const detectEntitiesSpy = jest.spyOn(ComprehendClient.prototype, 'send');

			expect.assertions(6);

			const sdkParams = {
				LanguageCode: 'en-US',
				Text: textToTest,
			};

			expect(keyPhrasesSpy.mock.calls[4][0].input).toEqual(sdkParams);
			expect(syntaxSpy.mock.calls[3][0].input).toEqual(sdkParams);
			expect(sentimentSpy.mock.calls[2][0].input).toEqual(sdkParams);
			expect(detectEntitiesSpy.mock.calls[1][0].input).toEqual(sdkParams);
			expect(dominantLanguageSpy.mock.calls[0][0].input).toEqual({
				Text: textToTest,
			});
		});
	});
});
