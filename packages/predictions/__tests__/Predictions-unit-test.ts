import { PredictionsOptions, TranslateTextInput } from '../src/types';
import { PredictionsClass } from '../src/Predictions';
import { default as AWSConvertPredictionsProvider } from '../src/Providers/AmazonAIConvertPredictionsProvider';
import { default as AWSIdentifyPredictionsProvider } from '../src/Providers/AmazonAIIdentifyPredictionsProvider';
import { default as AWSInterpretPredictionsProvider } from '../src/Providers/AmazonAIInterpretPredictionsProvider';
import { default as AWSPredictionsProvider } from '../src/Providers/AmazonAIPredictionsProvider';

const options: PredictionsOptions = {
	region: 'region',
};

describe('Predictions test', () => {
	describe('getModuleName tests', () => {
		test('happy and the only case', () => {
			expect(new PredictionsClass(options).getModuleName()).toMatch(
				'Predictions'
			);
		});
	});

	describe('configure tests', () => {
		test('happy case configure all providers after they are added', () => {
			const convertOptions = {
				transcription: {
					region: 'us-west-2',
					proxy: false,
					defaults: {
						language: 'en-US',
					},
				},
				speechGenerator: {
					region: 'us-west-2',
					proxy: false,
					defaults: {
						VoiceId: 'Salli',
						LanguageCode: 'en-US',
					},
				},
			};
			const identifyOptions = {
				identifyText: {
					proxy: false,
					region: 'us-west-2',
					defaults: {
						format: 'ALL',
					},
				},
				identifyEntities: {
					proxy: false,
					region: 'us-west-2',
					celebrityDetectionEnabled: true,
					defaults: {
						collectionId: 'identifyEntities9de51ed0-beta',
						maxEntities: 50,
					},
				},
			};
			const interpretOptions = {
				interpretText: {
					region: 'us-west-2',
					proxy: false,
					defaults: {
						type: 'ALL',
					},
				},
			};
			const configureOptions = {
				predictions: {
					identify: identifyOptions,
					interpret: interpretOptions,
					convert: convertOptions,
				},
			};
			const convertProvider = new AWSConvertPredictionsProvider();
			const convertSpy = jest
				.spyOn(convertProvider, 'configure')
				.mockImplementation(() => {});
			const identifyProvider = new AWSIdentifyPredictionsProvider();
			const identifySpy = jest
				.spyOn(identifyProvider, 'configure')
				.mockImplementation(() => {});
			const topLevelProvider = new AWSPredictionsProvider();
			const topLevelSpy = jest
				.spyOn(topLevelProvider, 'configure')
				.mockImplementation(() => {});
			const predictions = new PredictionsClass(options);
			predictions.addPluggable(convertProvider);
			predictions.addPluggable(identifyProvider);
			predictions.addPluggable(topLevelProvider);

			// Configuring predictions and pluggables after they are all added
			predictions.configure(configureOptions);
			expect(convertSpy).toHaveBeenCalledWith({
				...convertOptions,
				...configureOptions.predictions,
			});
			expect(identifySpy).toHaveBeenCalledWith({
				...identifyOptions,
				...configureOptions.predictions,
			});
			expect(topLevelSpy).toHaveBeenCalledWith(configureOptions.predictions);
		});
	});

	test('happy case configure all providers as they are added', () => {
		const convertOptions = {
			translateText: {
				region: 'us-west-2',
				proxy: false,
				defaults: {
					sourceLanguage: 'es',
					targetLanguage: 'en',
				},
			},
			speechGenerator: {
				name: 'speechPiece',
				region: 'us-west-2',
				proxy: false,
				defaults: {
					VoiceId: 'Matthew',
					LanguageCode: 'en-US',
				},
			},
		};
		const identifyOptions = {
			identifyText: {
				name: 'imageIdentifierPiece',
				region: 'us-west-2',
				cache: false,
			},
		};
		const configureOptions = {
			predictions: {
				convert: convertOptions,
				identify: identifyOptions,
			},
		};

		// configure the predictions category first before adding pluggables
		const predictions = new PredictionsClass(options);
		predictions.configure(configureOptions);

		const convertProvider = new AWSConvertPredictionsProvider();
		const convertSpy = jest
			.spyOn(convertProvider, 'configure')
			.mockImplementation(() => {});
		const identifyProvider = new AWSIdentifyPredictionsProvider();
		const identifySpy = jest
			.spyOn(identifyProvider, 'configure')
			.mockImplementation(() => {});
		const topLevelProvider = new AWSPredictionsProvider();
		const topLevelSpy = jest
			.spyOn(topLevelProvider, 'configure')
			.mockImplementation(() => {});
		predictions.addPluggable(convertProvider);
		predictions.addPluggable(identifyProvider);
		predictions.addPluggable(topLevelProvider);
		expect(convertSpy).toHaveBeenCalledWith({
			...convertOptions,
			...configureOptions.predictions,
		});
		expect(identifySpy).toHaveBeenCalledWith({
			...identifyOptions,
			...configureOptions.predictions,
		});
		expect(topLevelSpy).toHaveBeenCalledWith(configureOptions.predictions);
	});

	describe('addPluggable tests', () => {
		test('multiple pluggable types added', () => {
			const predictions = new PredictionsClass(options);
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
			const predictions = new PredictionsClass(options);
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
			const predictions = new PredictionsClass(options);
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSConvertPredictionsProvider);
		});
		test('happy case identify', () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSIdentifyPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSIdentifyPredictionsProvider);
		});
		test('happy case interpret', () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSInterpretPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSInterpretPredictionsProvider);
		});

		test('happy case top level predictions provider', () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSPredictionsProvider();
			predictions.addPluggable(provider);
			expect(
				predictions.getPluggable(provider.getProviderName())
			).toBeInstanceOf(AWSPredictionsProvider);
		});
		test('error case no provider configured', () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSConvertPredictionsProvider();
			// predictions.addPluggable(provider); // No pluggable is added
			expect(predictions.getPluggable(provider.getProviderName())).toBeNull();
		});
	});

	describe('removePluggable tests', () => {
		test('happy case convert', () => {
			const predictions = new PredictionsClass(options);
			const convertProvider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(convertProvider);
			predictions.removePluggable(convertProvider.getProviderName());
			expect(
				predictions.getPluggable(convertProvider.getProviderName())
			).toBeNull();
		});
		test('happy case identify', () => {
			const predictions = new PredictionsClass(options);
			const identifyProvider = new AWSIdentifyPredictionsProvider();
			predictions.addPluggable(identifyProvider);
			predictions.removePluggable(identifyProvider.getProviderName());
			expect(
				predictions.getPluggable(identifyProvider.getProviderName())
			).toBeNull();
		});
		test('happy case interpret', () => {
			const predictions = new PredictionsClass(options);
			const interpretProvider = new AWSInterpretPredictionsProvider();
			predictions.addPluggable(interpretProvider);
			predictions.removePluggable(interpretProvider.getProviderName());
			expect(
				predictions.getPluggable(interpretProvider.getProviderName())
			).toBeNull();
		});

		test('happy case top level predictions provider', () => {
			const predictions = new PredictionsClass(options);
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
			const predictions = new PredictionsClass(options);
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const convertSpy = jest
				.spyOn(provider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve('translatedText');
				});
			const data = await predictions.convert(input, options);
			expect(data).toEqual('translatedText');
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
		test('happy case with one top level pluggable', async () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const convertSpy = jest
				.spyOn(provider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve('translatedText');
				});
			const data = await predictions.convert(input, options);
			expect(data).toEqual('translatedText');
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
		test('error case with no convert pluggable', () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSIdentifyPredictionsProvider(); // Not the convert provider
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			try {
				predictions.convert(input, options);
			} catch (e) {
				expect(e.message).toMatch(
					'More than one or no providers are configured, ' +
						'Either specify a provider name or configure exactly one provider'
				);
			}
		});
		test('error case with one convert and one top level pluggable and no pluggable name', () => {
			const predictions = new PredictionsClass(options);
			predictions.addPluggable(new AWSPredictionsProvider()); // Top level provider
			predictions.addPluggable(new AWSConvertPredictionsProvider()); // Convert provider
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			try {
				predictions.convert(input, options);
			} catch (e) {
				expect(e.message).toMatch(
					'More than one or no providers are configured, ' +
						'Either specify a provider name or configure exactly one provider'
				);
			}
		});
		test('error case with wrong pluggable name provided', () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			try {
				predictions.convert(input, { providerName: 'WRONG_NAME' });
			} catch (e) {
				expect(e.message).toMatch(
					"Cannot read property 'convert' of undefined"
				);
			}
		});
		test('happy case with pluggable name provided', async () => {
			const predictions = new PredictionsClass(options);
			const provider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(provider);
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const convertSpy = jest
				.spyOn(provider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve('translatedText');
				});
			const data = await predictions.convert(input, {
				providerName: 'AmazonAIConvertPredictionsProvider',
			});
			expect(data).toEqual('translatedText');
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
		test('happy case with one convert and one top level pluggable and pluggable name provided', async () => {
			const predictions = new PredictionsClass(options);
			const topLevelProvider = new AWSPredictionsProvider();
			const convertProvider = new AWSConvertPredictionsProvider();
			predictions.addPluggable(topLevelProvider); // Top level provider
			predictions.addPluggable(convertProvider); // Convert provider
			const input: TranslateTextInput = {
				translateText: { source: { text: 'sourceText' } },
			};
			const convertSpy = jest
				.spyOn(convertProvider, 'convert')
				.mockImplementation(() => {
					return Promise.resolve('translatedText');
				});
			const data = await predictions.convert(input, {
				providerName: 'AmazonAIConvertPredictionsProvider',
			});
			expect(data).toEqual('translatedText');
			expect(convertSpy).toHaveBeenCalledTimes(1);
		});
	});
});
