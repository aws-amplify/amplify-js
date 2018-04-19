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

var _Picker = require('./Picker');

var _Picker2 = _interopRequireDefault(_Picker);

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

var Container = {};

var PickerPreview = {
    maxWidth: '100%'
};

var logger = new _awsAmplify.Logger('TextPicker');

var TextPicker = function (_Component) {
    _inherits(TextPicker, _Component);

    function TextPicker(props) {
        _classCallCheck(this, TextPicker);

        var _this = _possibleConstructorReturn(this, (TextPicker.__proto__ || Object.getPrototypeOf(TextPicker)).call(this, props));

        _this.handlePick = _this.handlePick.bind(_this);

        _this.state = {
            previewText: props.previewText
        };
        return _this;
    }

    _createClass(TextPicker, [{
        key: 'handlePick',
        value: function handlePick(data) {
            var that = this;
            var file = data.file,
                name = data.name,
                size = data.size,
                type = data.type;
            var _props = this.props,
                preview = _props.preview,
                onPick = _props.onPick,
                onLoad = _props.onLoad;


            if (onPick) {
                onPick(data);
            }

            if (preview) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var text = e.target.result;
                    that.setState({ previewText: text });
                    if (onLoad) {
                        onLoad(text);
                    }
                };
                reader.readAsText(file);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var preview = this.props.preview;
            var previewText = this.state.previewText;


            var title = this.props.title || 'Pick a File';

            var theme = this.props.theme || _AmplifyTheme2.default;
            var containerStyle = Object.assign({}, Container, theme.picker);
            var previewStyle = Object.assign({}, PickerPreview, theme.pickerPreview, theme.halfHeight, preview && preview !== 'hidden' ? {} : _AmplifyTheme2.default.hidden);

            return _react2.default.createElement(
                'div',
                { style: containerStyle },
                previewText ? _react2.default.createElement(
                    'div',
                    { style: previewStyle },
                    _react2.default.createElement(
                        'pre',
                        { style: theme.pre },
                        previewText
                    )
                ) : null,
                _react2.default.createElement(_Picker2.default, {
                    title: title,
                    accept: 'text/*',
                    theme: theme,
                    onPick: this.handlePick
                })
            );
        }
    }]);

    return TextPicker;
}(_react.Component);

exports.default = TextPicker;