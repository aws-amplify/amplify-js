// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'react-native-get-random-values';
import { Predictions } from './Predictions';

import {
	AmazonAIConvertPredictionsProvider,
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
} from './Providers';

export * from './types';

export {
	Predictions,
	AmazonAIIdentifyPredictionsProvider,
	AmazonAIConvertPredictionsProvider,
	AmazonAIPredictionsProvider,
	AmazonAIInterpretPredictionsProvider,
};
