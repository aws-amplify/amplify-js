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

var logger = new _awsAmplify.Logger('GoogleProvider');

var GoogleProvider = function (_Component) {
    _inherits(GoogleProvider, _Component);

    function GoogleProvider(props) {
        _classCallCheck(this, GoogleProvider);

        var _this = _possibleConstructorReturn(this, (GoogleProvider.__proto__ || Object.getPrototypeOf(GoogleProvider)).call(this, props));

        _this.initGapi = _this.initGapi.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.federatedSignIn = _this.federatedSignIn.bind(_this);

        _this.state = {
            ga: null
        };
        return _this;
    }

    _createClass(GoogleProvider, [{
        key: 'signIn',
        value: function () {
            function signIn() {
                var _this2 = this;

                var onStateChange = this.props.onStateChange;
                var ga = this.state.ga;

                ga.signIn().then(function (googleUser) {
                    return _this2.federatedSignIn(googleUser);
                }).then(function (crednetials) {
                    if (onStateChange) {
                        onStateChange('signedIn');
                    }
                });
            }

            return signIn;
        }()
    }, {
        key: 'federatedSignIn',
        value: function () {
            function federatedSignIn(googleUser) {
                var _googleUser$getAuthRe = googleUser.getAuthResponse(),
                    id_token = _googleUser$getAuthRe.id_token;

                var profile = googleUser.getBasicProfile();
                var user = {
                    email: profile.getEmail(),
                    name: profile.getName()
                };
                return _awsAmplify.Auth.federatedSignIn('google', id_token, user);
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
        key: 'createScript',
        value: function () {
            function createScript() {
                var script = document.createElement('script');
                script.src = 'https://apis.google.com/js/platform.js';
                script.async = true;
                script.onload = this.initGapi;
                document.body.appendChild(script);
            }

            return createScript;
        }()
    }, {
        key: 'initGapi',
        value: function () {
            function initGapi() {
                logger.debug('init gapi');
                var that = this;
                var g = window.gapi;
                var client_id = this.props.client_id;

                g.load('auth2', function () {
                    g.auth2.init({
                        client_id: client_id,
                        scope: 'profile email openid'
                    }).then(function (ga) {
                        that.setState({ ga: ga });
                    });
                });
            }

            return initGapi;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var ga = this.state.ga;


                var theme = this.props.theme || _AmplifyTheme2['default'];
                return _react2['default'].createElement(
                    'button',
                    { onClick: this.signIn, disabled: !ga, style: theme.providerButton },
                    'Google'
                );
            }

            return render;
        }()
    }]);

    return GoogleProvider;
}(_react.Component);

exports['default'] = GoogleProvider;