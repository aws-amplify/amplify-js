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

import { useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';

import useMessageImage from '../useMessageImage';
import useMessageOnDisplay from '../useMessageOnDisplay';
import { InAppMessageComponentProps } from '../useMessage';

import { getMessageStyle, getMessageStyleProps } from './utils';
import { GetDefaultStyle, UseMessageProps } from './types';

/**
 * Handle common message UI component prop logic including setting of image dimensions,
 * render booleans, and style resolving
 *
 * @param {props} object - message UI component props
 * @param {getDefaultStyle} function - returns default UI component style
 
* @returns {UseMessageProps} common message UI component render related booleans and styles
 */

export default function useMessageProps(
	props: InAppMessageComponentProps,
	getDefaultStyle: GetDefaultStyle
): UseMessageProps {
	const { image, layout, onDisplay, primaryButton, secondaryButton } = props;

	useMessageOnDisplay(onDisplay);

	const { imageDimensions, imageFetching, renderImage } = useMessageImage(image, layout);

	const renderMessage = !imageFetching;

	const renderPrimaryButton = !isEmpty(primaryButton);
	const renderSecondaryButton = !isEmpty(secondaryButton);
	const renderButtons = renderPrimaryButton || renderSecondaryButton;

	const styles = useMemo(() => {
		// prevent generating style if message rendering is delayed
		if (!renderMessage) {
			return null;
		}

		const defaultStyle = getDefaultStyle(imageDimensions);
		const messageStyle = getMessageStyle(props);
		const overrideStyle = props.style;

		return getMessageStyleProps({ styleParams: { defaultStyle, messageStyle, overrideStyle }, layout });
	}, [getDefaultStyle, layout, imageDimensions, props, renderMessage]);

	return {
		renderButtons,
		renderImage,
		renderMessage,
		renderPrimaryButton,
		renderSecondaryButton,
		styles,
	};
}
