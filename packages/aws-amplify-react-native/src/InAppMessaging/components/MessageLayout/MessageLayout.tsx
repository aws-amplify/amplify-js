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

import LandscapeLayout from './LandscapeLayout';
import PortraitLayout from './PortraitLayout';
import { LayoutProps } from './types';

/**
 * Message UI content helper component:
 *
 * - LandscapeLayout is used for all BannerMessage variants regardless of device orientation,
 * and with ModalMessage, CarouselMessage, and FullScreenMessage components when in 'landscape' mode
 *
 * - PortraitLayout is used for ModalMessage, CarouselMessage, and FullScreenMessage components when
 * in 'portrait' mode
 */
export default function MessageLayout({ orientation, ...props }: LayoutProps) {
	return orientation === 'portrait' ? <PortraitLayout {...props} /> : <LandscapeLayout {...props} />;
}
