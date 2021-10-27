/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Image } from 'react-native';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import { ImageLoadingState } from './types';

const logger = new Logger('Notifications.InAppMessaging');

export const prefetchNetworkImage = async (url: string): Promise<ImageLoadingState> => {
	try {
		const loaded = await Image.prefetch(url);
		if (loaded) {
			return 'loaded';
		}

		logger.error(`Image failed to load: ${url}`);
		return 'failed';
	} catch (e) {
		logger.error(`Image.prefetch failed: ${url}`);
		return 'failed';
	}
};
