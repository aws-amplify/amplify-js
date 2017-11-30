'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _Provider = require('./Provider');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = new _awsAmplify.Logger('SignInProvider');

var SignInProvider = function () {
    function SignInProvider() {
        _classCallCheck(this, SignInProvider);
    }

    _createClass(SignInProvider, [{
        key: 'google',
        value: function () {
            function google() {
                var _props = this.props,
                    google = _props.google,
                    google_client_id = _props.google_client_id,
                    onStateChange = _props.onStateChange;

                if (!google) {
                    return null;
                }

                if (!google_client_id) {
                    logger.warn('missing google_client_id in props');
                    return null;
                }

                var theme = this.props.theme || _AmplifyTheme2['default'];
                return _react2['default'].createElement(_Provider.GoogleProvider, {
                    client_id: google_client_id,
                    theme: theme,
                    onStateChange: onStateChange
                });
            }

            return google;
        }()
    }, {
        key: 'render',
        value: function () {
            function render() {
                var theme = this.props.theme || _AmplifyTheme2['default'];
                return _react2['default'].createElement(
                    'div',
                    { className: 'amplify-action-row', style: theme.actionRow },
                    this.google()
                );
            }

            return render;
        }()
    }]);

    return SignInProvider;
}();

exports['default'] = SignInProvider;