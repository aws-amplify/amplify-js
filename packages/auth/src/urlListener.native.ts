/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { ConsoleLogger as Logger } from '@aws-amplify/core';
const logger = new Logger('urlListener');
import { Linking, AppState } from 'react-native';

let handler;

export default async callback => {
	if (handler) {
		return;
	}
	let linkingSubscription;
	let appStateEventSubscription;
	handler =
		handler ||
		(({ url, ...rest }: { url: string }) => {
			logger.debug('urlListener', { url, ...rest });
			callback({ url });
		});

	linkingSubscription?.remove?.();
	linkingSubscription = Linking.addEventListener('url', handler);

	appStateEventSubscription?.remove?.();
	appStateEventSubscription = AppState.addEventListener(
		'change',
		async newAppState => {
			if (newAppState === 'active') {
				const initialUrl = await Linking.getInitialURL();
				handler({ url: initialUrl });
			}
		}
	);

	return () => {
		linkingSubscription?.remove?.();
		appStateEventSubscription?.remove?.();
	};
};
