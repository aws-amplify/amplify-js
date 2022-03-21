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
import { useMessageProps } from '../hooks';
import MessageWrapper from '../MessageWrapper';

import FullScreenContent from './FullScreenContent';
import { getStyles } from './styles';
import { FullScreenMessageProps } from './types';

export default function FullScreenMessage(props: FullScreenMessageProps) {
	const { styles } = useMessageProps(props, getStyles);

	return (
		<MessageWrapper style={styles.componentWrapper}>
			<FullScreenContent {...props} />
		</MessageWrapper>
	);
}
