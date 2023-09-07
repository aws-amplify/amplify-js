import { TranslateTextInput, TranslateTextOutput } from '../src/types';
import { PredictionsClass } from '../src/Predictions';
import { AmazonAIConvertPredictionsProvider as AWSConvertPredictionsProvider } from '../src/Providers/AmazonAIConvertPredictionsProvider';
import { AmazonAIIdentifyPredictionsProvider as AWSIdentifyPredictionsProvider } from '../src/Providers/AmazonAIIdentifyPredictionsProvider';
import { AmazonAIInterpretPredictionsProvider as AWSInterpretPredictionsProvider } from '../src/Providers/AmazonAIInterpretPredictionsProvider';
import { AmazonAIPredictionsProvider as AWSPredictionsProvider } from '../src/Providers/AmazonAIPredictionsProvider';

describe('Predictions test', () => {
	describe('getModuleName tests', () => {
		test('happy and the only case', () => {
			expect(new PredictionsClass().getModuleName()).toMatch('Predictions');
		});
	});

	describe('addPluggable tests', () => {
		test('multiple pluggable types added', () => {
			const predictions = new PredictionsClass();
			const convertProvider = new AWSConvertPredictionsProvider();
			const identifyProvider = new AWSIdentifyPredictionsProvider();
			predictions.addPluggable(convertProvider);
			predictions.addPluggable(identifyProvider);
			expect(
				predictions.getPluggable(convertProvider.getProviderName())
			).toBeInstanceOf(AWSConvertPredictionsProvider);
			expect(
				predictions.getPluggable(identifyProvider.getProviderName())
			).toBeInstanceOf(AWSIdentifyPredictionsProvider);
		});

		test('error case with multiple pluggables of same name', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			try {
				predictions.addPluggable(provider); // Convert provider provided twice
			} catch (e) {
				expect(e.message).toMatch(
					'Pluggable with name AmazonAIConvertPredictionsProvider has already been added'
				);
			}
		});
	});

	describe('getPluggable tests', () => {
		test('happy case convert', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSConvertPredictionsProvider);
		});
		test('happy case identify', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSIdentifyPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSIdentifyPredictionsProvider);
		});
		test('happy case interpret', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSInterpretPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSInterpretPredictionsProvider);
		});

		test('happy case top level predictions provider', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSPredictionsProvider);
		});
		test('error case no provider configured', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSConvertPredictionsProvider();
			// predictions.addPluggable(provider); // No pluggable is added
			expect(predictions.getPluggable(provider.getProviderName())).toBeNull();
		});
	});

	describe('removePluggable tests', () => {
		test('happy case convert', () => {
			const predictions = new PredictionsClass();
			const convertProvider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(convertProvider);
			predictions.removePluggable(convertProvider.getProviderName());
			expect(
				predictions.getPluggable(convertProvider.getProviderName())
			).toBeNull();
		});
		test('happy case identify', () => {
			const predictions = new PredictionsClass();
			const identifyProvider = new AWSIdentifyPredictionsProvider();
			predictions.addPluggable(identifyProvider);
			predictions.removePluggable(identifyProvider.getProviderName());
			expect(
				predictions.getPluggable(identifyProvider.getProviderName())
			).toBeNull();
		});
		test('happy case interpret', () => {
			const predictions = new PredictionsClass();
			const interpretProvider = new AWSInterpretPredictionsProvider();
			predictions.addPluggable(interpretProvider);
			predictions.removePluggable(interpretProvider.getProviderName());
			expect(
				predictions.getPluggable(interpretProvider.getProviderName())
			).toBeNull();
		});

		test('happy case top level predictions provider', () => {
			const predictions = new PredictionsClass();
			const topLevelProvider = new AWSPredictionsProvider();
			predictions.addPluggable(topLevelProvider);
			predictions.removePluggable(topLevelProvider.getProviderName());
			expect(
				predictions.getPluggable(topLevelProvider.getProviderName())
			).toBeNull();
		});
	});

	describe('convert tests', () => {
		test('happy case with one convert pluggable', async () => {
			const predictions = new PredictionsClass();
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const result: TranslateTextOutput = {
				text: 'translatedText',
				language: 'en',
			};
			const convertSpy = jest
				.spyOn(provider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.convert(input, {});
			expect(data).toEqual(result);
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
		test('happy case with one top level pluggable', async () => {
			const predictions = new PredictionsClass();
			const provider = new AWSPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const result: TranslateTextOutput = {
				text: 'translatedText',
				language: 'en',
			};
			const convertSpy = jest
				.spyOn(provider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.convert(input, {});
			expect(data).toEqual(result);
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
		test('error case with no convert pluggable', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSIdentifyPredictionsProvider(); // Not the convert provider
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			try {
				predictions.convert(input, {});
			} catch (e) {
				expect(e.message).toMatch(
					'More than one or no providers are configured, ' +
						'Either specify a provider name or configure exactly one provider'
				);
			}
		});
		test('error case with one convert and one top level pluggable and no pluggable name', () => {
			const predictions = new PredictionsClass();
			predictions.addPluggable(new AWSPredictionsProvider()); // Top level provider
			predictions.addPluggable(new AWSConvertPredictionsProvider()); // Convert provider
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			try {
				predictions.convert(input, {});
			} catch (e) {
				expect(e.message).toMatch(
					'More than one or no providers are configured, ' +
						'Either specify a provider name or configure exactly one provider'
				);
			}
		});
		test('error case with wrong pluggable name provided', () => {
			const predictions = new PredictionsClass();
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			try {
				predictions.convert(input, { providerName: 'WRONG_NAME' });
			} catch (e) {
				expect(e.message).toMatch(/(Cannot read prop).+(convert)/);
			}
		});
		test('happy case with pluggable name provided', async () => {
			const predictions = new PredictionsClass();
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const result: TranslateTextOutput = {
				text: 'translatedText',
				language: 'en',
			};
			const convertSpy = jest
				.spyOn(provider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.convert(input, {
				providerName: 'AmazonAIConvertPredictionsProvider',
			});
			expect(data).toEqual(result);
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
		test('happy case with one convert and one top level pluggable and pluggable name provided', async () => {
			const predictions = new PredictionsClass();
			const topLevelProvider = new AWSPredictionsProvider();
			const convertProvider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(topLevelProvider); // Top level provider
			predictions.addPluggable(convertProvider); // Convert provider
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const result: TranslateTextOutput = {
				text: 'translatedText',
				language: 'en',
			};
			const convertSpy = jest
				.spyOn(convertProvider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve(result);
				});
			const data = await predictions.convert(input, {
				providerName: 'AmazonAIConvertPredictionsProvider',
			});
			expect(data).toEqual(result);
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
	});
});
