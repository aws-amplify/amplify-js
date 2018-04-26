'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _Widget = require('../Widget');

var _Common = require('./Common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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

var logger = new _awsAmplify.Logger('Storage.S3Text');

var S3Text = function (_Component) {
    _inherits(S3Text, _Component);

    function S3Text(props) {
        _classCallCheck(this, S3Text);

        var _this = _possibleConstructorReturn(this, (S3Text.__proto__ || Object.getPrototypeOf(S3Text)).call(this, props));

        _this.handleOnLoad = _this.handleOnLoad.bind(_this);
        _this.handleOnError = _this.handleOnError.bind(_this);
        _this.handlePick = _this.handlePick.bind(_this);
        _this.handleClick = _this.handleClick.bind(_this);

        var text = props.text,
            textKey = props.textKey;

        _this.state = {
            text: text || '',
            textKey: textKey || ''
        };
        return _this;
    }

    _createClass(S3Text, [{
        key: 'getText',
        value: function getText(key, level, track) {
            var _this2 = this;

            _awsAmplify.Storage.get(key, { download: true, level: level ? level : 'public', track: track }).then(function (data) {
                logger.debug(data);
                var text = data.Body.toString('utf8');
                _this2.setState({ text: text });
                _this2.handleOnLoad(text);
            }).catch(function (err) {
                logger.debug(err);
                _this2.handleOnError(err);
            });
        }
    }, {
        key: 'load',
        value: function load() {
            var _props = this.props,
                path = _props.path,
                textKey = _props.textKey,
                body = _props.body,
                contentType = _props.contentType,
                level = _props.level,
                track = _props.track;

            if (!textKey && !path) {
                logger.debug('empty textKey and path');
                return;
            }

            var that = this;
            var key = textKey || path;
            logger.debug('loading ' + key + '...');
            if (body) {
                var type = contentType || 'text/*';
                var ret = _awsAmplify.Storage.put(key, body, {
                    contentType: type,
                    level: level ? level : 'public',
                    track: track
                });
                ret.then(function (data) {
                    logger.debug(data);
                    that.getText(key, level, track);
                }).catch(function (err) {
                    return logger.debug(err);
                });
            } else {
                that.getText(key, level, track);
            }
        }
    }, {
        key: 'handleOnLoad',
        value: function handleOnLoad(text) {
            var onLoad = this.props.onLoad;

            if (onLoad) {
                onLoad(text);
            }
        }
    }, {
        key: 'handleOnError',
        value: function handleOnError(err) {
            var onError = this.props.onError;

            if (onError) {
                onError(err);
            }
        }
    }, {
        key: 'handlePick',
        value: function handlePick(data) {
            var that = this;

            var path = this.props.path || '';
            var _props2 = this.props,
                textKey = _props2.textKey,
                level = _props2.level,
                fileToKey = _props2.fileToKey,
                track = _props2.track;
            var file = data.file,
                name = data.name,
                size = data.size,
                type = data.type;

            var key = textKey || path + (0, _Common.calcKey)(data, fileToKey);
            _awsAmplify.Storage.put(key, file, {
                level: level ? level : 'public',
                contentType: type,
                track: track
            }).then(function (data) {
                logger.debug('handle pick data', data);
                that.getText(key, level, track);
            }).catch(function (err) {
                return logger.debug('handle pick error', err);
            });
        }
    }, {
        key: 'handleClick',
        value: function handleClick(evt) {
            var onClick = this.props.onClick;

            if (onClick) {
                onClick(evt);
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.load();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var update = prevProps.path !== this.props.path || prevProps.textKey !== this.props.textKey || prevProps.body !== this.props.body;
            if (update) {
                this.load();
            }
        }
    }, {
        key: 'textEl',
        value: function textEl(text, theme) {
            if (!text) {
                return null;
            }

            var selected = this.props.selected;

            var containerStyle = { position: 'relative' };
            return _react2.default.createElement(
                'div',
                { style: containerStyle, onClick: this.handleClick },
                _react2.default.createElement(
                    'pre',
                    { style: theme.pre },
                    text
                ),
                _react2.default.createElement('div', { style: selected ? theme.overlaySelected : theme.overlay })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                hidden = _props3.hidden,
                style = _props3.style,
                picker = _props3.picker,
                translate = _props3.translate,
                textKey = _props3.textKey;

            var text = this.state.text;
            if (translate) {
                text = typeof translate === 'string' ? translate : translate({
                    type: 'text',
                    key: textKey,
                    content: text
                });
            }
            if (!text && !picker) {
                return null;
            }

            var theme = this.props.theme || _AmplifyTheme2.default;
            var textStyle = hidden ? _AmplifyTheme2.default.hidden : Object.assign({}, theme.text, style);

            return _react2.default.createElement(
                'div',
                { style: textStyle },
                textStyle ? this.textEl(text, theme) : null,
                picker ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_Widget.TextPicker, {
                        key: 'picker',
                        onPick: this.handlePick,
                        theme: theme
                    })
                ) : null
            );
        }
    }]);

    return S3Text;
}(_react.Component);

exports.default = S3Text;