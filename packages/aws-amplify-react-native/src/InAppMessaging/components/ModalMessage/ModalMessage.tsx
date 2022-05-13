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
import { useDeviceOrientation, useMessageProps } from '../hooks';
import { MessageLayout } from '../MessageLayout';
import MessageWrapper from '../MessageWrapper';

import { getLandscapeStyles, getPortraitStyles } from './styles';
import { ModalMessageProps } from './types';

export default function ModalMessage(props: ModalMessageProps) {
	const { deviceOrientation, isPortraitMode } = useDeviceOrientation();
	const messageProps = useMessageProps(
		props,
		isPortraitMode ? getPortraitStyles : getLandscapeStyles,
		deviceOrientation
	);
	const { shouldRenderMessage, styles } = messageProps;

	if (!shouldRenderMessage) {
		return null;
	}

	return (
		<MessageWrapper style={styles.componentWrapper}>
			<MessageLayout {...props} {...messageProps} orientation={deviceOrientation} />
		</MessageWrapper>
	);
}
