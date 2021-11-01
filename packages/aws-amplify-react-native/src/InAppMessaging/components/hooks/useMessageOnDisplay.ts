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

import { useEffect, useRef } from 'react';

/**
 * Utility hook used for invoking onDisplay in message components
 *
 * @param onDisplay - function to be invoked on message display
 * @param shouldDisplay - boolean indicating whether message should display, defaults to true
 */

export default function useMessageOnDisplay(onDisplay: () => void) {
	const hasDisplayed = useRef(false);
	useEffect(() => {
		if (!hasDisplayed.current) {
			onDisplay();
			hasDisplayed.current = true;
		}
	}, [onDisplay]);
}
