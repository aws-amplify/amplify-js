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

var _AmplifyUI = require('../AmplifyUI');

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

var logger = new _awsAmplify.Logger('Storage.S3Image');

var S3Image = function (_Component) {
    _inherits(S3Image, _Component);

    function S3Image(props) {
        _classCallCheck(this, S3Image);

        var _this = _possibleConstructorReturn(this, (S3Image.__proto__ || Object.getPrototypeOf(S3Image)).call(this, props));

        _this.handleOnLoad = _this.handleOnLoad.bind(_this);
        _this.handleOnError = _this.handleOnError.bind(_this);
        _this.handlePick = _this.handlePick.bind(_this);
        _this.handleClick = _this.handleClick.bind(_this);

        var initSrc = _this.props.src || _AmplifyUI.transparent1X1;

        _this.state = { src: initSrc };
        return _this;
    }

    _createClass(S3Image, [{
        key: 'getImageSource',
        value: function getImageSource(key, level, track) {
            var _this2 = this;

            _awsAmplify.Storage.get(key, { level: level ? level : 'public', track: track }).then(function (url) {
                _this2.setState({
                    src: url
                });
            }).catch(function (err) {
                return logger.debug(err);
            });
        }
    }, {
        key: 'load',
        value: function load() {
            var _props = this.props,
                imgKey = _props.imgKey,
                path = _props.path,
                body = _props.body,
                contentType = _props.contentType,
                level = _props.level,
                track = _props.track;

            if (!imgKey && !path) {
                logger.debug('empty imgKey and path');
                return;
            }

            var that = this;
            var key = imgKey || path;
            logger.debug('loading ' + key + '...');
            if (body) {
                var type = contentType || 'binary/octet-stream';
                var ret = _awsAmplify.Storage.put(key, body, {
                    contentType: type,
                    level: level ? level : 'public',
                    track: track
                });
                ret.then(function (data) {
                    logger.debug(data);
                    that.getImageSource(key, level, track);
                }).catch(function (err) {
                    return logger.debug(err);
                });
            } else {
                that.getImageSource(key, level, track);
            }
        }
    }, {
        key: 'handleOnLoad',
        value: function handleOnLoad(evt) {
            var onLoad = this.props.onLoad;

            if (onLoad) {
                onLoad(this.state.src);
            }
        }
    }, {
        key: 'handleOnError',
        value: function handleOnError(evt) {
            var onError = this.props.onError;

            if (onError) {
                onError(this.state.src);
            }
        }
    }, {
        key: 'handlePick',
        value: function handlePick(data) {
            var that = this;

            var path = this.props.path || '';
            var _props2 = this.props,
                imgKey = _props2.imgKey,
                level = _props2.level,
                fileToKey = _props2.fileToKey,
                track = _props2.track;
            var file = data.file,
                name = data.name,
                size = data.size,
                type = data.type;

            var key = imgKey || path + (0, _Common.calcKey)(data, fileToKey);
            _awsAmplify.Storage.put(key, file, {
                level: level ? level : 'public',
                contentType: type,
                track: track
            }).then(function (data) {
                logger.debug('handle pick data', data);
                that.getImageSource(key, level, track);
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
            var update = prevProps.path !== this.props.path || prevProps.imgKey !== this.props.imgKey || prevProps.body !== this.props.body;
            if (update) {
                this.load();
            }
        }
    }, {
        key: 'imageEl',
        value: function imageEl(src, theme) {
            if (!src) {
                return null;
            }

            var selected = this.props.selected;

            var containerStyle = { position: 'relative' };
            return _react2.default.createElement(
                'div',
                { style: containerStyle, onClick: this.handleClick },
                _react2.default.createElement('img', {
                    style: theme.photoImg,
                    src: src,
                    onLoad: this.handleOnLoad,
                    onError: this.handleOnError
                }),
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
                imgKey = _props3.imgKey;

            var src = this.state.src;
            if (translate) {
                src = typeof translate === 'string' ? translate : translate({
                    type: 'image',
                    key: imgKey,
                    content: src
                });
            }
            if (!src && !picker) {
                return null;
            }

            var theme = this.props.theme || _AmplifyTheme2.default;
            var photoStyle = hidden ? _AmplifyTheme2.default.hidden : Object.assign({}, theme.photo, style);

            return _react2.default.createElement(
                'div',
                { style: photoStyle },
                photoStyle ? this.imageEl(src, theme) : null,
                picker ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_Widget.PhotoPicker, {
                        key: 'picker',
                        onPick: this.handlePick,
                        theme: theme
                    })
                ) : null
            );
        }
    }]);

    return S3Image;
}(_react.Component);

exports.default = S3Image;