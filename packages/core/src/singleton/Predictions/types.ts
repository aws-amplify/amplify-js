// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

// Defaults for ConvertConfig
interface SpeechGeneratorDefaults {
	voiceId?: string;
}
interface TranscriptionDefaults {
	language?: string;
}
interface TranslateTextDefaults {
	sourceLanguage?: string;
	targetLanguage?: string;
}

// Defaults for IdentifyConfig
interface IdentifyEntitiesDefaults {
	collectionId?: string;
	maxEntities?: number;
}
interface IdentityLabelsDefaults {
	type?: string;
}
interface IdentifyTextDefaults {
	format?: string;
}

// Defaults for InterpretConfig
interface InterpretTextDefaults {
	type?: string;
}

interface ConvertConfig {
	speechGenerator?: PredictionsProviderConfig<SpeechGeneratorDefaults>;
	transcription?: PredictionsProviderConfig<TranscriptionDefaults>;
	translateText?: PredictionsProviderConfig<TranslateTextDefaults>;
}

interface IdentifyConfig {
	identifyEntities?: PredictionsProviderConfig<IdentifyEntitiesDefaults> & {
		celebrityDetectionEnabled?: boolean;
	};
	identifyLabels?: PredictionsProviderConfig<IdentityLabelsDefaults>;
	identifyText?: PredictionsProviderConfig<IdentifyTextDefaults>;
}

interface InterpretConfig {
	interpretText?: PredictionsProviderConfig<InterpretTextDefaults>;
}

export interface PredictionsProviderConfig<T> {
	region?: string;
	proxy?: boolean;
	defaults?: T;
}

export interface PredictionsConvertConfig {
	convert: ConvertConfig;
}
export interface PredictionsIdentifyConfig {
	identify: IdentifyConfig;
}
export interface PredictionsInterpretConfig {
	interpret: InterpretConfig;
}

export type PredictionsConfig = AtLeastOne<
	PredictionsConvertConfig &
		PredictionsIdentifyConfig &
		PredictionsInterpretConfig
>;
