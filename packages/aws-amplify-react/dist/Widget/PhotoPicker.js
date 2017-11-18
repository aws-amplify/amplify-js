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

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PickerContainer = {
    position: 'relative'
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

var logger = new _awsAmplify.Logger('PhotoPicker');

var PhotoPicker = function (_Component) {
    _inherits(PhotoPicker, _Component);

    function PhotoPicker() {
        _classCallCheck(this, PhotoPicker);

        return _possibleConstructorReturn(this, (PhotoPicker.__proto__ || Object.getPrototypeOf(PhotoPicker)).apply(this, arguments));
    }

    _createClass(PhotoPicker, [{
        key: 'handleImageError',
        value: function () {
            function handleImageError(e) {
                this.setState({ ImgSrc: default_img_src });
            }

            return handleImageError;
        }()
    }, {
        key: 'handleInput',
        value: function () {
            function handleInput(e) {
                var that = this;

                var file = e.target.files[0];
                logger.debug(file);

                var onPick = this.props.onPick;

                if (onPick) {
                    var name = file.name,
                        size = file.size,
                        type = file.type;

                    onPick({
                        file: file,
                        name: name,
                        size: size,
                        type: type
                    });
                }
            }

            return handleInput;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var _this2 = this;

                var theme = this.props.theme || _AmplifyTheme2['default'];
                var containerStyle = Object.assign({}, PickerContainer, theme.photoPicker);
                var buttonStyle = Object.assign({}, PickerButton, theme.photoPickerButton);
                var inputStyle = Object.assign({}, PickerInput, theme.photoPickerInput);

                return _react2['default'].createElement(
                    'div',
                    { style: containerStyle },
                    _react2['default'].createElement(
                        'button',
                        { style: buttonStyle },
                        'Pick a Photo'
                    ),
                    _react2['default'].createElement('input', {
                        title: 'Pick  Photo',
                        type: 'file', accept: 'image/*',
                        style: inputStyle,
                        onChange: function () {
                            function onChange(e) {
                                return _this2.handleInput(e);
                            }

                            return onChange;
                        }()
                    })
                );
            }

            return render;
        }()
    }]);

    return PhotoPicker;
}(_react.Component);

exports['default'] = PhotoPicker;