/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import * as React from 'react';

import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import { PhotoPickerButton } from '../Amplify-UI/Amplify-UI-Components-React';

const PickerInput = {
	width: '100%',
	height: '100%',
	display: 'inline-block',
	position: 'absolute',
	left: 0,
	top: 0,
	opacity: 0,
	cursor: 'pointer',
};

const logger = new Logger('Picker');

export interface IPickerProps {
	accept?: string;
	onPick?: (data: any) => void;
	title?: string;
	theme?: any;
}

export class Picker extends React.Component<IPickerProps, {}> {
	handleInput(e) {
		const that = this;

		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const { name, size, type } = file;
		logger.debug(file);

		const { onPick } = this.props;
		if (onPick) {
			onPick({
				file,
				name,
				size,
				type,
			});
		}
	}

	render() {
		const title = this.props.title || 'Pick a File';
		const accept = this.props.accept || '*/*';

		const theme = this.props.theme || AmplifyTheme;
		const pickerStyle = Object.assign(
			{},
			{ position: 'relative' },
			theme.pickerPicker
		);
		const inputStyle = Object.assign({}, PickerInput, theme.pickerInput);

		return (
			<div style={pickerStyle}>
				<PhotoPickerButton theme={theme}>{I18n.get(title)}</PhotoPickerButton>
				<input
					title={I18n.get(title)}
					type="file"
					accept={accept}
					style={inputStyle}
					onChange={(e) => this.handleInput(e)}
				/>
			</div>
		);
	}
}

/**
 * @deprecated use named import
 */
export default Picker;
