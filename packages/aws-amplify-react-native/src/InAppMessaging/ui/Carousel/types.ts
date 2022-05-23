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
import { ListRenderItem, StyleProp, ViewStyle } from 'react-native';

export interface CarouselProps<T> {
	data: ReadonlyArray<T>;
	indicatorActiveStyle?: StyleProp<ViewStyle>;
	indicatorInactiveStyle?: StyleProp<ViewStyle>;
	onClose?: () => void;
	renderItem: ListRenderItem<T>;
	style?: StyleProp<ViewStyle>;
}

export interface CarouselPageIndicatorProps {
	activeStyle?: StyleProp<ViewStyle>;
	currentIndex: number;
	inactiveStyle?: StyleProp<ViewStyle>;
	numberOfItems: number;
	style?: StyleProp<ViewStyle>;
}

export interface CarouselStyles {
	indicator: ViewStyle;
}
