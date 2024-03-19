// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmazonAIConvertPredictionsProvider,
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
} from './providers';
import {
	IdentifyEntitiesInput,
	IdentifyEntitiesOutput,
	IdentifyLabelsInput,
	IdentifyLabelsOutput,
	IdentifyTextInput,
	IdentifyTextOutput,
	InterpretTextInput,
	InterpretTextOutput,
	SpeechToTextInput,
	SpeechToTextOutput,
	TextToSpeechInput,
	TextToSpeechOutput,
	TranslateTextInput,
	TranslateTextOutput,
} from './types';

export class PredictionsClass {
	private convertProvider = new AmazonAIConvertPredictionsProvider();
	private identifyProvider = new AmazonAIIdentifyPredictionsProvider();
	private interpretProvider = new AmazonAIInterpretPredictionsProvider();

	public getModuleName() {
		return 'Predictions';
	}

	public interpret(input: InterpretTextInput): Promise<InterpretTextOutput> {
		return this.interpretProvider.interpret(input);
	}

	public convert(input: TranslateTextInput): Promise<TranslateTextOutput>;
	public convert(input: TextToSpeechInput): Promise<TextToSpeechOutput>;
	public convert(input: SpeechToTextInput): Promise<SpeechToTextOutput>;
	public convert(
		input: TranslateTextInput | TextToSpeechInput | SpeechToTextInput,
	): Promise<TranslateTextOutput | TextToSpeechOutput | SpeechToTextOutput> {
		return this.convertProvider.convert(input);
	}

	public identify(input: IdentifyTextInput): Promise<IdentifyTextOutput>;
	public identify(input: IdentifyLabelsInput): Promise<IdentifyLabelsOutput>;
	public identify(
		input: IdentifyEntitiesInput,
	): Promise<IdentifyEntitiesOutput>;

	public identify(
		input: IdentifyTextInput | IdentifyLabelsInput | IdentifyEntitiesInput,
	): Promise<
		IdentifyTextOutput | IdentifyLabelsOutput | IdentifyEntitiesOutput
	> {
		return this.identifyProvider.identify(input);
	}
}

export const Predictions = new PredictionsClass();
