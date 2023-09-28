// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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

export type PredictionsConfig = {
	convert?: ConvertConfig;
	identify?: IdentifyConfig;
	interpret?: InterpretConfig;
};
