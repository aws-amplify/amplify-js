// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum PredictionsValidationErrorCode {
	CelebrityDetectionNotEnabled = 'CelebrityDetectionNotEnabled',
	InvalidInput = 'InvalidInput',
	InvalidSource = 'InvalidSource',
	NoCredentials = 'NoCredentials',
	NoLanguage = 'NoLanguage',
	NoRegion = 'NoRegion',
	NoSource = 'NoSource',
	NoSourceLanguage = 'NoSourceLanguage',
	NoTargetLanguage = 'NoTargetLanguage',
	NoVoiceId = 'NoVoiceId',
}

export const validationErrorMap: AmplifyErrorMap<PredictionsValidationErrorCode> =
	{
		[PredictionsValidationErrorCode.CelebrityDetectionNotEnabled]: {
			message: 'Celebrity Detection must be enabled.',
		},
		[PredictionsValidationErrorCode.InvalidInput]: {
			message: 'Input does not conform to expected type.',
		},
		[PredictionsValidationErrorCode.InvalidSource]: {
			message: 'Source type not supported.',
		},
		[PredictionsValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[PredictionsValidationErrorCode.NoLanguage]: {
			message: 'Missing language.',
		},
		[PredictionsValidationErrorCode.NoRegion]: {
			message: 'Missing region.',
		},
		[PredictionsValidationErrorCode.NoSource]: {
			message: 'Missing source.',
		},
		[PredictionsValidationErrorCode.NoSourceLanguage]: {
			message: 'Missing source language for translation.',
		},
		[PredictionsValidationErrorCode.NoTargetLanguage]: {
			message: 'Missing target language for translation.',
		},
		[PredictionsValidationErrorCode.NoVoiceId]: {
			message: 'Missing voice id.',
		},
	};
