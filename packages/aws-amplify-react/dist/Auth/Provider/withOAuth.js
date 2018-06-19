'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OAuthButton = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = withOAuth;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../../AmplifyUI');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = new _awsAmplify.Logger('withOAuth');

function withOAuth(Comp, options) {
    return function (_Component) {
        _inherits(_class, _Component);

        function _class(props) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

            _this.signIn = _this.signIn.bind(_this);
            return _this;
        }

        _createClass(_class, [{
            key: 'signIn',
            value: function signIn() {
                var config = this.props.oauth_config || options || _awsAmplify.Auth.configure().oauth;
                logger.debug('withOAuth configuration', config);
                var domain = config.domain,
                    redirectSignIn = config.redirectSignIn,
                    redirectSignOut = config.redirectSignOut,
                    responseType = config.responseType;


                var options = config.options || {};
                var url = 'https://' + domain + '/login?redirect_uri=' + redirectSignIn + '&response_type=' + responseType + '&client_id=' + (options.ClientId || _awsAmplify.Auth.configure().userPoolWebClientId);
                window.location.assign(url);
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2.default.createElement(Comp, _extends({}, this.props, { OAuthSignIn: this.signIn }));
            }
        }]);

        return _class;
    }(_react.Component);
}

var Button = function Button(props) {
    return _react2.default.createElement(
        _AmplifyUI.SignInButton,
        {
            id: 'OAuth_signin_btn',
            onClick: props.OAuthSignIn,
            theme: props.theme || _AmplifyTheme2.default
        },
        props.label || 'Sign in with AWS'
    );
};

var OAuthButton = exports.OAuthButton = withOAuth(Button);