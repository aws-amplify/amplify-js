'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AuthenticatorWrapper = exports.TOTPSetup = exports.FederatedButtons = exports.FederatedSignIn = exports.Greetings = exports.ForgotPassword = exports.VerifyContact = exports.ConfirmSignUp = exports.SignUp = exports.RequireNewPassword = exports.ConfirmSignIn = exports.SignIn = exports.AuthPiece = exports.Authenticator = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Authenticator = require('./Authenticator');

Object.defineProperty(exports, 'Authenticator', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_Authenticator).default;
    }
});

var _AuthPiece = require('./AuthPiece');

Object.defineProperty(exports, 'AuthPiece', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_AuthPiece).default;
    }
});

var _SignIn = require('./SignIn');

Object.defineProperty(exports, 'SignIn', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_SignIn).default;
    }
});

var _ConfirmSignIn = require('./ConfirmSignIn');

Object.defineProperty(exports, 'ConfirmSignIn', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_ConfirmSignIn).default;
    }
});

var _RequireNewPassword = require('./RequireNewPassword');

Object.defineProperty(exports, 'RequireNewPassword', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_RequireNewPassword).default;
    }
});

var _SignUp = require('./SignUp');

Object.defineProperty(exports, 'SignUp', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_SignUp).default;
    }
});

var _ConfirmSignUp = require('./ConfirmSignUp');

Object.defineProperty(exports, 'ConfirmSignUp', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_ConfirmSignUp).default;
    }
});

var _VerifyContact = require('./VerifyContact');

Object.defineProperty(exports, 'VerifyContact', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_VerifyContact).default;
    }
});

var _ForgotPassword = require('./ForgotPassword');

Object.defineProperty(exports, 'ForgotPassword', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_ForgotPassword).default;
    }
});

var _Greetings = require('./Greetings');

Object.defineProperty(exports, 'Greetings', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_Greetings).default;
    }
});

var _FederatedSignIn = require('./FederatedSignIn');

Object.defineProperty(exports, 'FederatedSignIn', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_FederatedSignIn).default;
    }
});
Object.defineProperty(exports, 'FederatedButtons', {
    enumerable: true,
    get: function get() {
        return _FederatedSignIn.FederatedButtons;
    }
});

var _TOTPSetup = require('./TOTPSetup');

Object.defineProperty(exports, 'TOTPSetup', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_TOTPSetup).default;
    }
});

var _Provider = require('./Provider');

Object.keys(_Provider).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
            return _Provider[key];
        }
    });
});
exports.withAuthenticator = withAuthenticator;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Authenticator2 = _interopRequireDefault(_Authenticator);

var _Greetings2 = _interopRequireDefault(_Greetings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * the License. A copy of the License is located at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *     http://aws.amazon.com/apache2.0/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * and limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function withAuthenticator(Comp) {
    var includeGreetings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var authenticatorComponents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    return function (_Component) {
        _inherits(_class, _Component);

        function _class(props) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

            _this.handleAuthStateChange = _this.handleAuthStateChange.bind(_this);

            _this.state = {
                authState: props.authState || null,
                authData: props.authData || null
            };
            return _this;
        }

        _createClass(_class, [{
            key: 'handleAuthStateChange',
            value: function handleAuthStateChange(state, data) {
                this.setState({ authState: state, authData: data });
            }
        }, {
            key: 'render',
            value: function render() {
                var _state = this.state,
                    authState = _state.authState,
                    authData = _state.authData;

                var signedIn = authState === 'signedIn';
                if (signedIn) {
                    return _react2.default.createElement(
                        'div',
                        null,
                        includeGreetings ? _react2.default.createElement(_Greetings2.default, {
                            authState: authState,
                            authData: authData,
                            onStateChange: this.handleAuthStateChange
                        }) : null,
                        _react2.default.createElement(Comp, _extends({}, this.props, {
                            authState: authState,
                            authData: authData,
                            onStateChange: this.handleAuthStateChange
                        }))
                    );
                }

                return _react2.default.createElement(_Authenticator2.default, _extends({}, this.props, {
                    hideDefault: authenticatorComponents.length > 0,
                    onStateChange: this.handleAuthStateChange,
                    children: authenticatorComponents
                }));
            }
        }]);

        return _class;
    }(_react.Component);
}

var AuthenticatorWrapper = exports.AuthenticatorWrapper = function (_Component2) {
    _inherits(AuthenticatorWrapper, _Component2);

    function AuthenticatorWrapper(props) {
        _classCallCheck(this, AuthenticatorWrapper);

        var _this2 = _possibleConstructorReturn(this, (AuthenticatorWrapper.__proto__ || Object.getPrototypeOf(AuthenticatorWrapper)).call(this, props));

        _this2.state = { auth: 'init' };

        _this2.handleAuthState = _this2.handleAuthState.bind(_this2);
        return _this2;
    }

    _createClass(AuthenticatorWrapper, [{
        key: 'handleAuthState',
        value: function handleAuthState(state, data) {
            this.setState({ auth: state, authData: data });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_Authenticator2.default, _extends({}, this.props, { onStateChange: this.handleAuthState })),
                this.props.children(this.state.auth)
            );
        }
    }]);

    return AuthenticatorWrapper;
}(_react.Component);

AuthenticatorWrapper.propTypes = {
    children: _propTypes2.default.func.isRequired
};