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
import { Modal, ModalPropsIOS } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';
import { MessageWrapperProps } from './types';

const SUPPORTED_ORIENTATIONS: ModalPropsIOS['supportedOrientations'] = [
	'portrait',
	'portrait-upside-down',
	'landscape',
	'landscape-left',
	'landscape-right',
];

export default function MessageWrapper({ children, disableSafeAreaView, style }: MessageWrapperProps) {
	return (
		<Modal transparent visible supportedOrientations={SUPPORTED_ORIENTATIONS}>
			<SafeAreaProvider>
				{disableSafeAreaView ? (
					children
				) : (
					<SafeAreaView style={[styles.messageWrapper, style]}>{children}</SafeAreaView>
				)}
			</SafeAreaProvider>
		</Modal>
	);
}
