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

import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarouselPageIndicatorProps } from './types';
import { DEFAULT_CAROUSEL_INDICATOR_ACTIVE_STYLE, DEFAULT_CAROUSEL_INDICATOR_INACTIVE_STYLE } from './constants';

export default function CarouselPageIndicator({
	activeStyle,
	currentIndex,
	inactiveStyle,
	numberOfItems,
	style,
}: CarouselPageIndicatorProps) {
	const items = useMemo(
		() =>
			new Array(numberOfItems ?? 0)
				.fill(null)
				.map((_, index) =>
					(currentIndex ?? 0) === index ? (
						<View style={[DEFAULT_CAROUSEL_INDICATOR_ACTIVE_STYLE, activeStyle]} key={`indicator-item-${index}`} />
					) : (
						<View style={[DEFAULT_CAROUSEL_INDICATOR_INACTIVE_STYLE, inactiveStyle]} key={`indicator-item-${index}`} />
					)
				),
		[activeStyle, currentIndex, inactiveStyle, numberOfItems]
	);

	return <SafeAreaView style={style}>{items}</SafeAreaView>;
}
