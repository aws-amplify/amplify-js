'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FacebookButton = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports['default'] = withFacebook;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../../AmplifyUI');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = new _awsAmplify.Logger('withFacebook');

function withFacebook(Comp) {
    return function (_Component) {
        _inherits(_class, _Component);

        function _class(props) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

            _this.fbAsyncInit = _this.fbAsyncInit.bind(_this);
            _this.initFB = _this.initFB.bind(_this);
            _this.signIn = _this.signIn.bind(_this);
            _this.federatedSignIn = _this.federatedSignIn.bind(_this);

            _this.state = {};
            return _this;
        }

        _createClass(_class, [{
            key: 'signIn',
            value: function () {
                function signIn() {
                    var _this2 = this;

                    var fb = window.FB;

                    fb.getLoginStatus(function (response) {
                        if (response.status === 'connected') {
                            _this2.federatedSignIn(response.authResponse);
                        } else {
                            fb.login(function (response) {
                                if (!response || !response.authResponse) {
                                    return;
                                }
                                _this2.federatedSignIn(response.authResponse);
                            }, { scope: 'public_profile,email' });
                        }
                    });
                }

                return signIn;
            }()
        }, {
            key: 'federatedSignIn',
            value: function () {
                function federatedSignIn(response) {
                    logger.debug(response);
                    var onStateChange = this.props.onStateChange;
                    var accessToken = response.accessToken,
                        expiresIn = response.expiresIn;

                    var date = new Date();
                    var expires_at = expiresIn * 1000 + date.getTime();
                    if (!accessToken) {
                        return;
                    }

                    var fb = window.FB;
                    fb.api('/me', function (response) {
                        var user = {
                            name: response.name
                        };

                        _awsAmplify.Auth.federatedSignIn('facebook', { token: accessToken, expires_at: expires_at }, user).then(function (crednetials) {
                            if (onStateChange) {
                                onStateChange('signedIn');
                            }
                        });
                    });
                }

                return federatedSignIn;
            }()
        }, {
            key: 'componentDidMount',
            value: function () {
                function componentDidMount() {
                    this.createScript();
                }

                return componentDidMount;
            }()
        }, {
            key: 'fbAsyncInit',
            value: function () {
                function fbAsyncInit() {
                    logger.debug('init FB');

                    var facebook_app_id = this.props.facebook_app_id;

                    var fb = window.FB;
                    fb.init({
                        appId: facebook_app_id,
                        cookie: true,
                        xfbml: true,
                        version: 'v2.11'
                    });

                    fb.getLoginStatus(function (response) {
                        return logger.debug(response);
                    });
                }

                return fbAsyncInit;
            }()
        }, {
            key: 'initFB',
            value: function () {
                function initFB() {
                    var fb = window.FB;
                    logger.debug('FB inited');
                }

                return initFB;
            }()
        }, {
            key: 'createScript',
            value: function () {
                function createScript() {
                    window.fbAsyncInit = this.fbAsyncInit;

                    var script = document.createElement('script');
                    script.src = 'https://connect.facebook.net/en_US/sdk.js';
                    script.async = true;
                    script.onload = this.initFB;
                    document.body.appendChild(script);
                }

                return createScript;
            }()
        }, {
            key: 'render',
            value: function () {
                function render() {
                    var fb = window.FB;
                    return _react2['default'].createElement(Comp, _extends({}, this.props, { fb: fb, facebookSignIn: this.signIn }));
                }

                return render;
            }()
        }]);

        return _class;
    }(_react.Component);
}

var Button = function Button(props) {
    return _react2['default'].createElement(
        _AmplifyUI.SignInButton,
        {
            id: 'facebook_signin_btn',
            onClick: props.facebookSignIn,
            theme: props.theme || _AmplifyTheme2['default']
        },
        'Sign In with Facebook'
    );
};

var FacebookButton = exports.FacebookButton = withFacebook(Button);