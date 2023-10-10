import {
	IdentifyTextInput,
	IdentifyTextOutput,
	InterpretTextCategories,
	InterpretTextInput,
	InterpretTextOutput,
	TranslateTextInput,
	TranslateTextOutput,
} from '../src/types';
import { PredictionsClass } from '../src/Predictions';
import { AmazonAIConvertPredictionsProvider } from '../src/Providers/AmazonAIConvertPredictionsProvider';
import {
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
} from '../src/Providers';

describe('Predictions test', () => {
	describe('getModuleName tests', () => {
		test('happy and the only case', () => {
			expect(new PredictionsClass().getModuleName()).toMatch('Predictions');
		});
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
				type: InterpretTextCategories.LANGUAGE,
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
