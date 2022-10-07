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

import React, { Component } from 'react';
import { Image, StyleSheet, ImageResizeMode } from 'react-native';
import { Storage, Logger } from 'aws-amplify';
import AmplifyTheme, { AmplifyThemeType } from '../AmplifyTheme';

const logger = new Logger('Storage.S3Image');

interface IS3ImageProps {
	body?: any;
	contentType?: string;
	imgKey?: string;
	level?: string;
	style?: any;
	resizeMode?: ImageResizeMode;
	theme?: AmplifyThemeType;
}

interface IS3ImageState {
	src?: any;
}

export default class S3Image extends Component<IS3ImageProps, IS3ImageState> {
	constructor(props: IS3ImageProps) {
		super(props);

		this.state = { src: null };
	}

	getImageSource() {
		const { imgKey, level } = this.props;
		Storage.get(imgKey!, { level: level ? (level as never) : 'public' })
			.then((url) => {
				logger.debug(url);
				this.setState({
					src: { uri: url },
				});
			})
			.catch((err) => logger.warn(err));
	}

	load() {
		const { imgKey, body, contentType, level } = this.props;
		if (!imgKey) {
			logger.debug('empty imgKey');
			return;
		}

		const that = this;
		logger.debug('loading ' + imgKey + '...');
		if (body) {
			const type = contentType ? contentType : 'binary/octet-stream';
			const opt = {
				contentType: type,
				level: level ? level : 'public',
			};
			const ret = Storage.put(imgKey, body, opt as never) as Promise<unknown>;
			ret
				.then((data) => {
					logger.debug(data);
					that.getImageSource();
				})
				.catch((err) => logger.warn(err));
		} else {
			that.getImageSource();
		}
	}

	componentDidMount() {
		this.load();
	}

	componentDidUpdate(prevProps: IS3ImageProps) {
		if (prevProps.imgKey !== this.props.imgKey || prevProps.body !== this.props.body) {
			this.load();
		}
	}

	render() {
		const { src } = this.state;
		if (!src) {
			return null;
		}

		const { style, resizeMode } = this.props;
		const theme = this.props.theme || AmplifyTheme;
		const photoStyle = Object.assign({}, StyleSheet.flatten(theme.photo), style);

		return <Image source={src} resizeMode={resizeMode} style={photoStyle} />;
	}
}
