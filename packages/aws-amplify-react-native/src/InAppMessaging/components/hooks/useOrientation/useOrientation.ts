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

import { useEffect, useState } from 'react';
import { Dimensions, EventSubscription } from 'react-native';

type Orientation = 'portrait' | 'landscape';
const getOrientation = (): Orientation => {
	const { height, width } = Dimensions.get('screen');
	return height >= width ? 'portrait' : 'landscape';
};

export default function useOrientation(): Orientation {
	const [orientation, setOrientation] = useState<Orientation>(getOrientation);

	useEffect(() => {
		const handler = () => {
			setOrientation(getOrientation);
		};

		// The below cast and conditional unsubscribe handling is due to subscription removal variation
		// between `Dimensions.addEventListener` in React Native prior to and after v0.65.
		//
		// Beginning with v0.65, `Dimensions.addEventListener` returns an `EventSubscription` object,
		// which includes a `remove` method for removing the subscription. Prior versions return
		// `undefined`, and subscription removal is handled by `Dimensions.removeEventListener`,
		// which is deprecated in v0.65
		const subscription = Dimensions.addEventListener('change', handler) as unknown as EventSubscription;

		return () => {
			if (subscription) {
				subscription.remove();
			} else {
				Dimensions.removeEventListener('change', handler);
			}
		};
	}, []);

	return orientation;
}
