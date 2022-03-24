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
import TestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import MessageWrapper from '../MessageWrapper';

jest.mock('react-native-safe-area-context', () => ({
	SafeAreaProvider: 'SafeAreaProvider',
	SafeAreaView: 'SafeAreaView',
}));

const Children = () => <Text>Children</Text>;

describe('MessageWrapper', () => {
	it('renders as expected', () => {
		const renderer = TestRenderer.create(
			<MessageWrapper>
				<Children />
			</MessageWrapper>
		);

		expect(renderer.toJSON()).toMatchSnapshot();
	});
});
