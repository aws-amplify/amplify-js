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

import React from 'react';
import { Modal, SafeAreaView } from 'react-native';

import { styles } from './styles';
import { MessageWrapperProps } from './types';

export default function MessageWrapper({ children, style }: MessageWrapperProps) {
	return (
		<Modal transparent visible>
			<SafeAreaView style={[styles.messageWrapper, style]}>{children}</SafeAreaView>
		</Modal>
	);
}
