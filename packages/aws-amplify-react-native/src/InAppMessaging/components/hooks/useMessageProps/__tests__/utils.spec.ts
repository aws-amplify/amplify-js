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

import { PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native';
import { InAppMessageTextAlign } from '@aws-amplify/notifications';

import { BUTTON_PRESSED_OPACITY } from '../../../constants';
import { InAppMessageComponentBaseProps, InAppMessageComponentBaseStyle } from '../../../types';
import { StyleParams } from '../types';

import { getButtonComponentStyle, getContainerAndWrapperStyle, getMessageStyle, getMessageStyleProps } from '../utils';

type ResolveContainerStyle = { container: (state?: PressableStateCallbackType) => StyleProp<ViewStyle> };

const EMPTY_STYLE = Object.freeze({});

describe('getButtonComponentStyle', () => {
	const pressedOpacity = { opacity: BUTTON_PRESSED_OPACITY };

	it('returns the expected output in the happy path', () => {
		const buttonDefaultStyle = { buttonContainer: { backgroundColor: 'white' }, buttonText: { color: 'red' } };
		const buttonMessageStyle = { backgroundColor: 'maroon', borderRadius: 4, color: 'teal' };
		const buttonOverrideStyle = { container: { backgroundColor: 'pink' }, text: { color: 'black' } };

		const expectedContainerPressedStyle = [
			pressedOpacity,
			{ backgroundColor: 'white' },
			{ backgroundColor: 'maroon', borderRadius: 4 },
			{ backgroundColor: 'pink' },
		];
		const expectedContainerUnpressedStyle = [
			EMPTY_STYLE,
			{ backgroundColor: 'white' },
			{ backgroundColor: 'maroon', borderRadius: 4 },
			{ backgroundColor: 'pink' },
		];

		const expectedTextStyle = [{ color: 'red' }, { color: 'teal' }, { color: 'black' }];

		const output = getButtonComponentStyle(buttonDefaultStyle, buttonMessageStyle, buttonOverrideStyle);

		const containerPressedStyle = (output as ResolveContainerStyle).container({ pressed: true });
		const containerUnpressedStyle = (output as ResolveContainerStyle).container({ pressed: false });

		expect(containerPressedStyle).toEqual(expectedContainerPressedStyle);
		expect(containerUnpressedStyle).toEqual(expectedContainerUnpressedStyle);

		expect(output.text).toEqual(expectedTextStyle);
	});

	it.each([{}, null])('correctly handles a value of %s passed as buttonMessageStyle', (buttonMessageStyle) => {
		const buttonDefaultStyle = { buttonContainer: { backgroundColor: 'white' }, buttonText: { color: 'red' } };

		const output = getButtonComponentStyle(buttonDefaultStyle, buttonMessageStyle, null);

		const buttonContainerStyle = (output as ResolveContainerStyle).container({ pressed: true });

		expect(buttonContainerStyle).toEqual([pressedOpacity, { backgroundColor: 'white' }, EMPTY_STYLE, EMPTY_STYLE]);
		expect(output.text).toEqual([{ color: 'red' }, EMPTY_STYLE, EMPTY_STYLE]);
	});

	describe('button container style', () => {
		it('returns unpressed button container style when press event is not provided', () => {
			const buttonDefaultStyle = { buttonContainer: { backgroundColor: 'white' }, buttonText: {} };

			const output = getButtonComponentStyle(buttonDefaultStyle, EMPTY_STYLE, EMPTY_STYLE);

			const buttonContainerStyle = (output as ResolveContainerStyle).container();

			const expectedButtonContainerStyle = [EMPTY_STYLE, { backgroundColor: 'white' }, EMPTY_STYLE, EMPTY_STYLE];

			expect(buttonContainerStyle).toEqual(expectedButtonContainerStyle);
		});

		it('correctly evaluates button container override style when it is a function', () => {
			const pressedStyle = { backgroundColor: 'seafoam' };
			const unpressedStyle = { backgroundColor: 'fuschia' };
			const buttonOverrideStyle = { container: ({ pressed }) => (pressed ? pressedStyle : unpressedStyle) };

			const output = getButtonComponentStyle(null, null, buttonOverrideStyle);

			const containerPressedStyle = (output as ResolveContainerStyle).container({ pressed: true });
			const containerUnpressedStyle = (output as ResolveContainerStyle).container({ pressed: false });

			const expectedContainerPressedStyle = [pressedOpacity, EMPTY_STYLE, EMPTY_STYLE, pressedStyle];
			const expectedContainerUnressedStyle = [EMPTY_STYLE, EMPTY_STYLE, EMPTY_STYLE, unpressedStyle];

			expect(containerPressedStyle).toEqual(expectedContainerPressedStyle);
			expect(containerUnpressedStyle).toEqual(expectedContainerUnressedStyle);
		});
	});
});

describe('getContainerAndWrapperStyle', () => {
	it('returns the expected output for a banner component in the happy path', () => {
		const defaultStyle = {
			container: { backgroundColor: 'red' },
			componentWrapper: { opacity: 0.4 },
		} as InAppMessageComponentBaseStyle;
		const messageStyle = { container: { backgroundColor: 'teal' } };
		const overrideStyle = { container: { backgroundColor: 'pink' } };

		const output = getContainerAndWrapperStyle({
			layout: 'TOP_BANNER',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		const expectedContainerStyle = [
			{ backgroundColor: 'red' },
			{ backgroundColor: 'teal' },
			{ backgroundColor: 'pink' },
		];

		const expectedWrapperStyle = { opacity: 0.4 };

		expect(output.container).toEqual(expectedContainerStyle);
		expect(output.componentWrapper).toEqual(expectedWrapperStyle);
	});

	it('returns the expected output for a non-banner component in the happy path', () => {
		const defaultStyle = {
			container: { backgroundColor: 'red' },
			componentWrapper: { opacity: 0.4 },
		} as InAppMessageComponentBaseStyle;
		const messageStyle = { container: { backgroundColor: 'teal' } };
		const overrideStyle = { container: { backgroundColor: 'pink' } };

		const output = getContainerAndWrapperStyle({
			layout: 'CAROUSEL',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		const expectedContainerStyle = [{}, {}, {}];

		const expectedWrapperStyle = [
			{ opacity: 0.4 },
			{ backgroundColor: 'red' },
			{ backgroundColor: 'teal' },
			{ backgroundColor: 'pink' },
		];

		expect(output.container).toEqual(expectedContainerStyle);
		expect(output.componentWrapper).toEqual(expectedWrapperStyle);
	});

	it('correctly handles a style array passed as the argument of overrideStyle.container', () => {
		const defaultStyle = {
			container: { backgroundColor: 'red' },
			componentWrapper: { opacity: 0.4 },
		} as InAppMessageComponentBaseStyle;
		const messageStyle = { container: { backgroundColor: 'teal' } };
		const overrideStyle = { container: [{ backgroundColor: 'pink' }, { flex: 5 }] };

		const output = getContainerAndWrapperStyle({
			layout: 'CAROUSEL',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		const expectedContainerStyle = [EMPTY_STYLE, EMPTY_STYLE, { flex: 5 }];

		const expectedWrapperStyle = [
			{ opacity: 0.4 },
			{ backgroundColor: 'red' },
			{ backgroundColor: 'teal' },
			{ backgroundColor: 'pink' },
		];

		expect(output.container).toEqual(expectedContainerStyle);
		expect(output.componentWrapper).toEqual(expectedWrapperStyle);
	});

	it('returns the expected output for a banner component with null style arguments', () => {
		const defaultStyle: StyleParams['defaultStyle'] = null;
		const messageStyle: StyleParams['messageStyle'] = null;
		const overrideStyle: StyleParams['overrideStyle'] = null;

		const output = getContainerAndWrapperStyle({
			layout: 'BOTTOM_BANNER',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		const expectedContainerStyle = [EMPTY_STYLE, EMPTY_STYLE, EMPTY_STYLE];

		const expectedWrapperStyle = EMPTY_STYLE;

		expect(output.container).toEqual(expectedContainerStyle);
		expect(output.componentWrapper).toEqual(expectedWrapperStyle);
	});

	it('returns the expected output for a non-banner component with empty style arguments', () => {
		const defaultStyle: StyleParams['defaultStyle'] = null;
		const messageStyle: StyleParams['messageStyle'] = null;
		const overrideStyle: StyleParams['overrideStyle'] = null;

		const output = getContainerAndWrapperStyle({
			layout: 'MODAL',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		const expectedContainerStyle = [EMPTY_STYLE, EMPTY_STYLE, EMPTY_STYLE];

		const expectedWrapperStyle = [EMPTY_STYLE, EMPTY_STYLE, EMPTY_STYLE, EMPTY_STYLE];

		expect(output.container).toEqual(expectedContainerStyle);
		expect(output.componentWrapper).toEqual(expectedWrapperStyle);
	});
});

describe('getMessageStyle', () => {
	it('returns the expected output in the happy path', () => {
		const output = getMessageStyle({
			body: { style: { textAlign: 'left' as InAppMessageTextAlign } },
			container: { style: { backgroundColor: 'lightgray', borderRadius: 2 } },
			header: { style: { textAlign: 'center' as InAppMessageTextAlign } },
			primaryButton: { style: { backgroundColor: 'salmon', color: 'olive' } },
			secondaryButton: { style: { backgroundColor: 'sand', color: 'peru' } },
		} as InAppMessageComponentBaseProps);

		expect(output).toMatchSnapshot();
	});

	it('returns the expected output when given empty style values', () => {
		const output = getMessageStyle({
			body: { style: null },
			container: { style: null },
			header: { style: null },
			primaryButton: { style: null },
			secondaryButton: { style: null },
		} as InAppMessageComponentBaseProps);

		expect(output).toMatchSnapshot();
	});
});

describe('getMessageStyleProps', () => {
	it('returns the expected output in the happy path', () => {
		const defaultStyle = {
			body: { color: 'fuschia' },
			buttonContainer: { backgroundColor: 'chartreuse' },
			buttonText: { color: 'pink' },
			buttonsContainer: { backgroundColor: 'teal' },
			componentWrapper: { backgroundColor: 'gray' },
			contentContainer: { backgroundColor: 'lightblue' },
			container: { backgroundColor: 'red', borderRadius: 1 },
			header: { backgroundColor: 'purple' },
			iconButton: { backgroundColor: 'blue' },
			image: { backgroundColor: 'yellow' },
			imageContainer: { backgroundColor: 'green' },
			textContainer: { backgroundColor: 'antiquewhite' },
		};

		const messageStyle: StyleParams['messageStyle'] = {
			body: { textAlign: 'left' as InAppMessageTextAlign },
			container: { backgroundColor: 'lightgray', borderRadius: 2 },
			header: { textAlign: 'center' as InAppMessageTextAlign },
			primaryButton: { backgroundColor: 'salmon', color: 'olive' },
			secondaryButton: { backgroundColor: 'sand', color: 'peru' },
		};

		const overrideStyle = {
			body: { color: 'white' },
			closeIconButton: { backgroundColor: 'turquoise' },
			closeIconColor: 'darkcyan',
			container: { backgroundColor: 'lawngreen', borderRadius: 3 },
			header: { backgroundColor: 'lightpink' },
			image: { backgroundColor: 'royalblue' },
			primaryButton: { container: { backgroundColor: 'seagreen' }, text: { color: 'black' } },
			secondaryButton: { container: { backgroundColor: 'sienna' }, text: { color: 'orchid' } },
		};

		const output = getMessageStyleProps({
			layout: 'FULL_SCREEN',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		expect(output).toMatchSnapshot();
	});

	it('returns the expected output when provided null style params', () => {
		const defaultStyle: StyleParams['defaultStyle'] = null;
		const messageStyle: StyleParams['messageStyle'] = null;
		const overrideStyle: StyleParams['overrideStyle'] = null;

		const output = getMessageStyleProps({
			layout: 'MODAL',
			styleParams: { defaultStyle, messageStyle, overrideStyle },
		});

		expect(output).toMatchSnapshot();
	});
});
