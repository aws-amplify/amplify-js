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
import { ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Storage, Logger } from 'aws-amplify';
import AmplifyTheme, { AmplifyThemeType } from '../AmplifyTheme';
import S3Image from './S3Image';

const logger = new Logger('Storage.S3Album');

interface IS3AlbumProps {
	path?: string;
	level?: string;
	filter?: Function;
	theme?: AmplifyThemeType;
}

interface IS3AlbumState {
	images: any[];
}

export default class S3Album extends Component<IS3AlbumProps, IS3AlbumState> {
	constructor(props: IS3AlbumProps) {
		super(props);

		this.state = { images: [] };
	}

	componentDidMount() {
		const { path, level, filter } = this.props;
		logger.debug(path);
		Storage.list(path, { level: level ? level : 'public' })
			.then((data) => {
				logger.debug(data);
				if (filter) {
					data = filter(data);
				}
				this.setState({ images: data });
			})
			.catch((err) => logger.warn(err));
	}

	render() {
		const { images } = this.state;
		if (!images) {
			return null;
		}

		const { width, height } = Dimensions.get('window');
		const theme = this.props.theme || AmplifyTheme;
		const albumStyle = Object.assign({}, StyleSheet.flatten(theme.album), {
			width: '100%',
			height: height,
		});
		const list = this.state.images.map((image) => {
			return (
				<S3Image
					key={image.key}
					imgKey={image.key}
					resizeMode="cover"
					style={{ width: '100%', height: width }}
					theme={theme}
				/>
			);
		});
		return (
			<ScrollView {...this.props} style={albumStyle}>
				{list}
			</ScrollView>
		);
	}
}
