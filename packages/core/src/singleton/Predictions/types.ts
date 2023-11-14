// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

// Defaults for ConvertConfig
type SpeechGeneratorDefaults = {
	voiceId?: string;
};
type TranscriptionDefaults = {
	language?: string;
};
type TranslateTextDefaults = {
	sourceLanguage?: string;
	targetLanguage?: string;
};

// Defaults for IdentifyConfig
type IdentifyEntitiesDefaults = {
	collectionId?: string;
	maxEntities?: number;
};
type IdentityLabelsDefaults = {
	type?: string;
};
type IdentifyTextDefaults = {
	format?: string;
};

// Defaults for InterpretConfig
type InterpretTextDefaults = {
	type?: string;
};

type ConvertConfig = {
	speechGenerator?: PredictionsProviderConfig<SpeechGeneratorDefaults>;
	transcription?: PredictionsProviderConfig<TranscriptionDefaults>;
	translateText?: PredictionsProviderConfig<TranslateTextDefaults>;
};

type IdentifyConfig = {
	identifyEntities?: PredictionsProviderConfig<IdentifyEntitiesDefaults> & {
		celebrityDetectionEnabled?: boolean;
	};
	identifyLabels?: PredictionsProviderConfig<IdentityLabelsDefaults>;
	identifyText?: PredictionsProviderConfig<IdentifyTextDefaults>;
};

type InterpretConfig = {
	interpretText?: PredictionsProviderConfig<InterpretTextDefaults>;
};

export type PredictionsProviderConfig<T> = {
	region?: string;
	proxy?: boolean;
	defaults?: T;
};

export type PredictionsConvertConfig = {
	convert: ConvertConfig;
};
export type PredictionsIdentifyConfig = {
	identify: IdentifyConfig;
};
export type PredictionsInterpretConfig = {
	interpret: InterpretConfig;
};

export type PredictionsConfig = AtLeastOne<
	PredictionsConvertConfig &
		PredictionsIdentifyConfig &
		PredictionsInterpretConfig
>;
