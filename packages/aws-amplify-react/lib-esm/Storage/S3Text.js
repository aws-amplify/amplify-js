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
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import AmplifyTheme from '../AmplifyTheme';
import TextPicker from '../Widget/TextPicker';
import { calcKey } from './Common';
var logger = new Logger('Storage.S3Text');
var S3Text = /** @class */ (function(_super) {
	__extends(S3Text, _super);
	function S3Text(props) {
		var _this = _super.call(this, props) || this;
		_this._isMounted = false;
		_this.handleOnLoad = _this.handleOnLoad.bind(_this);
		_this.handleOnError = _this.handleOnError.bind(_this);
		_this.handlePick = _this.handlePick.bind(_this);
		_this.handleClick = _this.handleClick.bind(_this);
		var text = props.text,
			textKey = props.textKey;
		_this.state = {
			text: text || '',
			textKey: textKey || '',
		};
		return _this;
	}
	S3Text.prototype.getText = function(key, level, track, identityId) {
		var _this = this;
		if (!Storage || typeof Storage.get !== 'function') {
			throw new Error(
				'No Storage module found, please ensure @aws-amplify/storage is imported'
			);
		}
		Storage.get(key, {
			download: true,
			level: level ? level : 'public',
			track: track,
			identityId: identityId,
		})
			.then(function(data) {
				logger.debug(data);
				// @ts-ignore
				var text = data.Body.toString('utf8');
				if (_this._isMounted) {
					_this.setState({ text: text });
				}
				_this.handleOnLoad(text);
			})
			.catch(function(err) {
				logger.debug(err);
				_this.handleOnError(err);
			});
	};
	S3Text.prototype.load = function() {
		var _a = this.props,
			path = _a.path,
			textKey = _a.textKey,
			body = _a.body,
			contentType = _a.contentType,
			level = _a.level,
			track = _a.track,
			identityId = _a.identityId;
		if (!textKey && !path) {
			logger.debug('empty textKey and path');
			return;
		}
		var that = this;
		var key = textKey || path;
		logger.debug('loading ' + key + '...');
		if (body) {
			var type = contentType || 'text/*';
			if (!Storage || typeof Storage.put !== 'function') {
				throw new Error(
					'No Storage module found, please ensure @aws-amplify/storage is imported'
				);
			}
			var ret = Storage.put(key, body, {
				contentType: type,
				level: level ? level : 'public',
				track: track,
			});
			ret
				.then(function(data) {
					logger.debug(data);
					that.getText(key, level, track, identityId);
				})
				.catch(function(err) {
					return logger.debug(err);
				});
		} else {
			that.getText(key, level, track, identityId);
		}
	};
	S3Text.prototype.handleOnLoad = function(text) {
		var onLoad = this.props.onLoad;
		if (onLoad) {
			onLoad(text);
		}
	};
	S3Text.prototype.handleOnError = function(err) {
		var onError = this.props.onError;
		if (onError) {
			onError(err);
		}
	};
	S3Text.prototype.handlePick = function(data) {
		var that = this;
		var path = this.props.path || '';
		var _a = this.props,
			textKey = _a.textKey,
			level = _a.level,
			fileToKey = _a.fileToKey,
			track = _a.track,
			identityId = _a.identityId;
		var file = data.file,
			name = data.name,
			size = data.size,
			type = data.type;
		var key = textKey || path + calcKey(data, fileToKey);
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
				that.getText(key, level, track, identityId);
			})
			.catch(function(err) {
				return logger.debug('handle pick error', err);
			});
	};
	S3Text.prototype.handleClick = function(evt) {
		var onClick = this.props.onClick;
		if (onClick) {
			onClick(evt);
		}
	};
	S3Text.prototype.componentDidMount = function() {
		this._isMounted = true;
		this.load();
	};
	S3Text.prototype.componentWillUnmount = function() {
		this._isMounted = false;
	};
	S3Text.prototype.componentDidUpdate = function(prevProps) {
		var update =
			prevProps.path !== this.props.path ||
			prevProps.textKey !== this.props.textKey ||
			prevProps.body !== this.props.body;
		if (update) {
			this.load();
		}
	};
	S3Text.prototype.textEl = function(text, theme) {
		if (!text) {
			return null;
		}
		var selected = this.props.selected;
		var containerStyle = { position: 'relative' };
		return React.createElement(
			'div',
			{ style: containerStyle, onClick: this.handleClick },
			React.createElement('pre', { style: theme.pre }, text),
			React.createElement('div', {
				style: selected ? theme.overlaySelected : theme.overlay,
			})
		);
	};
	S3Text.prototype.render = function() {
		var _a = this.props,
			hidden = _a.hidden,
			style = _a.style,
			picker = _a.picker,
			translate = _a.translate,
			textKey = _a.textKey;
		var text = this.state.text;
		if (translate) {
			text =
				typeof translate === 'string'
					? translate
					: translate({
							type: 'text',
							key: textKey,
							content: text,
					  });
		}
		if (!text && !picker) {
			return null;
		}
		var theme = this.props.theme || AmplifyTheme;
		var textStyle = hidden
			? AmplifyTheme.hidden
			: Object.assign({}, theme.text, style);
		return React.createElement(
			'div',
			{ style: textStyle },
			textStyle ? this.textEl(text, theme) : null,
			picker
				? React.createElement(
						'div',
						null,
						React.createElement(TextPicker, {
							key: 'picker',
							onPick: this.handlePick,
							theme: theme,
						})
				  )
				: null
		);
	};
	return S3Text;
})(Component);
export default S3Text;
//# sourceMappingURL=S3Text.js.map
