// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

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

type ConvertInput = TranslateTextInput | TextToSpeechInput | SpeechToTextInput;
type ConvertOutput =
	| TranslateTextOutput
	| TextToSpeechOutput
	| SpeechToTextOutput;
type IdentifyInput =
	| IdentifyTextInput
	| IdentifyLabelsInput
	| IdentifyEntitiesInput;
type IdentifyOutput =
	| IdentifyTextOutput
	| IdentifyLabelsOutput
	| IdentifyEntitiesOutput;

export class PredictionsClass {
	private ctx: AmplifyContext;

	private convertProvider: AmazonAIConvertPredictionsProvider;
	private identifyProvider: AmazonAIIdentifyPredictionsProvider;
	private interpretProvider: AmazonAIInterpretPredictionsProvider;

	constructor(ctx: AmplifyContext) {
		this.ctx = ctx;
		this.convertProvider = new AmazonAIConvertPredictionsProvider(ctx);
		this.identifyProvider = new AmazonAIIdentifyPredictionsProvider(ctx);
		this.interpretProvider = new AmazonAIInterpretPredictionsProvider(ctx);
	}

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

	// --- Static methods for v6 compatibility ---

	static convert(input: TranslateTextInput): Promise<TranslateTextOutput>;
	static convert(input: TextToSpeechInput): Promise<TextToSpeechOutput>;
	static convert(input: SpeechToTextInput): Promise<SpeechToTextOutput>;
	static convert(
		ctx: AmplifyContext,
		input: TranslateTextInput,
	): Promise<TranslateTextOutput>;

	static convert(
		ctx: AmplifyContext,
		input: TextToSpeechInput,
	): Promise<TextToSpeechOutput>;

	static convert(
		ctx: AmplifyContext,
		input: SpeechToTextInput,
	): Promise<SpeechToTextOutput>;

	static convert(...args: any[]): Promise<ConvertOutput> {
		const [ctx, input] = resolveCtxArgs<ConvertInput>(args);

		return new PredictionsClass(ctx).convert(input as any);
	}

	static identify(input: IdentifyTextInput): Promise<IdentifyTextOutput>;
	static identify(input: IdentifyLabelsInput): Promise<IdentifyLabelsOutput>;
	static identify(
		input: IdentifyEntitiesInput,
	): Promise<IdentifyEntitiesOutput>;

	static identify(
		ctx: AmplifyContext,
		input: IdentifyTextInput,
	): Promise<IdentifyTextOutput>;

	static identify(
		ctx: AmplifyContext,
		input: IdentifyLabelsInput,
	): Promise<IdentifyLabelsOutput>;

	static identify(
		ctx: AmplifyContext,
		input: IdentifyEntitiesInput,
	): Promise<IdentifyEntitiesOutput>;

	static identify(...args: any[]): Promise<IdentifyOutput> {
		const [ctx, input] = resolveCtxArgs<IdentifyInput>(args);

		return new PredictionsClass(ctx).identify(input as any);
	}

	static interpret(input: InterpretTextInput): Promise<InterpretTextOutput>;
	static interpret(
		ctx: AmplifyContext,
		input: InterpretTextInput,
	): Promise<InterpretTextOutput>;

	static interpret(...args: any[]): Promise<InterpretTextOutput> {
		const [ctx, input] = resolveCtxArgs<InterpretTextInput>(args);

		return new PredictionsClass(ctx).interpret(input);
	}
}

export const createPredictions = (ctx: AmplifyContext) =>
	new PredictionsClass(ctx);
