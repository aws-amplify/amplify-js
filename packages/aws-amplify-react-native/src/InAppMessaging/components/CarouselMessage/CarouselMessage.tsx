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

import React from 'react';

import { Carousel } from '../../ui';

import { useMessageProps } from '../hooks';
import MessageWrapper from '../MessageWrapper';

import CarouselItem from './CarouselItem';
import { getStyles } from './styles';
import { CarouselMessageProps } from './types';

export default function CarouselMessage(props: CarouselMessageProps) {
	const { data, ...rest } = props;
	const { styles } = useMessageProps(props, getStyles);

	const renderItem = ({ item }) => <CarouselItem {...item} {...rest} />;

	return (
		<MessageWrapper disableSafeAreaView>
			<Carousel
				data={data}
				renderItem={renderItem}
				indicatorActiveStyle={styles.pageIndicator.active}
				indicatorInactiveStyle={styles.pageIndicator.inactive}
			/>
		</MessageWrapper>
	);
}
