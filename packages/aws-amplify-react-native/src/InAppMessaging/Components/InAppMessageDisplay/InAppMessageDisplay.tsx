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

import React, { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';

import { useInAppMessage } from '../..';
/*
 *
 */

export default function InAppMessageDisplay() {
	const { Component, props } = useInAppMessage();

	const hasInAppMessage = !!(Component || !isEmpty(props));
	const { id } = props;

	useEffect(() => {
		if (hasInAppMessage) {
			// TODO: add display notify handler when available
			console.log(`display InAppMessage: ${id}`);
		}
	}, [hasInAppMessage, id]);

	if (!hasInAppMessage) {
		return null;
	}

	return <Component {...props} />;
}
