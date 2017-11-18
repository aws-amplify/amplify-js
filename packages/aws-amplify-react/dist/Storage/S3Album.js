'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _Widget = require('../Widget');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _S3Image = require('./S3Image');

var _S3Image2 = _interopRequireDefault(_S3Image);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var logger = new _awsAmplify.Logger('Storage.S3Album');

var S3Album = function (_Component) {
    _inherits(S3Album, _Component);

    function S3Album(props) {
        _classCallCheck(this, S3Album);

        var _this = _possibleConstructorReturn(this, (S3Album.__proto__ || Object.getPrototypeOf(S3Album)).call(this, props));

        _this.handlePick = _this.handlePick.bind(_this);

        var theme = _this.props.theme || _AmplifyTheme2['default'];
        _this.state = {
            theme: theme,
            images: []
        };

        _awsAmplify.Hub.listen('window', _this, 'S3Album');
        return _this;
    }

    _createClass(S3Album, [{
        key: 'getKey',
        value: function () {
            function getKey(file) {
                var fileToKey = this.props.fileToKey;
                var name = file.name,
                    size = file.size,
                    type = file.type;

                var key = encodeURI(name);
                if (fileToKey) {
                    var callback_type = typeof fileToKey === 'undefined' ? 'undefined' : _typeof(fileToKey);
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
            }

            return getKey;
        }()
    }, {
        key: 'handlePick',
        value: function () {
            function handlePick(data) {
                var that = this;

                var path = this.props.path || '';
                var file = data.file,
                    name = data.name,
                    size = data.size,
                    type = data.type;

                var key = path + this.getKey(data);
                _awsAmplify.Storage.put(key, file, { contentType: type }).then(function (data) {
                    logger.debug('handle pick data', data);
                    that.addImage(data.key);
                })['catch'](function (err) {
                    return logger.debug('handle pick error', err);
                });
            }

            return handlePick;
        }()
    }, {
        key: 'addImage',
        value: function () {
            function addImage(key) {
                var theme = this.props.theme || _AmplifyTheme2['default'];
                var image = _react2['default'].createElement(_S3Image2['default'], { key: key, path: key, theme: theme });
                var images = this.state.images;
                if (images.filter(function (image) {
                    return image.key === key;
                }).length === 0) {
                    this.setState({ images: images.concat(image) });
                } else {
                    logger.debug('update an image');
                }
            }

            return addImage;
        }()
    }, {
        key: 'onHubCapsule',
        value: function () {
            function onHubCapsule(capsule) {
                var theme = this.props.theme || _AmplifyTheme2['default'];
                this.setState({ theme: Object.assign({}, theme) });
            }

            return onHubCapsule;
        }()
    }, {
        key: 'componentDidMount',
        value: function () {
            function componentDidMount() {
                var _this2 = this;

                var _props = this.props,
                    path = _props.path,
                    filter = _props.filter,
                    level = _props.level;

                logger.debug('Album path: ' + path);
                _awsAmplify.Storage.list(path, { level: level ? level : 'public' }).then(function (data) {
                    logger.debug('album list', data);
                    if (filter) {
                        data = filter(data);
                    }
                    _this2.setState({ images: data });
                })['catch'](function (err) {
                    return logger.warn(err);
                });
            }

            return componentDidMount;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var picker = this.props.picker;
                var images = this.state.images;


                var theme = this.props.theme || _AmplifyTheme2['default'];
                var pickerContainerStyle = Object.assign({}, theme.album, theme.center);

                var list = this.state.images.map(function (image) {
                    return _react2['default'].createElement(_S3Image2['default'], {
                        key: image.key,
                        path: image.key,
                        theme: theme,
                        style: theme.albumPhoto
                    });
                });
                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: theme.album },
                        list
                    ),
                    picker ? _react2['default'].createElement(
                        'div',
                        { style: pickerContainerStyle },
                        _react2['default'].createElement(_Widget.PhotoPicker, { key: 'picker', onPick: this.handlePick, theme: theme })
                    ) : null
                );
            }

            return render;
        }()
    }]);

    return S3Album;
}(_react.Component);

exports['default'] = S3Album;