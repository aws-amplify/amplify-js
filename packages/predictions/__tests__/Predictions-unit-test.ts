import { AWS, ClientDevice, Parser, ConsoleLogger as Logger, Credentials } from '@aws-amplify/core';
import { PredictionsOptions, TranslateTextInput, } from '../src/types';
import { default as Predictions } from "../src/Predictions";
import { default as AWSConvertPredictionsProvider } from '../src/Providers/AmazonAIConvertPredictionsProvider';
import { default as AWSIdentifyPredictionsProvider } from '../src/Providers/AmazonAIIdentifyPredictionsProvider';
import { Translate } from 'aws-sdk';
const options: PredictionsOptions = {
    region: 'region'
};

describe("Predictions test", () => {

    describe('addPluggable tests', () => {
        test('multiple pluggable types added', () => {
            const predictions = new Predictions(options);
            const convertProvider = new AWSConvertPredictionsProvider();
            const identifyProvider = new AWSIdentifyPredictionsProvider();
            predictions.addPluggable(convertProvider);
            predictions.addPluggable(identifyProvider);
            expect(predictions.getPluggable(convertProvider.getProviderName())).toBeInstanceOf(AWSConvertPredictionsProvider);
            expect(predictions.getPluggable(identifyProvider.getProviderName())).toBeInstanceOf(AWSIdentifyPredictionsProvider);
        });
    });

    describe('getPluggable tests', () => {
        test('happy case', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            predictions.addPluggable(provider);
            expect(predictions.getPluggable(provider.getProviderName())).toBeInstanceOf(AWSConvertPredictionsProvider);
        });
        test('no provider configured', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            // predictions.addPluggable(provider); // No pluggable is added
            expect(predictions.getPluggable(provider.getProviderName())).toBeNull();
        });
    });

    describe('removePluggable tests', () => {
        test('happy case', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            predictions.addPluggable(provider);
            predictions.removePluggable(provider.getProviderName());
            expect(predictions.getPluggable(provider.getProviderName())).toBeNull();
        });
    });

    describe('convert tests', () => {
        test('happy case convert test with one convert pluggable', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            predictions.addPluggable(provider);
            const input: TranslateTextInput = { translateText: { source: { text: "sourceText" }, providerOptions: {} } };
            const translateTextSpy = jest.spyOn(provider, 'translateText').mockImplementation(() => { return Promise.resolve("translatedText"); });
            return predictions.convert(input).then(data => {
                expect(data).toEqual("translatedText");
                expect(translateTextSpy).toHaveBeenCalledTimes(1);
            });
        });
        test('error case convert test with no convert pluggable', () => {
            const predictions = new Predictions(options);
            const provider = new AWSIdentifyPredictionsProvider(); // Not the convert provider
            predictions.addPluggable(provider);
            const input: TranslateTextInput = { translateText: { source: { text: "sourceText" }, providerOptions: {} } };
            try {
                predictions.convert(input);
            } catch (e) {
                expect(e.message).toMatch('More than one or no providers are configured, Either specify a provider name or configure exactly one provider');
            }
        });
        test('error case convert test with multiple convert pluggable', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            predictions.addPluggable(provider);
            predictions.addPluggable(provider); // Convert provider provided twice
            const input: TranslateTextInput = { translateText: { source: { text: "sourceText" }, providerOptions: {} } };
            try {
                predictions.convert(input);
            } catch (e) {
                expect(e.message).toMatch('More than one or no providers are configured, Either specify a provider name or configure exactly one provider');
            }
        });
        test('error case convert test with wrong pluggable name provided', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            predictions.addPluggable(provider);
            const input: TranslateTextInput = { translateText: { source: { text: "sourceText" }, providerOptions: { providerName: "WRONG_NAME" } } };
            try {
                predictions.convert(input);
            } catch (e) {
                expect(e.message).toMatch("Cannot read property 'translateText' of null");
            }
        });
        test('happy case convert test with pluggable name provided', () => {
            const predictions = new Predictions(options);
            const provider = new AWSConvertPredictionsProvider();
            predictions.addPluggable(provider);
            const input: TranslateTextInput = { translateText: { source: { text: "sourceText" }, providerOptions: { providerName: "AmazonAIConvertPredictionsProvider" } } };
            const translateTextSpy = jest.spyOn(provider, 'translateText').mockImplementation(() => { return Promise.resolve("translatedText"); });
            return predictions.convert(input).then(data => {
                expect(data).toEqual("translatedText");
                expect(translateTextSpy).toHaveBeenCalledTimes(1);
            });
        });
    });
});
