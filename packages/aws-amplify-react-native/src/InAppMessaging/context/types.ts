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

import { ReactNode, ReactElement } from 'react';
import { InAppMessage } from '@aws-amplify/notifications';

import {
	BannerMessageProps,
	CarouselMessageProps,
	FullScreenMessageProps,
	ModalMessageProps,
	InAppMessageComponentStyles,
} from '../components';

export type InAppMessageComponents = {
	BannerMessage?: (props: BannerMessageProps) => ReactElement;
	CarouselMessage?: (props: CarouselMessageProps) => ReactElement;
	FullScreenMessage?: (props: FullScreenMessageProps) => ReactElement;
	ModalMessage?: (props: ModalMessageProps) => ReactElement;
};

export type InAppMessagingContextType = {
	clearInAppMessage: () => void;
	components: InAppMessageComponents;
	displayInAppMessage: (inAppMessage: InAppMessage) => void;
	inAppMessage: InAppMessage;
	style: InAppMessageComponentStyles;
};

export type InAppMessagingProviderProps = {
	children: ReactNode;
	components?: InAppMessageComponents;
	style?: InAppMessageComponentStyles;
};
