// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type ConvertConfig = {
	speechGenerator?: {
		region: string;
		proxy: boolean;
		defaults: { VoiceId: string };
	};
	translateText?: {
		region?: string;
		proxy?: boolean;
		defaults?: {
			sourceLanguage?: string;
			targetLanguage?: string;
		};
	};
};

type IdentifyConfig = {
	identifyEntities?: {
		region?: string;
		proxy?: boolean;
		celebrityDetectionEnabled?: boolean;
		defaults?: {
			collectionId?: string;
			maxEntities?: number;
		};
	};
};

type InterpretConfig = {
	interpretText?: {
		region?: string;
		proxy?: boolean;
		defaults?: {
			type?: string;
		};
	};
};

export type PredictionsConfig = {
	convert?: ConvertConfig;
	identify?: IdentifyConfig;
	interpret?: InterpretConfig;
};
