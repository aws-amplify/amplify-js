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
import { Storage } from '@aws-amplify/storage';

import AmplifyTheme from '../AmplifyTheme';
import { transparent1X1 } from '../AmplifyUI';
import { PhotoPicker } from '../Widget/PhotoPicker';
import { calcKey } from './Common';

const logger = new Logger('Storage.S3Image');

export interface IS3ImageProps {
	body?: any;
	className?: string;
	contentType?: any;
	fileToKey?: any;
	hidden?: any;
	identityId?: any;
	imgKey?: any;
	level?: any;
	onClick?: any;
	onError?: any;
	onLoad?: any;
	onUploadSuccess?: any;
	path?: any;
	picker?: any;
	selected?: any;
	src?: any;
	style?: any;
	theme?: any;
	track?: any;
	translate?:
		| string
		| ((params: { type: string; key: string; content: string }) => string);
}

export interface IS3ImageState {
	src;
}

export class S3Image extends React.Component<IS3ImageProps, IS3ImageState> {
	_isMounted = false;
	constructor(props) {
		super(props);

		this.handleOnLoad = this.handleOnLoad.bind(this);
		this.handleOnError = this.handleOnError.bind(this);
		this.handlePick = this.handlePick.bind(this);
		this.handleClick = this.handleClick.bind(this);

		const initSrc = this.props.src || transparent1X1;

		this.state = { src: initSrc };
	}

	getImageSource(key, level, track, identityId) {
		if (!Storage || typeof Storage.get !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		Storage.get(key, { level: level ? level : 'public', track, identityId })
			.then(url => {
				if (this._isMounted) {
					this.setState({
						src: url,
					});
				}
			})
			.catch(err => logger.debug(err));
	}

	load() {
		const {
			imgKey,
			path,
			body,
			contentType,
			level,
			track,
			identityId,
		} = this.props;
		if (!imgKey && !path) {
			logger.debug('empty imgKey and path');
			return;
		}

		const that = this;
		const key = imgKey || path;
		logger.debug('loading ' + key + '...');
		if (body) {
			const type = contentType || 'binary/octet-stream';
			if (!Storage || typeof Storage.put !== 'function') {
				throw new Error(
					'No Storage module found, please ensure @aws-amplify/storage is imported'
				);
			}
			const ret = Storage.put(key, body, {
				contentType: type,
				level: level ? level : 'public',
				track,
			});
			ret
				.then(data => {
					logger.debug(data);
					that.getImageSource(key, level, track, identityId);
				})
				.catch(err => logger.debug(err));
		} else {
			that.getImageSource(key, level, track, identityId);
		}
	}

	handleOnLoad(evt) {
		const { onLoad } = this.props;
		if (onLoad) {
			onLoad(this.state.src);
		}
	}

	handleOnError(evt) {
		const { onError } = this.props;
		if (onError) {
			onError(this.state.src);
		}
	}

	handlePick(data) {
		const that = this;

		const {
			imgKey,
			level,
			fileToKey,
			track,
			identityId,
			path = '',
			onUploadSuccess,
		} = this.props;
		const { file, type } = data;
		const key = imgKey || path + calcKey(data, fileToKey);
		if (!Storage || typeof Storage.put !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		Storage.put(key, file, {
			level: level ? level : 'public',
			contentType: type,
			track,
		})
			.then(data => {
				logger.debug('handle pick data', data);
				that.getImageSource(key, level, track, identityId);
				if (onUploadSuccess) onUploadSuccess();
			})
			.catch(err => logger.debug('handle pick error', err));
	}

	handleClick(evt) {
		const { onClick } = this.props;
		if (onClick) {
			onClick(evt);
		}
	}

	componentDidMount() {
		this._isMounted = true;
		this.load();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidUpdate(prevProps) {
		const update =
			prevProps.path !== this.props.path ||
			prevProps.imgKey !== this.props.imgKey ||
			prevProps.body !== this.props.body ||
			prevProps.level !== this.props.level;
		if (update) {
			this.load();
		}
	}

	imageEl(src, theme) {
		if (!src) {
			return null;
		}

		const { className, selected } = this.props;
		const containerStyle: React.CSSProperties = { position: 'relative' };
		return (
			<div style={containerStyle} onClick={this.handleClick}>
				<img
					className={className}
					style={theme.photoImg}
					src={src}
					onLoad={this.handleOnLoad}
					onError={this.handleOnError}
				/>
				<div style={selected ? theme.overlaySelected : theme.overlay}></div>
			</div>
		);
	}

	render() {
		const { hidden, style, picker, translate, imgKey } = this.props;
		let src = this.state.src;
		if (translate) {
			src =
				typeof translate === 'string'
					? translate
					: translate({
							type: 'image',
							key: imgKey,
							content: src,
					  });
		}
		if (!src && !picker) {
			return null;
		}

		const theme = this.props.theme || AmplifyTheme;
		const photoStyle = hidden
			? AmplifyTheme.hidden
			: Object.assign({}, theme.photo, style);

		return (
			<div style={photoStyle}>
				{photoStyle ? this.imageEl(src, theme) : null}
				{picker ? (
					<div>
						<PhotoPicker key="picker" onPick={this.handlePick} theme={theme} />
					</div>
				) : null}
			</div>
		);
	}
}

/**
 * @deprecated use named import
 */
export default S3Image;
