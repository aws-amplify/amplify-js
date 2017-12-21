'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AuthPiece2 = require('./AuthPiece');

var _AuthPiece3 = _interopRequireDefault(_AuthPiece2);

var _AmplifyUI = require('../AmplifyUI');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var logger = new _awsAmplify.Logger('Greetings');

var Greetings = function (_AuthPiece) {
    _inherits(Greetings, _AuthPiece);

    function Greetings(props) {
        _classCallCheck(this, Greetings);

        var _this = _possibleConstructorReturn(this, (Greetings.__proto__ || Object.getPrototypeOf(Greetings)).call(this, props));

        _this.signOut = _this.signOut.bind(_this);
        _this.checkUser = _this.checkUser.bind(_this);
        _this.onHubCapsule = _this.onHubCapsule.bind(_this);

        _this.state = {
            authState: props.authState,
            authData: props.authData
        };

        _awsAmplify.Hub.listen('auth', _this);
        return _this;
    }

    _createClass(Greetings, [{
        key: 'componentDidMount',
        value: function () {
            function componentDidMount() {
                this._isMounted = true;
                this.checkUser();
            }

            return componentDidMount;
        }()
    }, {
        key: 'componentWillUnmount',
        value: function () {
            function componentWillUnmount() {
                this._isMounted = false;
            }

            return componentWillUnmount;
        }()
    }, {
        key: 'signOut',
        value: function () {
            function signOut() {
                var _this2 = this;

                _awsAmplify.Auth.signOut().then(function () {
                    return _this2.changeState('signedOut');
                })['catch'](function (err) {
                    logger.error(err);_this2.error(err);
                });
            }

            return signOut;
        }()
    }, {
        key: 'checkUser',
        value: function () {
            function checkUser() {
                var _this3 = this;

                var that = this;
                var authState = this.state.authState;

                return _awsAmplify.Auth.currentAuthenticatedUser().then(function (user) {
                    if (!that._isMounted) {
                        return;
                    }
                    if (authState !== 'signedIn') {
                        _this3.setState({
                            authState: 'signedIn',
                            authData: user
                        });
                        _this3.changeState('signedIn', user);
                    }
                })['catch'](function (err) {
                    if (!that._isMounted) {
                        return;
                    }
                    if (!authState || authState === 'signedIn') {
                        _this3.setState({ authState: 'signIn' });
                        _this3.changeState('signIn');
                    }
                });
            }

            return checkUser;
        }()
    }, {
        key: 'onHubCapsule',
        value: function () {
            function onHubCapsule(capsule) {
                var channel = capsule.channel,
                    payload = capsule.payload,
                    source = capsule.source;

                if (channel === 'auth') {
                    this.checkUser();
                }
            }

            return onHubCapsule;
        }()
    }, {
        key: 'inGreeting',
        value: function () {
            function inGreeting(name) {
                return 'Hello ' + name;
            }

            return inGreeting;
        }()
    }, {
        key: 'outGreeting',
        value: function () {
            function outGreeting() {
                return '';
            }

            return outGreeting;
        }()
    }, {
        key: 'userGreetings',
        value: function () {
            function userGreetings(theme) {
                var user = this.state.authData;
                var greeting = this.props.inGreeting || this.inGreeting;
                var name = user.name || user.username;
                var message = typeof greeting === 'function' ? greeting(name) : greeting;
                return _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(
                        _AmplifyUI.NavItem,
                        { theme: theme },
                        message
                    ),
                    _react2['default'].createElement(
                        _AmplifyUI.NavButton,
                        {
                            theme: theme,
                            onClick: this.signOut
                        },
                        _awsAmplify.I18n.get('Sign Out')
                    )
                );
            }

            return userGreetings;
        }()
    }, {
        key: 'noUserGreetings',
        value: function () {
            function noUserGreetings(theme) {
                var greeting = this.props.outGreeting || this.outGreeting;
                var message = typeof greeting === 'function' ? greeting() : greeting;
                return message ? _react2['default'].createElement(
                    _AmplifyUI.NavItem,
                    { theme: theme },
                    message
                ) : null;
            }

            return noUserGreetings;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var hide = this.props.hide;

                if (hide && hide.includes(Greetings)) {
                    return null;
                }

                var authState = this.state.authState;

                var signedIn = authState === 'signedIn';

                var theme = this.props.theme || _AmplifyTheme2['default'];
                var greeting = signedIn ? this.userGreetings(theme) : this.noUserGreetings(theme);
                if (!greeting) {
                    return null;
                }

                return _react2['default'].createElement(
                    _AmplifyUI.NavBar,
                    { theme: theme },
                    _react2['default'].createElement(
                        _AmplifyUI.Nav,
                        { theme: theme },
                        _react2['default'].createElement(
                            _AmplifyUI.NavRight,
                            { theme: theme },
                            greeting
                        )
                    )
                );
            }

            return render;
        }()
    }]);

    return Greetings;
}(_AuthPiece3['default']);

exports['default'] = Greetings;