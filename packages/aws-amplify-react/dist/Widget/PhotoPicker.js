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

var Picker = {};

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

var logger = new _awsAmplify.Logger('PhotoPicker');

var PhotoPicker = function (_Component) {
    _inherits(PhotoPicker, _Component);

    function PhotoPicker(props) {
        _classCallCheck(this, PhotoPicker);

        var _this = _possibleConstructorReturn(this, (PhotoPicker.__proto__ || Object.getPrototypeOf(PhotoPicker)).call(this, props));

        _this.state = {
            previewSrc: props.previewSrc
        };
        return _this;
    }

    _createClass(PhotoPicker, [{
        key: 'handleInput',
        value: function () {
            function handleInput(e) {
                var that = this;

                var file = e.target.files[0];
                var name = file.name,
                    size = file.size,
                    type = file.type;

                logger.debug(file);

                var _props = this.props,
                    preview = _props.preview,
                    onPick = _props.onPick,
                    onLoad = _props.onLoad;


                if (onPick) {
                    onPick({
                        file: file,
                        name: name,
                        size: size,
                        type: type
                    });
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

            return handleInput;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var _this2 = this;

                var preview = this.props.preview;
                var previewSrc = this.state.previewSrc;


                var title = this.props.title || 'Pick a Photo';

                var theme = this.props.theme || _AmplifyTheme2['default'];
                var containerStyle = Object.assign({}, Picker, theme.photoPicker);
                var previewStyle = Object.assign({}, PickerPreview, theme.photoPickerPreview, preview && preview !== 'hidden' ? {} : _AmplifyTheme2['default'].hidden);
                var pickerStyle = Object.assign({}, PickerPicker, theme.photoPickerPicker);
                var buttonStyle = Object.assign({}, PickerButton, theme.photoPickerButton);
                var inputStyle = Object.assign({}, PickerInput, theme.photoPickerInput);

                return _react2['default'].createElement(
                    'div',
                    { style: containerStyle },
                    previewSrc ? _react2['default'].createElement('img', { src: previewSrc, style: previewStyle }) : null,
                    _react2['default'].createElement(
                        'div',
                        { style: pickerStyle },
                        _react2['default'].createElement(
                            'button',
                            { style: buttonStyle },
                            _awsAmplify.I18n.get(title)
                        ),
                        _react2['default'].createElement('input', {
                            title: _awsAmplify.I18n.get(title),
                            type: 'file', accept: 'image/*',
                            style: inputStyle,
                            onChange: function () {
                                function onChange(e) {
                                    return _this2.handleInput(e);
                                }

                                return onChange;
                            }()
                        })
                    )
                );
            }

            return render;
        }()
    }]);

    return PhotoPicker;
}(_react.Component);

exports['default'] = PhotoPicker;