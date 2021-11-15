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

import {
	ConsoleLogger as Logger,
	filenameToContentType,
	Hub,
	isTextFile,
	sortByField,
} from '@aws-amplify/core';
import { Storage } from '@aws-amplify/storage';

import { Picker } from '../Widget/Picker';
import AmplifyTheme from '../AmplifyTheme';
import { S3Image } from './S3Image';
import { S3Text } from './S3Text';

const logger = new Logger('Storage.S3Album');

export interface IS3AlbumProps {
	contentType?: any;
	fileToKey?: any;
	filter?: any;
	identityId: any;
	level?: any;
	onClickItem?: any;
	onError?: any;
	onLoad?: any;
	onPick?: any;
	onSelect?: any;
	track?: any;
	path: any;
	picker: any;
	pickerTitle?: string;
	select?: any;
	sort?: any;
	theme?: any;
	translateItem?: any;
	ts?: any;
}

export interface IS3AlbumState {
	items: any;
	theme?: any;
	ts: any;
}

export class S3Album extends React.Component<IS3AlbumProps, IS3AlbumState> {
	_isMounted = false;
	constructor(props) {
		super(props);

		this.handlePick = this.handlePick.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.list = this.list.bind(this);
		this.marshal = this.marshal.bind(this);

		this.state = {
			items: [],
			ts: new Date().getTime(),
		};
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

	handlePick(data) {
		const { onPick, onLoad, onError, track, level } = this.props;

		if (onPick) {
			onPick(data);
		}

		const path = this.props.path || '';
		const { file, name, size, type } = data;
		const key = path + this.getKey(data);
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
			.then((data) => {
				logger.debug('handle pick data', data);
				const { items } = this.state;
				if (items.filter((item) => item.key === key).length === 0) {
					const list = items.concat(data);
					this.marshal(list);
				} else {
					logger.debug('update an item');
				}
				if (onLoad) {
					onLoad(data);
				}
			})
			.catch((err) => {
				logger.debug('handle pick error', err);
				if (onError) {
					onError(err);
				}
			});
		if (this._isMounted) {
			this.setState({ ts: new Date().getTime() });
		}
	}

	handleClick(item) {
		const { onClickItem, select, onSelect } = this.props;
		if (onClickItem) {
			onClickItem(item);
		}

		if (!select) {
			return;
		}

		item.selected = !item.selected;
		if (this._isMounted) {
			this.setState({ items: this.state.items.slice() });
		}

		if (!onSelect) {
			return;
		}

		const selected_items = this.state.items.filter((item) => item.selected);
		onSelect(item, selected_items);
	}

	componentDidMount() {
		this._isMounted = true;
		this.list();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			this.props.path === prevProps.path &&
			this.props.ts === prevProps.ts &&
			this.props.select === prevProps.select
		) {
			return;
		}

		if (!this.props.select) {
			this.state.items.forEach((item) => (item.selected = false));
		}
		if (this.props.onSelect) {
			this.props.onSelect(null, []);
		}

		this.list();
	}

	list() {
		const { path, level, track, identityId } = this.props;
		logger.debug('Album path: ' + path);
		if (!Storage || typeof Storage.list !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		return Storage.list(path, {
			level: level ? level : 'public',
			track,
			identityId,
		})
			.then((data) => {
				logger.debug('album list', data);
				this.marshal(data);
			})
			.catch((err) => {
				logger.warn(err);
				return [];
			});
	}

	contentType(item) {
		return filenameToContentType(item.key, 'image/*');
	}

	marshal(list) {
		const contentType = this.props.contentType || '';
		list.forEach((item) => {
			if (item.contentType) {
				return;
			}
			const isString = typeof contentType === 'string';
			item.contentType = isString ? contentType : contentType(item);
			if (!item.contentType) {
				item.contentType = this.contentType(item);
			}
		});

		let items = this.filter(list);
		items = this.sort(items);
		if (this._isMounted) {
			this.setState({ items });
		}
	}

	filter(list) {
		const { filter } = this.props;
		return filter ? filter(list) : list;
	}

	sort(list) {
		const { sort } = this.props;
		const typeof_sort = typeof sort;
		if (typeof_sort === 'function') {
			return sort(list);
		}

		// @ts-ignore
		if (['string', 'undefined'].includes(typeof_sort)) {
			const sort_str = sort ? sort : 'lastModified';
			const parts = sort_str.split(/\s+/);
			const field = parts[0];
			let dir = parts.length > 1 ? parts[1] : '';
			if (field === 'lastModified') {
				dir = dir === 'asc' ? 'asc' : 'desc';
			} else {
				dir = dir === 'desc' ? 'desc' : 'asc';
			}
			sortByField(list, field, dir);

			return list;
		}

		logger.warn('invalid sort. done nothing. should be a string or function');
		return list;
	}

	render() {
		const { picker, translateItem, level, identityId } = this.props;
		const { items, ts } = this.state;

		const pickerTitle = this.props.pickerTitle || 'Pick';

		const theme = this.props.theme || AmplifyTheme;

		const list = items.map((item) => {
			const isText = item.contentType && isTextFile(item.contentType);
			return isText ? (
				<S3Text
					key={item.key}
					textKey={item.key}
					theme={theme}
					style={theme.albumText}
					selected={item.selected}
					translate={translateItem}
					level={level}
					identityId={identityId}
					onClick={() => this.handleClick(item)}
				/>
			) : (
				<S3Image
					key={item.key}
					imgKey={item.key}
					theme={theme}
					style={theme.albumPhoto}
					selected={item.selected}
					translate={translateItem}
					level={level}
					identityId={identityId}
					onClick={() => this.handleClick(item)}
				/>
			);
		});
		return (
			<div>
				<div style={theme.album}>{list}</div>
				{picker ? (
					<Picker
						key={ts}
						title={pickerTitle}
						accept="image/*, text/*"
						onPick={this.handlePick}
						theme={theme}
					/>
				) : null}
			</div>
		);
	}
}

/**
 * @deprecated use named import
 */
export default S3Album;
