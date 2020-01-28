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
var __extends =
	(this && this.__extends) ||
	(function() {
		var extendStatics = function(d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function(d, b) {
						d.__proto__ = b;
					}) ||
				function(d, b) {
					for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype =
				b === null
					? Object.create(b)
					: ((__.prototype = b.prototype), new __());
		};
	})();
import * as React from 'react';
import { Component } from 'react';
import { JS, ConsoleLogger as Logger } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import Picker from '../Widget/Picker';
import AmplifyTheme from '../AmplifyTheme';
import S3Image from './S3Image';
import S3Text from './S3Text';
var logger = new Logger('Storage.S3Album');
var S3Album = /** @class */ (function(_super) {
	__extends(S3Album, _super);
	function S3Album(props) {
		var _this = _super.call(this, props) || this;
		_this._isMounted = false;
		_this.handlePick = _this.handlePick.bind(_this);
		_this.handleClick = _this.handleClick.bind(_this);
		_this.list = _this.list.bind(_this);
		_this.marshal = _this.marshal.bind(_this);
		_this.state = {
			items: [],
			ts: new Date().getTime(),
		};
		return _this;
	}
	S3Album.prototype.getKey = function(file) {
		var fileToKey = this.props.fileToKey;
		var name = file.name,
			size = file.size,
			type = file.type;
		var key = encodeURI(name);
		if (fileToKey) {
			var callback_type = typeof fileToKey;
			if (callback_type === 'string') {
				key = fileToKey;
			} else if (callback_type === 'function') {
				key = fileToKey({ name: name, size: size, type: type });
			} else {
				key = encodeURI(JSON.stringify(fileToKey));
			}
			if (!key) {
				logger.debug('key is empty');
				key = 'empty_key';
			}
		}
		return key.replace(/\s/g, '_');
	};
	S3Album.prototype.handlePick = function(data) {
		var _this = this;
		var _a = this.props,
			onPick = _a.onPick,
			onLoad = _a.onLoad,
			onError = _a.onError,
			track = _a.track,
			level = _a.level;
		if (onPick) {
			onPick(data);
		}
		var path = this.props.path || '';
		var file = data.file,
			name = data.name,
			size = data.size,
			type = data.type;
		var key = path + this.getKey(data);
		if (!Storage || typeof Storage.put !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		Storage.put(key, file, {
			level: level ? level : 'public',
			contentType: type,
			track: track,
		})
			.then(function(data) {
				logger.debug('handle pick data', data);
				var items = _this.state.items;
				if (
					items.filter(function(item) {
						return item.key === key;
					}).length === 0
				) {
					var list = items.concat(data);
					_this.marshal(list);
				} else {
					logger.debug('update an item');
				}
				if (onLoad) {
					onLoad(data);
				}
			})
			.catch(function(err) {
				logger.debug('handle pick error', err);
				if (onError) {
					onError(err);
				}
			});
		if (this._isMounted) {
			this.setState({ ts: new Date().getTime() });
		}
	};
	S3Album.prototype.handleClick = function(item) {
		var _a = this.props,
			onClickItem = _a.onClickItem,
			select = _a.select,
			onSelect = _a.onSelect;
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
		var selected_items = this.state.items.filter(function(item) {
			return item.selected;
		});
		onSelect(item, selected_items);
	};
	S3Album.prototype.componentDidMount = function() {
		this._isMounted = true;
		this.list();
	};
	S3Album.prototype.componentWillUnmount = function() {
		this._isMounted = false;
	};
	S3Album.prototype.componentDidUpdate = function(prevProps, prevState) {
		if (
			this.props.path === prevProps.path &&
			this.props.ts === prevProps.ts &&
			this.props.select === prevProps.select
		) {
			return;
		}
		if (!this.props.select) {
			this.state.items.forEach(function(item) {
				return (item.selected = false);
			});
		}
		if (this.props.onSelect) {
			this.props.onSelect(null, []);
		}
		this.list();
	};
	S3Album.prototype.list = function() {
		var _this = this;
		var _a = this.props,
			path = _a.path,
			level = _a.level,
			track = _a.track,
			identityId = _a.identityId;
		logger.debug('Album path: ' + path);
		if (!Storage || typeof Storage.list !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		return Storage.list(path, {
			level: level ? level : 'public',
			track: track,
			identityId: identityId,
		})
			.then(function(data) {
				logger.debug('album list', data);
				_this.marshal(data);
			})
			.catch(function(err) {
				logger.warn(err);
				return [];
			});
	};
	S3Album.prototype.contentType = function(item) {
		return JS.filenameToContentType(item.key, 'image/*');
	};
	S3Album.prototype.marshal = function(list) {
		var _this = this;
		var contentType = this.props.contentType || '';
		list.forEach(function(item) {
			if (item.contentType) {
				return;
			}
			var isString = typeof contentType === 'string';
			item.contentType = isString ? contentType : contentType(item);
			if (!item.contentType) {
				item.contentType = _this.contentType(item);
			}
		});
		var items = this.filter(list);
		items = this.sort(items);
		if (this._isMounted) {
			this.setState({ items: items });
		}
	};
	S3Album.prototype.filter = function(list) {
		var filter = this.props.filter;
		return filter ? filter(list) : list;
	};
	S3Album.prototype.sort = function(list) {
		var sort = this.props.sort;
		var typeof_sort = typeof sort;
		if (typeof_sort === 'function') {
			return sort(list);
		}
		// @ts-ignore
		if (['string', 'undefined'].includes(typeof_sort)) {
			var sort_str = sort ? sort : 'lastModified';
			var parts = sort_str.split(/\s+/);
			var field = parts[0];
			var dir = parts.length > 1 ? parts[1] : '';
			if (field === 'lastModified') {
				dir = dir === 'asc' ? 'asc' : 'desc';
			} else {
				dir = dir === 'desc' ? 'desc' : 'asc';
			}
			JS.sortByField(list, field, dir);
			return list;
		}
		logger.warn('invalid sort. done nothing. should be a string or function');
		return list;
	};
	S3Album.prototype.render = function() {
		var _this = this;
		var _a = this.props,
			picker = _a.picker,
			translateItem = _a.translateItem,
			level = _a.level,
			identityId = _a.identityId;
		var _b = this.state,
			items = _b.items,
			ts = _b.ts;
		var pickerTitle = this.props.pickerTitle || 'Pick';
		var theme = this.props.theme || AmplifyTheme;
		var list = items.map(function(item) {
			var isText = item.contentType && JS.isTextFile(item.contentType);
			return isText
				? React.createElement(S3Text, {
						key: item.key,
						textKey: item.key,
						theme: theme,
						style: theme.albumText,
						selected: item.selected,
						translate: translateItem,
						level: level,
						identityId: identityId,
						onClick: function() {
							return _this.handleClick(item);
						},
				  })
				: React.createElement(S3Image, {
						key: item.key,
						imgKey: item.key,
						theme: theme,
						style: theme.albumPhoto,
						selected: item.selected,
						translate: translateItem,
						level: level,
						identityId: identityId,
						onClick: function() {
							return _this.handleClick(item);
						},
				  });
		});
		return React.createElement(
			'div',
			null,
			React.createElement('div', { style: theme.album }, list),
			picker
				? React.createElement(Picker, {
						key: ts,
						title: pickerTitle,
						accept: 'image/*, text/*',
						onPick: this.handlePick,
						theme: theme,
				  })
				: null
		);
	};
	return S3Album;
})(Component);
export default S3Album;
//# sourceMappingURL=S3Album.js.map
