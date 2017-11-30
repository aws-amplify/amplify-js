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

var logger = new _awsAmplify.Logger('LinkedInProvider');

var LinkedInProvider = function (_Component) {
    _inherits(LinkedInProvider, _Component);

    function LinkedInProvider(props) {
        _classCallCheck(this, LinkedInProvider);

        var _this = _possibleConstructorReturn(this, (LinkedInProvider.__proto__ || Object.getPrototypeOf(LinkedInProvider)).call(this, props));

        _this.initIn = _this.initIn.bind(_this);
        _this.fullyLoaded = _this.fullyLoaded.bind(_this);
        _this.signIn = _this.signIn.bind(_this);
        _this.federatedSignIn = _this.federatedSignIn.bind(_this);

        _this.state = {
            IN: null,
            INLoaded: false
        };
        return _this;
    }

    _createClass(LinkedInProvider, [{
        key: 'signIn',
        value: function () {
            function signIn() {
                var onStateChange = this.props.onStateChange;
                var IN = this.state.IN;


                IN.User.authorize(function (data) {
                    console.log(data);
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
        key: 'createScript',
        value: function () {
            function createScript() {
                var that = this;
                window._in_onload = this.fullyLoaded;

                var script = document.createElement('script');
                script.src = 'http://platform.linkedin.com/in.js?async=true';
                script.async = true;
                script.onload = this.initIn;
                document.body.appendChild(script);
            }

            return createScript;
        }()
    }, {
        key: 'initIn',
        value: function () {
            function initIn() {
                logger.debug('init IN');
                var IN = window.IN;
                IN.init({
                    api_key: '869ihbi44tyuof',
                    authorize: true,
                    onLoad: '_in_onload'
                });
                this.setState({ IN: IN });
            }

            return initIn;
        }()
    }, {
        key: 'fullyLoaded',
        value: function () {
            function fullyLoaded() {
                logger.debug('fully loaded');
                this.setState({ INLoaded: true });
            }

            return fullyLoaded;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var _state = this.state,
                    IN = _state.IN,
                    INLoaded = _state.INLoaded;


                var theme = this.props.theme || _AmplifyTheme2['default'];
                return _react2['default'].createElement(
                    'button',
                    {
                        onClick: this.signIn,
                        disabled: !IN || !INLoaded,
                        style: theme.providerButton
                    },
                    'LinkedIn'
                );
            }

            return render;
        }()
    }]);

    return LinkedInProvider;
}(_react.Component);

exports['default'] = LinkedInProvider;