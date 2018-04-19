'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FederatedButtons = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../AmplifyUI');

var _Provider = require('./Provider');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = new _awsAmplify.Logger('FederatedSignIn');

var FederatedButtons = exports.FederatedButtons = function (_Component) {
    _inherits(FederatedButtons, _Component);

    function FederatedButtons() {
        _classCallCheck(this, FederatedButtons);

        return _possibleConstructorReturn(this, (FederatedButtons.__proto__ || Object.getPrototypeOf(FederatedButtons)).apply(this, arguments));
    }

    _createClass(FederatedButtons, [{
        key: 'google',
        value: function google(google_client_id) {
            if (!google_client_id) {
                return null;
            }

            var _props = this.props,
                theme = _props.theme,
                onStateChange = _props.onStateChange;

            return _react2.default.createElement(_Provider.GoogleButton, {
                google_client_id: google_client_id,
                theme: theme,
                onStateChange: onStateChange
            });
        }
    }, {
        key: 'facebook',
        value: function facebook(facebook_app_id) {
            if (!facebook_app_id) {
                return null;
            }

            var _props2 = this.props,
                theme = _props2.theme,
                onStateChange = _props2.onStateChange;

            return _react2.default.createElement(_Provider.FacebookButton, {
                facebook_app_id: facebook_app_id,
                theme: theme,
                onStateChange: onStateChange
            });
        }
    }, {
        key: 'amazon',
        value: function amazon(amazon_client_id) {
            if (!amazon_client_id) {
                return null;
            }

            var _props3 = this.props,
                theme = _props3.theme,
                onStateChange = _props3.onStateChange;

            return _react2.default.createElement(_Provider.AmazonButton, {
                amazon_client_id: amazon_client_id,
                theme: theme,
                onStateChange: onStateChange
            });
        }
    }, {
        key: 'OAuth',
        value: function OAuth(oauth_config) {
            if (!oauth_config) {
                return null;
            }
            var _props4 = this.props,
                theme = _props4.theme,
                onStateChange = _props4.onStateChange;

            return _react2.default.createElement(_Provider.OAuthButton, {
                label: oauth_config ? oauth_config.label : undefined,
                theme: theme,
                onStateChange: onStateChange
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var authState = this.props.authState;

            if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
                return null;
            }

            var federated = this.props.federated || {};
            var config = _awsAmplify.Auth.configure();
            if (config.oauth) {
                federated.oauth_config = Object.assign({}, federated.oauth_config, config.oauth);
            }

            if (_awsAmplify.JS.isEmpty(federated)) {
                return null;
            }

            var google_client_id = federated.google_client_id,
                facebook_app_id = federated.facebook_app_id,
                amazon_client_id = federated.amazon_client_id,
                oauth_config = federated.oauth_config;


            var theme = this.props.theme || _AmplifyTheme2.default;
            return _react2.default.createElement(
                _AmplifyUI.ActionRow,
                { theme: theme },
                this.google(google_client_id),
                this.facebook(facebook_app_id),
                this.amazon(amazon_client_id),
                this.OAuth(oauth_config)
            );
        }
    }]);

    return FederatedButtons;
}(_react.Component);

var FederatedSignIn = function (_Component2) {
    _inherits(FederatedSignIn, _Component2);

    function FederatedSignIn() {
        _classCallCheck(this, FederatedSignIn);

        return _possibleConstructorReturn(this, (FederatedSignIn.__proto__ || Object.getPrototypeOf(FederatedSignIn)).apply(this, arguments));
    }

    _createClass(FederatedSignIn, [{
        key: 'render',
        value: function render() {
            var _props5 = this.props,
                authState = _props5.authState,
                onStateChange = _props5.onStateChange;

            var federated = this.props.federated || {};
            var config = _awsAmplify.Auth.configure();
            if (config.oauth) {
                federated.oauth_config = Object.assign({}, federated.oauth_config, config.oauth);
            }

            if (!federated) {
                logger.debug('federated prop is empty. show nothing');
                logger.debug('federated={google_client_id: , facebook_app_id: , amazon_client_id}');
                return null;
            }
            if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
                return null;
            }
            logger.debug('federated Config is', federated);
            var theme = this.props.theme || _AmplifyTheme2.default;
            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    { theme: theme },
                    _react2.default.createElement(FederatedButtons, {
                        federated: federated,
                        theme: theme,
                        authState: authState,
                        onStateChange: onStateChange
                    })
                )
            );
        }
    }]);

    return FederatedSignIn;
}(_react.Component);

exports.default = FederatedSignIn;