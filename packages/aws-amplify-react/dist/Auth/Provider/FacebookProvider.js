'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = new _awsAmplify.Logger('FacebookProvider');

var FacebookProvider = function (_Component) {
    _inherits(FacebookProvider, _Component);

    function FacebookProvider(props) {
        _classCallCheck(this, FacebookProvider);

        var _this = _possibleConstructorReturn(this, (FacebookProvider.__proto__ || Object.getPrototypeOf(FacebookProvider)).call(this, props));

        _this.fbAsyncInit = _this.fbAsyncInit.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.federatedSignIn = _this.federatedSignIn.bind(_this);

        _this.state = {
            fb: null
        };
        return _this;
    }

    _createClass(FacebookProvider, [{
        key: 'signIn',
        value: function () {
            function signIn() {
                var _this2 = this;

                var onStateChange = this.props.onStateChange;
                var fb = this.state.fb;


                fb.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        _this2.federatedSignIn(response);
                    } else {
                        fb.login(function (response) {
                            _this2.federatedSignIn(response);
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
                var accessToken = response.accessToken;
                var fb = this.state.fb;

                fb.api('/me', function (response) {
                    var user = {
                        name: response.name
                    };
                    _awsAmplify.Auth.federatedSignIn('facebook', accessToken, user);
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
                var fb = window.FB;
                fb.init({
                    appId: '135624433767268',
                    cookie: true,
                    xfbml: true,
                    version: 'v2.11'
                });

                fb.getLoginStatus(function (response) {
                    return logger.debug(response);
                });
                this.setState({ fb: fb });
            }

            return fbAsyncInit;
        }()
    }, {
        key: 'createScript',
        value: function () {
            function createScript() {
                window.fbAsyncInit = this.fbAsyncInit;

                var script = document.createElement('script');
                script.src = 'https://connect.facebook.net/en_US/sdk.js';
                script.async = true;
                document.body.appendChild(script);
            }

            return createScript;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var fb = this.state.fb;


                var theme = this.props.theme || _AmplifyTheme2['default'];
                return _react2['default'].createElement(
                    'button',
                    { onClick: this.signIn, disabled: !fb, style: theme.providerButton },
                    'Facebook'
                );
            }

            return render;
        }()
    }]);

    return FacebookProvider;
}(_react.Component);

exports['default'] = FacebookProvider;