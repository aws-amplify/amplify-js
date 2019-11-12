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

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import AmplifyTheme from '../AmplifyTheme';
import { Picker } from './Picker';

const Container = {};

const PickerPreview = {
	maxWidth: '100%',
};

const logger = new Logger('TextPicker');

export interface ITextPickerProps {
	onLoad?: (dataUrl: any) => void;
	onPick?: (data: any) => void;
	preview?: 'hidden';
	previewText?: string;
	theme?: any;
	title?: string;
}

export interface ITextPickerState {
	previewText: string;
}

export class TextPicker extends React.Component<
	ITextPickerProps,
	ITextPickerState
> {
	constructor(props) {
		super(props);

		this.handlePick = this.handlePick.bind(this);

		this.state = {
			previewText: props.previewText,
		};
	}

	handlePick(data) {
		const that = this;
		const { file, name, size, type } = data;
		const { preview, onPick, onLoad } = this.props;

		if (onPick) {
			onPick(data);
		}

		if (preview) {
			const reader = new FileReader();
			reader.onload = function(e) {
				const text = e.target.result;
				// @ts-ignore
				that.setState({ previewText: text });
				if (onLoad) {
					onLoad(text);
				}
			};
			reader.readAsText(file);
		}
	}

	render() {
		const { preview } = this.props;
		const { previewText } = this.state;

		const title = this.props.title || 'Pick a File';

		const theme = this.props.theme || AmplifyTheme;
		const containerStyle = Object.assign({}, Container, theme.picker);
		const previewStyle = Object.assign(
			{},
			PickerPreview,
			theme.pickerPreview,
			theme.halfHeight,
			preview && preview !== 'hidden' ? {} : AmplifyTheme.hidden
		);

		return (
			<div style={containerStyle}>
				{previewText ? (
					<div style={previewStyle}>
						<pre style={theme.pre}>{previewText}</pre>
					</div>
				) : null}
				<Picker
					title={title}
					accept="text/*"
					theme={theme}
					onPick={this.handlePick}
				/>
			</div>
		);
	}
}

/**
 * @deprecated use named import
 */
export default TextPicker;
