'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OAuthButton = exports.withOAuth = exports.AmazonButton = exports.withAmazon = exports.FacebookButton = exports.withFacebook = exports.GoogleButton = exports.withGoogle = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _withGoogle = require('./withGoogle');

Object.defineProperty(exports, 'withGoogle', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_withGoogle).default;
    }
});
Object.defineProperty(exports, 'GoogleButton', {
    enumerable: true,
    get: function get() {
        return _withGoogle.GoogleButton;
    }
});

var _withFacebook = require('./withFacebook');

Object.defineProperty(exports, 'withFacebook', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_withFacebook).default;
    }
});
Object.defineProperty(exports, 'FacebookButton', {
    enumerable: true,
    get: function get() {
        return _withFacebook.FacebookButton;
    }
});

var _withAmazon = require('./withAmazon');

Object.defineProperty(exports, 'withAmazon', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_withAmazon).default;
    }
});
Object.defineProperty(exports, 'AmazonButton', {
    enumerable: true,
    get: function get() {
        return _withAmazon.AmazonButton;
    }
});

var _withOAuth = require('./withOAuth');

Object.defineProperty(exports, 'withOAuth', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_withOAuth).default;
    }
});
Object.defineProperty(exports, 'OAuthButton', {
    enumerable: true,
    get: function get() {
        return _withOAuth.OAuthButton;
    }
});
exports.withFederated = withFederated;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _withGoogle2 = _interopRequireDefault(_withGoogle);

var _withFacebook2 = _interopRequireDefault(_withFacebook);

var _withAmazon2 = _interopRequireDefault(_withAmazon);

var _withOAuth2 = _interopRequireDefault(_withOAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function withFederated(Comp) {
    var Federated = (0, _withOAuth2.default)((0, _withAmazon2.default)((0, _withGoogle2.default)((0, _withFacebook2.default)(Comp))));

    return function (_Component) {
        _inherits(_class, _Component);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                var federated = this.props.federated || {};
                return _react2.default.createElement(Federated, _extends({}, this.props, federated));
            }
        }]);

        return _class;
    }(_react.Component);
}