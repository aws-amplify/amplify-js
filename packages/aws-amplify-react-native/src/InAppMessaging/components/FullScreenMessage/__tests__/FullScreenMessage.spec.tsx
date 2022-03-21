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

import useMessageImage from '../../hooks/useMessageImage';
import { INITIAL_IMAGE_DIMENSIONS } from '../../hooks/useMessageImage/constants';

import FullScreenMessage from '../FullScreenMessage';

jest.mock('../../hooks/useMessageImage');
jest.mock('../../MessageWrapper', () => 'MessageWrapper');
jest.mock('../FullScreenContent', () => 'FullScreenContent');

const baseProps = { layout: 'FULL_SCREEN' as const };

const mockUseMessageImage = useMessageImage as jest.Mock;

describe('FullScreenMessage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders as expected', () => {
		mockUseMessageImage.mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: INITIAL_IMAGE_DIMENSIONS,
			isImageFetching: false,
		});

		const renderer = TestRenderer.create(<FullScreenMessage {...baseProps} />);

		expect(renderer.toJSON()).toMatchSnapshot();
	});
});
