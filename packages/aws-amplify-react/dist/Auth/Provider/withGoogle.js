'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GoogleButton = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = withGoogle;

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

var logger = new _awsAmplify.Logger('withGoogle');

function withGoogle(Comp) {
    return function (_Component) {
        _inherits(_class, _Component);

        function _class(props) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

            _this.initGapi = _this.initGapi.bind(_this);
            _this.signIn = _this.signIn.bind(_this);
            _this.federatedSignIn = _this.federatedSignIn.bind(_this);

            _this.state = {};
            return _this;
        }

        _createClass(_class, [{
            key: 'signIn',
            value: function signIn() {
                var _this2 = this;

                var ga = window.gapi.auth2.getAuthInstance();
                var onError = this.props.onError;

                ga.signIn().then(function (googleUser) {
                    return _this2.federatedSignIn(googleUser);
                }, function (error) {
                    if (onError) onError(error);else throw error;
                });
            }
        }, {
            key: 'federatedSignIn',
            value: function federatedSignIn(googleUser) {
                var _googleUser$getAuthRe = googleUser.getAuthResponse(),
                    id_token = _googleUser$getAuthRe.id_token,
                    expires_at = _googleUser$getAuthRe.expires_at;

                var profile = googleUser.getBasicProfile();
                var user = {
                    email: profile.getEmail(),
                    name: profile.getName()
                };

                var onStateChange = this.props.onStateChange;

                return _awsAmplify.Auth.federatedSignIn('google', { token: id_token, expires_at: expires_at }, user).then(function (credentials) {
                    if (onStateChange) {
                        onStateChange('signedIn');
                    }
                });
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                var google_client_id = this.props.google_client_id;

                if (google_client_id) this.createScript();
            }
        }, {
            key: 'createScript',
            value: function createScript() {
                var script = document.createElement('script');
                script.src = 'https://apis.google.com/js/platform.js';
                script.async = true;
                script.onload = this.initGapi;
                document.body.appendChild(script);
            }
        }, {
            key: 'initGapi',
            value: function initGapi() {
                logger.debug('init gapi');

                var that = this;
                var google_client_id = this.props.google_client_id;

                var g = window.gapi;
                g.load('auth2', function () {
                    g.auth2.init({
                        client_id: google_client_id,
                        scope: 'profile email openid'
                    });
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var ga = window.gapi && window.gapi.auth2 ? window.gapi.auth2.getAuthInstance() : null;
                return _react2.default.createElement(Comp, _extends({}, this.props, { ga: ga, googleSignIn: this.signIn }));
            }
        }]);

        return _class;
    }(_react.Component);
}

var Button = function Button(props) {
    return _react2.default.createElement(
        _AmplifyUI.SignInButton,
        {
            id: 'google_signin_btn',
            onClick: props.googleSignIn,
            theme: props.theme || _AmplifyTheme2.default
        },
        'Sign In with Google'
    );
};

var GoogleButton = exports.GoogleButton = withGoogle(Button);