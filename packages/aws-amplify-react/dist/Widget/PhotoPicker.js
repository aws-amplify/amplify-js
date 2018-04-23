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

var logger = new _awsAmplify.Logger('PhotoPicker');

var PhotoPicker = function (_Component) {
    _inherits(PhotoPicker, _Component);

    function PhotoPicker(props) {
        _classCallCheck(this, PhotoPicker);

        var _this = _possibleConstructorReturn(this, (PhotoPicker.__proto__ || Object.getPrototypeOf(PhotoPicker)).call(this, props));

        _this.handlePick = _this.handlePick.bind(_this);

        _this.state = {
            previewSrc: props.previewSrc
        };
        return _this;
    }

    _createClass(PhotoPicker, [{
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
                    var url = e.target.result;
                    that.setState({ previewSrc: url });
                    if (onLoad) {
                        onLoad(url);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var preview = this.props.preview;
            var previewSrc = this.state.previewSrc;


            var title = this.props.title || 'Pick a Photo';

            var theme = this.props.theme || _AmplifyTheme2.default;
            var containerStyle = Object.assign({}, _Picker2.default, theme.picker);
            var previewStyle = Object.assign({}, PickerPreview, theme.pickerPreview, preview && preview !== 'hidden' ? {} : _AmplifyTheme2.default.hidden);

            return _react2.default.createElement(
                'div',
                { style: containerStyle },
                previewSrc ? _react2.default.createElement('img', { src: previewSrc, style: previewStyle }) : null,
                _react2.default.createElement(_Picker2.default, {
                    title: title,
                    accept: 'image/*',
                    theme: theme,
                    onPick: this.handlePick
                })
            );
        }
    }]);

    return PhotoPicker;
}(_react.Component);

exports.default = PhotoPicker;