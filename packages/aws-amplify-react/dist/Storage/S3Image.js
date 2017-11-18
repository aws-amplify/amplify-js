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

var logger = new _awsAmplify.Logger('Storage.S3Image');

var S3Image = function (_Component) {
    _inherits(S3Image, _Component);

    function S3Image(props) {
        _classCallCheck(this, S3Image);

        var _this = _possibleConstructorReturn(this, (S3Image.__proto__ || Object.getPrototypeOf(S3Image)).call(this, props));

        _this.handleOnLoad = _this.handleOnLoad.bind(_this);

        _this.state = { src: null };
        return _this;
    }

    _createClass(S3Image, [{
        key: 'getImageSource',
        value: function () {
            function getImageSource() {
                var _this2 = this;

                var _props = this.props,
                    path = _props.path,
                    level = _props.level;

                _awsAmplify.Storage.get(path, { level: level ? level : 'public' }).then(function (url) {
                    _this2.setState({
                        src: url
                    });
                })['catch'](function (err) {
                    return logger.warn(err);
                });
            }

            return getImageSource;
        }()
    }, {
        key: 'load',
        value: function () {
            function load() {
                var _props2 = this.props,
                    path = _props2.path,
                    body = _props2.body,
                    contentType = _props2.contentType,
                    level = _props2.level;

                if (!path) {
                    logger.debug('empty path');
                    return;
                }

                var that = this;
                logger.debug('loading ' + path + '...');
                if (body) {
                    var type = contentType || 'binary/octet-stream';
                    var ret = _awsAmplify.Storage.put(path, body, type, { level: level ? level : 'public' });
                    ret.then(function (data) {
                        logger.debug(data);
                        that.getImageSource();
                    })['catch'](function (err) {
                        return logger.warn(err);
                    });
                } else {
                    that.getImageSource();
                }
            }

            return load;
        }()
    }, {
        key: 'handleOnLoad',
        value: function () {
            function handleOnLoad(evt) {
                var onReady = this.props.onReady;

                if (onReady) {
                    onReady(this.state.src);
                }
            }

            return handleOnLoad;
        }()
    }, {
        key: 'componentDidMount',
        value: function () {
            function componentDidMount() {
                this.load();
            }

            return componentDidMount;
        }()
    }, {
        key: 'componentDidUpdate',
        value: function () {
            function componentDidUpdate(prevProps) {
                if (prevProps.path !== this.props.path || prevProps.body !== this.props.body) {
                    this.load();
                }
            }

            return componentDidUpdate;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var src = this.state.src;

                if (!src) {
                    return null;
                }

                var theme = this.props.theme || _AmplifyTheme2['default'];
                var _props3 = this.props,
                    hidden = _props3.hidden,
                    style = _props3.style;

                var imgStyle = hidden ? _AmplifyTheme2['default'].hidden : Object.assign({}, theme.photo, style);

                return _react2['default'].createElement('img', { style: imgStyle, src: src, onLoad: this.handleOnLoad });
            }

            return render;
        }()
    }]);

    return S3Image;
}(_react.Component);

exports['default'] = S3Image;