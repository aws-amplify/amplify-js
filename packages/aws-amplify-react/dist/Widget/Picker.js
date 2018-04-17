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

var PickerPicker = {
    position: 'relative'
};

var PickerPreview = {
    maxWidth: '100%'
};

var PickerButton = {
    width: '10em',
    height: '3em',
    fontSize: '1.2em',
    textAlign: 'center'
};

var PickerInput = {
    width: '100%',
    height: '100%',
    display: 'inline-block',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    cursor: 'pointer'
};

var logger = new _awsAmplify.Logger('Picker');

var Picker = function (_Component) {
    _inherits(Picker, _Component);

    function Picker() {
        _classCallCheck(this, Picker);

        return _possibleConstructorReturn(this, (Picker.__proto__ || Object.getPrototypeOf(Picker)).apply(this, arguments));
    }

    _createClass(Picker, [{
        key: 'handleInput',
        value: function handleInput(e) {
            var that = this;

            var file = e.target.files[0];
            if (!file) {
                return;
            }

            var name = file.name,
                size = file.size,
                type = file.type;

            logger.debug(file);

            var onPick = this.props.onPick;

            if (onPick) {
                onPick({
                    file: file,
                    name: name,
                    size: size,
                    type: type
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var title = this.props.title || 'Pick a File';
            var accept = this.props.accept || '*/*';

            var theme = this.props.theme || _AmplifyTheme2.default;
            var pickerStyle = Object.assign({}, PickerPicker, theme.pickerPicker);
            var buttonStyle = Object.assign({}, PickerButton, theme.button, theme.pickerButton);
            var inputStyle = Object.assign({}, PickerInput, theme.pickerInput);

            return _react2.default.createElement(
                'div',
                { style: pickerStyle },
                _react2.default.createElement(
                    'button',
                    { style: buttonStyle },
                    _awsAmplify.I18n.get(title)
                ),
                _react2.default.createElement('input', {
                    title: _awsAmplify.I18n.get(title),
                    type: 'file', accept: accept,
                    style: inputStyle,
                    onChange: function onChange(e) {
                        return _this2.handleInput(e);
                    }
                })
            );
        }
    }]);

    return Picker;
}(_react.Component);

exports.default = Picker;