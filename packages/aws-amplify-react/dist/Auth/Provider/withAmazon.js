'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AmazonButton = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = withAmazon;

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

var logger = new _awsAmplify.Logger('withAmazon');

function withAmazon(Comp) {
    return function (_Component) {
        _inherits(_class, _Component);

        function _class(props) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

            _this.initAmazon = _this.initAmazon.bind(_this);
            _this.signIn = _this.signIn.bind(_this);
            _this.federatedSignIn = _this.federatedSignIn.bind(_this);

            _this.state = {};
            return _this;
        }

        _createClass(_class, [{
            key: 'signIn',
            value: function signIn() {
                var _this2 = this;

                var amz = window.amazon;
                var options = { scope: 'profile' };
                amz.Login.authorize(options, function (response) {
                    if (response.error) {
                        logger.debug('Failed to login with amazon: ' + response.error);
                        return;
                    }

                    _this2.federatedSignIn(response);
                });
            }
        }, {
            key: 'federatedSignIn',
            value: function federatedSignIn(response) {
                var access_token = response.access_token,
                    expires_in = response.expires_in;
                var onStateChange = this.props.onStateChange;

                var date = new Date();
                var expires_at = expires_in * 1000 + date.getTime();
                if (!access_token) {
                    return;
                }

                var amz = window.amazon;
                amz.Login.retrieveProfile(function (userInfo) {
                    if (!userInfo.success) {
                        logger.debug('Get user Info failed');
                        return;
                    }

                    var user = {
                        name: userInfo.profile.Name
                    };

                    _awsAmplify.Auth.federatedSignIn('amazon', { token: access_token, expires_at: expires_at }, user).then(function (credentials) {
                        logger.debug('getting credentials');
                        logger.debug(credentials);
                        if (onStateChange) {
                            onStateChange('signedIn');
                        }
                    });
                });
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                var amazon_client_id = this.props.amazon_client_id;

                if (amazon_client_id) this.createScript();
            }
        }, {
            key: 'createScript',
            value: function createScript() {
                var script = document.createElement('script');
                script.src = 'https://api-cdn.amazon.com/sdk/login1.js';
                script.async = true;
                script.onload = this.initAmazon;
                document.body.appendChild(script);
            }
        }, {
            key: 'initAmazon',
            value: function initAmazon() {
                logger.debug('init amazon');
                var amazon_client_id = this.props.amazon_client_id;

                var amz = window.amazon;
                amz.Login.setClientId(amazon_client_id);
            }
        }, {
            key: 'render',
            value: function render() {
                var amz = window.amazon;
                return _react2.default.createElement(Comp, _extends({}, this.props, { amz: amz, amazonSignIn: this.signIn }));
            }
        }]);

        return _class;
    }(_react.Component);
}

var Button = function Button(props) {
    return _react2.default.createElement(
        _AmplifyUI.SignInButton,
        {
            id: 'amazon_signin_btn',
            onClick: props.amazonSignIn,
            theme: props.theme || _AmplifyTheme2.default
        },
        'Sign In with Amazon'
    );
};

var AmazonButton = exports.AmazonButton = withAmazon(Button);