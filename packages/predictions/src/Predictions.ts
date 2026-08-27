// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';
import { assertOptionalCtxArg } from '@aws-amplify/core/internals/utils';

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

/**
 * Facade class that delegates predictions operations to sub-providers.
 *
 * Exported publicly (alongside the default `Predictions` singleton) so consumers
 * can construct an instance with an explicit `AmplifyContext` — enabling
 * per-request context injection in server-side / multi-tenant scenarios.
 */
export class PredictionsClass {
	private convertProvider: AmazonAIConvertPredictionsProvider;
	private identifyProvider: AmazonAIIdentifyPredictionsProvider;
	private interpretProvider: AmazonAIInterpretPredictionsProvider;

	constructor(ctx?: AmplifyContext) {
		// Reject a defined-but-unbranded value passed in the context position
		// with a typed error before resolving the (optional) explicit context.
		assertOptionalCtxArg(ctx);

		const resolvedCtx = isAmplifyContext(ctx) ? ctx : undefined;
		this.convertProvider = new AmazonAIConvertPredictionsProvider(resolvedCtx);
		this.identifyProvider = new AmazonAIIdentifyPredictionsProvider(
			resolvedCtx,
		);
		this.interpretProvider = new AmazonAIInterpretPredictionsProvider(
			resolvedCtx,
		);
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
}

export const Predictions = new PredictionsClass();
