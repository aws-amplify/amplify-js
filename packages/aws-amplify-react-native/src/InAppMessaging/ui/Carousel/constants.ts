/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { ViewStyle } from 'react-native';

export const DEFAULT_CAROUSEL_COLOR_ACTIVE = '#a1a1a1';
export const DEFAULT_CAROUSEL_COLOR_INACTIVE = '#d8d8d8';

export const DEFAULT_CAROUSEL_INDICATOR_SIZE = 12;

const DEFAULT_CAROUSEL_INDICATOR_STYLE: ViewStyle = {
	borderRadius: DEFAULT_CAROUSEL_INDICATOR_SIZE / 2,
	height: DEFAULT_CAROUSEL_INDICATOR_SIZE,
	margin: DEFAULT_CAROUSEL_INDICATOR_SIZE / 3,
	width: DEFAULT_CAROUSEL_INDICATOR_SIZE,
};

export const DEFAULT_CAROUSEL_INDICATOR_ACTIVE_STYLE: ViewStyle = {
	...DEFAULT_CAROUSEL_INDICATOR_STYLE,
	backgroundColor: DEFAULT_CAROUSEL_COLOR_ACTIVE,
};

export const DEFAULT_CAROUSEL_INDICATOR_INACTIVE_STYLE: ViewStyle = {
	...DEFAULT_CAROUSEL_INDICATOR_STYLE,
	backgroundColor: DEFAULT_CAROUSEL_COLOR_INACTIVE,
};

export const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };
