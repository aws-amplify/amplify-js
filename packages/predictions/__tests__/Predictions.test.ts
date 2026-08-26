import { PredictionsClass } from '../src/Predictions';
import {
	AmazonAIConvertPredictionsProvider,
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
} from '../src/providers';
import {
	IdentifyTextInput,
	IdentifyTextOutput,
	InterpretTextInput,
	InterpretTextOutput,
	TranslateTextInput,
	TranslateTextOutput,
} from '../src/types';

import { createMockAmplifyContext } from './testUtils';

describe('Predictions test', () => {
	describe('getModuleName tests', () => {
		test('happy and the only case', () => {
			expect(new PredictionsClass().getModuleName()).toMatch('Predictions');
		});
	});

	describe('global-ctx fallback (no explicit ctx)', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});
		test('convert test', async () => {
			const predictions = new PredictionsClass();
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const result: TranslateTextOutput = {
				text: 'translatedText',
				language: 'en',
			};
			const convertSpy = jest
				.spyOn(AmazonAIConvertPredictionsProvider.prototype, 'convert')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.convert(input);
			expect(data).toEqual(result);
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});

		test('identify test', async () => {
			const predictions = new PredictionsClass();
			const input: IdentifyTextInput = {
				text: { source: { key: 'key' }, format: 'PLAIN' },
			};
			const result: IdentifyTextOutput = {
				text: {
					fullText: 'Hello world',
					lines: ['Hello world'],
					linesDetailed: [{ text: 'Hello world' }],
					words: [{ text: 'Hello' }, { text: 'world' }],
				},
			};
			const identifySpy = jest
				.spyOn(AmazonAIIdentifyPredictionsProvider.prototype, 'identify')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.identify(input);
			expect(data).toEqual(result);
			expect(identifySpy).toHaveBeenCalledTimes(1);
		});

		test('interpret test', async () => {
			const predictions = new PredictionsClass();
			const input: InterpretTextInput = {
				text: {
					source: {
						text: 'Test text',
					},
					type: 'language',
				},
			};
			const result: InterpretTextOutput = {
				textInterpretation: { language: 'en-US' },
			};
			const interpretSpy = jest
				.spyOn(AmazonAIInterpretPredictionsProvider.prototype, 'interpret')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.interpret(input);
			expect(data).toEqual(result);
			expect(interpretSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('explicit-ctx construction', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		test('all three providers receive the same ctx instance', () => {
			const ctx = createMockAmplifyContext();

			const predictions = new PredictionsClass(ctx);

			// Access the private providers and verify each received the exact same ctx (identity check)
			type ProviderWithCtx = { _explicitCtx: unknown };
			const convertProvider = (predictions as unknown as { convertProvider: ProviderWithCtx }).convertProvider;
			const identifyProvider = (predictions as unknown as { identifyProvider: ProviderWithCtx }).identifyProvider;
			const interpretProvider = (predictions as unknown as { interpretProvider: ProviderWithCtx }).interpretProvider;

			expect(convertProvider._explicitCtx).toBe(ctx);
			expect(identifyProvider._explicitCtx).toBe(ctx);
			expect(interpretProvider._explicitCtx).toBe(ctx);
		});

		test('convert delegates to the convert provider', async () => {
			const ctx = createMockAmplifyContext();
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const result: TranslateTextOutput = {
				text: 'translatedText',
				language: 'en',
			};
			const convertSpy = jest
				.spyOn(AmazonAIConvertPredictionsProvider.prototype, 'convert')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const predictions = new PredictionsClass(ctx);
			const data = await predictions.convert(input);
			expect(data).toEqual(result);
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});

		test('identify delegates to the identify provider', async () => {
			const ctx = createMockAmplifyContext();
			const input: IdentifyTextInput = {
				text: { source: { key: 'key' }, format: 'PLAIN' },
			};
			const result: IdentifyTextOutput = {
				text: {
					fullText: 'Hello world',
					lines: ['Hello world'],
					linesDetailed: [{ text: 'Hello world' }],
					words: [{ text: 'Hello' }, { text: 'world' }],
				},
			};
			const identifySpy = jest
				.spyOn(AmazonAIIdentifyPredictionsProvider.prototype, 'identify')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const predictions = new PredictionsClass(ctx);
			const data = await predictions.identify(input);
			expect(data).toEqual(result);
			expect(identifySpy).toHaveBeenCalledTimes(1);
		});

		test('interpret delegates to the interpret provider', async () => {
			const ctx = createMockAmplifyContext();
			const input: InterpretTextInput = {
				text: {
					source: {
						text: 'Test text',
					},
					type: 'language',
				},
			};
			const result: InterpretTextOutput = {
				textInterpretation: { language: 'en-US' },
			};
			const interpretSpy = jest
				.spyOn(AmazonAIInterpretPredictionsProvider.prototype, 'interpret')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const predictions = new PredictionsClass(ctx);
			const data = await predictions.interpret(input);
			expect(data).toEqual(result);
			expect(interpretSpy).toHaveBeenCalledTimes(1);
		});
	});
});
