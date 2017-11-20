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

var logger = new _awsAmplify.Logger('Storage.S3Text');

var S3Text = function (_Component) {
    _inherits(S3Text, _Component);

    function S3Text(props) {
        _classCallCheck(this, S3Text);

        var _this = _possibleConstructorReturn(this, (S3Text.__proto__ || Object.getPrototypeOf(S3Text)).call(this, props));

        _this.handleOnLoad = _this.handleOnLoad.bind(_this);
        _this.handleOnError = _this.handleOnError.bind(_this);
        _this.handlePick = _this.handlePick.bind(_this);

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
        value: function () {
            function getText(key, level) {
                var _this2 = this;

                _awsAmplify.Storage.get(key, { download: true, level: level ? level : 'public' }).then(function (data) {
                    logger.debug(data);
                    _this2.setState({
                        textKey: key,
                        text: data.Body.toString('utf8')
                    });
                })['catch'](function (err) {
                    return logger.debug(err);
                });
            }

            return getText;
        }()
    }, {
        key: 'load',
        value: function () {
            function load() {
                var textKey = this.state.textKey;
                var _props = this.props,
                    path = _props.path,
                    body = _props.body,
                    contentType = _props.contentType,
                    level = _props.level;

                if (!textKey && !path) {
                    logger.debug('empty textKey and path');
                    return;
                }

                var that = this;
                var key = textKey || path;
                logger.debug('loading ' + key + '...');
                if (body) {
                    var type = contentType || 'text/*';
                    var ret = _awsAmplify.Storage.put(key, body, type, { level: level ? level : 'public' });
                    ret.then(function (data) {
                        logger.debug(data);
                        that.getText(key, level);
                    })['catch'](function (err) {
                        return logger.debug(err);
                    });
                } else {
                    that.getText(key, level);
                }
            }

            return load;
        }()
    }, {
        key: 'handleOnLoad',
        value: function () {
            function handleOnLoad(evt) {
                var onLoad = this.props.onLoad;

                if (onLoad) {
                    onLoad(this.state.text);
                }
            }

            return handleOnLoad;
        }()
    }, {
        key: 'handleOnError',
        value: function () {
            function handleOnError(evt) {
                var onError = this.props.onError;

                if (onError) {
                    onError(this.state.text);
                }
            }

            return handleOnError;
        }()
    }, {
        key: 'handlePick',
        value: function () {
            function handlePick(data) {
                var that = this;

                var textKey = this.state.textKey;

                var path = this.props.path || '';
                var _props2 = this.props,
                    level = _props2.level,
                    fileToKey = _props2.fileToKey;
                var file = data.file,
                    name = data.name,
                    size = data.size,
                    type = data.type;

                var key = textKey || path + (0, _Common.calcKey)(data, fileToKey);
                _awsAmplify.Storage.put(key, file, { contentType: type }).then(function (data) {
                    logger.debug('handle pick data', data);
                    that.getText(key, level);
                })['catch'](function (err) {
                    return logger.debug('handle pick error', err);
                });
            }

            return handlePick;
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
                var text = this.state.text;
                var _props3 = this.props,
                    hidden = _props3.hidden,
                    style = _props3.style,
                    picker = _props3.picker;

                if (!text && !picker) {
                    return null;
                }

                var theme = this.props.theme || _AmplifyTheme2['default'];
                var textStyle = hidden ? _AmplifyTheme2['default'].hidden : Object.assign({}, theme.text, style);

                return _react2['default'].createElement(
                    'div',
                    { style: textStyle },
                    text ? _react2['default'].createElement(
                        'pre',
                        {
                            style: theme.pre,
                            onLoad: this.handleOnLoad,
                            onError: this.handleOnError
                        },
                        text
                    ) : null,
                    picker ? _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_Widget.TextPicker, {
                            key: 'picker',
                            onPick: this.handlePick,
                            theme: theme
                        })
                    ) : null
                );
            }

            return render;
        }()
    }]);

    return S3Text;
}(_react.Component);

exports['default'] = S3Text;