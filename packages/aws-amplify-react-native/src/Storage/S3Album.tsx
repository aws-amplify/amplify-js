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
import {
	ScrollView,
	Dimensions,
	StyleSheet,
	Button,
	TouchableOpacity,
} from 'react-native';
import { Storage, Logger } from 'aws-amplify';
import AmplifyTheme, { AmplifyThemeType } from '../AmplifyTheme';
import S3Image from './S3Image';

const logger = new Logger('Storage.S3Album');

interface IS3AlbumProps {
	fileToKey?: any;
	path?: string;
	identityId: any;
	level?: any;
	onError?: any;
	onLoad?: any;
	picker?: any;
	pickerTitle?: any;
	sort?: any;
	filter?: Function;
	track?: any;
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

	getKey(file) {
		const { fileToKey } = this.props;

		const { name, size, type } = file;
		let key = encodeURI(name);
		if (fileToKey) {
			const callback_type = typeof fileToKey;
			if (callback_type === 'string') {
				key = fileToKey;
			} else if (callback_type === 'function') {
				key = fileToKey({ name, size, type });
			} else {
				key = encodeURI(JSON.stringify(fileToKey));
			}
			if (!key) {
				logger.debug('key is empty');
				key = 'empty_key';
			}
		}

		return key.replace(/\s/g, '_');
	}

	componentDidMount() {
		const {
			path,
			onLoad,
			onError,
			track,
			level,
			filter,
			identityId,
		} = this.props;
		logger.debug('Album path: ' + path);
		if (!Storage || typeof Storage.list !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		Storage.list(path, {
			level: level ? level : 'public',
			track,
			identityId,
		})
			.then(data => {
				logger.debug(data);
				if (filter) {
					data = filter(data);
				} else {
					logger.debug('update an image');
				}
				if (onLoad) {
					onLoad(data);
				}
				this.setState({ images: data });
			})
			.catch(err => {
				logger.debug('handle pick error', err);
				if (onError) {
					onError(err);
				}
			});
	}

	render() {
		const { picker, level, identityId } = this.props;
		const pickerTitle = this.props.pickerTitle || 'Pick';
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
		const list = this.state.images.map(image => {
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
				<TouchableOpacity style={theme.buttonText}>
					{' '}
					{picker ? (
						<Button
							key={ts}
							title={pickerTitle}
							accept="image/*, text/*"
							theme={theme}
						/>
					) : null}
				</TouchableOpacity>
			</ScrollView>
		);
	}
}
