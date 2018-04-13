'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _awsAmplify2 = _interopRequireDefault(_awsAmplify);

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = new _awsAmplify.Logger('AuthStateWrapper');

var AuthStateWrapper = function (_Component) {
    _inherits(AuthStateWrapper, _Component);

    function AuthStateWrapper(props) {
        _classCallCheck(this, AuthStateWrapper);

        var _this = _possibleConstructorReturn(this, (AuthStateWrapper.__proto__ || Object.getPrototypeOf(AuthStateWrapper)).call(this, props));

        _this.handleStateChange = _this.handleStateChange.bind(_this);
        _this.handleAuthEvent = _this.handleAuthEvent.bind(_this);
        _this.checkUser = _this.checkUser.bind(_this);

        _this.state = { auth: props.authState || 'signIn' };
        return _this;
    }

    _createClass(AuthStateWrapper, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var config = this.props.amplifyConfig;
            if (config) {
                _awsAmplify2.default.configure(config);
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.checkUser();
        }
    }, {
        key: 'handleStateChange',
        value: function handleStateChange(state, data) {
            logger.debug('authStateWrapper state change ' + state, data);
            if (state === this.state.auth) {
                return;
            }

            if (state === 'signedOut') {
                state = 'signIn';
            }
            this.setState({ auth: state, authData: data, error: null });
            if (this.props.onStateChange) {
                this.props.onStateChange(state, data);
            }
        }
    }, {
        key: 'handleAuthEvent',
        value: function handleAuthEvent(state, event) {
            if (event.type === 'error') {
                this.setState({ error: event.data });
            }
        }
    }, {
        key: 'checkUser',
        value: function checkUser() {
            var _this2 = this;

            return _awsAmplify.Auth.currentUser().then(function (user) {
                var state = user ? 'signedIn' : 'signIn';
                _this2.handleStateChange(state, user);
            }).catch(function (err) {
                return logger.error(err);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _state = this.state,
                auth = _state.auth,
                authData = _state.authData;

            var theme = this.props.theme || _AmplifyTheme2.default;
            var render_children = _react2.default.Children.map(this.props.children, function (child) {
                if (!child) {
                    return null;
                }
                return _react2.default.cloneElement(child, {
                    authState: auth,
                    authData: authData,
                    theme: theme,
                    onStateChange: _this3.handleStateChange,
                    onAuthEvent: _this3.handleAuthEvent
                });
            });

            return _react2.default.createElement(
                'div',
                { className: 'amplify-state-wrapper', style: theme.stateWrapper },
                render_children,
                this.state.error && _react2.default.createElement(
                    'div',
                    {
                        className: 'amplify-error-section',
                        style: theme.errorSection
                    },
                    this.state.error
                )
            );
        }
    }]);

    return AuthStateWrapper;
}(_react.Component);

exports.default = AuthStateWrapper;