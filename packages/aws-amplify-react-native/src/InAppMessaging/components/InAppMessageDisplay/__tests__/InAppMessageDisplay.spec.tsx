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
import { Text, View } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { useMessage } from '../../hooks';
import InAppMessageDisplay from '../InAppMessageDisplay';

jest.mock('../../hooks');

const mockUseMessage = useMessage as jest.Mock;

describe('InAppMessageDisplay', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders the expected component in the happy path', () => {
		const Component = ({ layout }) => (
			<View>
				<Text>{layout}</Text>
			</View>
		);
		const props = { layout: 'TEST_COMPONENT' };

		mockUseMessage.mockReturnValueOnce({ Component, props });

		const inAppMessageDisplay = TestRenderer.create(<InAppMessageDisplay />);

		expect(inAppMessageDisplay.toJSON()).toMatchSnapshot();
	});

	it('is null when useMessage returns a null value for Component', () => {
		mockUseMessage.mockReturnValueOnce({ Component: null, props: {} });

		const inAppMessageDisplay = TestRenderer.create(<InAppMessageDisplay />);

		expect(inAppMessageDisplay.toJSON()).toBeNull();
	});
});
