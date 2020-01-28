// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
// tslint:enable
import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { includes, composePhoneNumber } from '../common';
import { UsernameAttributes } from '../types';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-container\" *ngIf=\"_show\">\n  <div class=\"amplify-form-container\" data-test=\"" + auth.signIn.section + "\">\n    <div class=\"amplify-form-body\" data-test=\"" + auth.signIn.bodySection + "\">\n      <div class=\"amplify-form-header\" data-test=\"" + auth.signIn.headerSection + "\">\n        {{ this.amplifyService.i18n().get('Sign in to your account') }}\n      </div>\n      <amplify-auth-username-field-core\n        [usernameAttributes]=\"_usernameAttributes\"\n        (usernameFieldChanged)=\"onUsernameFieldChanged($event)\"\n      ></amplify-auth-username-field-core>\n      <div class=\"amplify-form-row amplify-signin-password\">\n        <label class=\"amplify-input-label\" for=\"passwordField\">\n          {{ this.amplifyService.i18n().get('Password *') }}\n        </label>\n        <input #passwordField\n          (keyup)=\"setPassword(passwordField.value)\"\n          (keyup.enter)=\"onSignIn()\"\n          class=\"amplify-form-input\"\n          type=\"password\"\n          required\n          placeholder=\"{{ this.amplifyService.i18n().get('Enter your password') }}\"\n          data-test=\"" + auth.signIn.passwordInput + "\"\n        />\n        <span class=\"amplify-form-action\" *ngIf=\"!shouldHide('ForgotPassword')\">\n          {{ this.amplifyService.i18n().get('Forgot Password?') }}\n          <a class=\"amplify-form-link\"\n            (click)=\"onForgotPassword()\"\n            data-test=\"" + auth.signIn.forgotPasswordLink + "\"\n          >{{ this.amplifyService.i18n().get('Reset password') }}</a>\n        </span>\n      </div>\n      <div class=\"amplify-form-actions\">\n        <div class=\"amplify-form-cell-right\">\n          <button class=\"amplify-form-button\"\n            (click)=\"onSignIn()\"\n            data-test=\"" + auth.signIn.signInButton + "\"\n          >{{ this.amplifyService.i18n().get('Sign In') }}</button>\n        </div>\n        <div class=\"amplify-form-cell-left\" *ngIf=\"!shouldHide('SignUp')\">\n          <div class=\"amplify-form-signup\">\n            {{ this.amplifyService.i18n().get('No account?') }}\n            <a\n              class=\"amplify-form-link\"\n              (click)=\"onSignUp()\"\n              data-test=\"" + auth.signIn.createAccountLink + "\"\n              >\n              {{ this.amplifyService.i18n().get('Create account') }}\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div\n        class=\"amplify-alert-message\"\n        data-test=\"" + auth.signIn.signInError + "\"\n        >\n          {{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var SignInComponentCore = /** @class */ (function () {
    function SignInComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._usernameAttributes = 'username';
        this.local_phone_number = '';
        this.country_code = '1';
        this.email = '';
        this.signInUsername = '';
        this.hide = [];
        this.logger = this.amplifyService.logger('SignInComponent');
        this.onUsernameFieldChanged = this.onUsernameFieldChanged.bind(this);
    }
    Object.defineProperty(SignInComponentCore.prototype, "data", {
        set: function (data) {
            this.hide = data.hide ? data.hide : this.hide;
            this._usernameAttributes = data.usernameAttributes;
            this._authState = data.authState;
            this._show = includes(['signIn', 'signedOut', 'signedUp'], data.authState.state);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignInComponentCore.prototype, "authState", {
        set: function (authState) {
            this._authState = authState;
            this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);
            this.username = authState.user ? authState.user.username || '' : '';
            this.email = authState.user ? authState.user.email || '' : '';
            this.country_code =
                authState.user && authState.user.country_code
                    ? authState.user.country_code
                    : this.country_code;
            this.local_phone_number = authState.user
                ? authState.user.local_phone_number || ''
                : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignInComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes;
        },
        enumerable: true,
        configurable: true
    });
    SignInComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
    };
    SignInComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    SignInComponentCore.prototype.setUsername = function (username) {
        this.username = username;
    };
    SignInComponentCore.prototype.setPassword = function (password) {
        this.password = password;
    };
    SignInComponentCore.prototype.onSignIn = function () {
        var _this = this;
        this.amplifyService
            .auth()
            .signIn(this.getSignInUsername(), this.password)
            .then(function (user) {
            if (user['challengeName'] === 'SMS_MFA' ||
                user['challengeName'] === 'SOFTWARE_TOKEN_MFA') {
                _this.amplifyService.setAuthState({ state: 'confirmSignIn', user: user });
            }
            else if (user['challengeName'] === 'NEW_PASSWORD_REQUIRED') {
                _this.amplifyService.setAuthState({
                    state: 'requireNewPassword',
                    user: user,
                });
            }
            else if (user['challengeName'] === 'CUSTOM_CHALLENGE' &&
                user.challengeParam &&
                user.challengeParam.trigger === 'true') {
                _this.amplifyService.setAuthState({
                    state: 'customConfirmSignIn',
                    user: user,
                });
            }
        })
            .catch(function (err) {
            _this._setError(err);
        });
    };
    SignInComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    SignInComponentCore.prototype.getUserObj = function () {
        var user = this.username || this.email || this.local_phone_number
            ? {
                username: this.username,
                email: this.email,
                local_phone_number: this.local_phone_number,
                courtry_code: this.country_code,
            }
            : null;
        return user;
    };
    SignInComponentCore.prototype.onForgotPassword = function () {
        var user = this.getUserObj();
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'forgotPassword', user: user });
    };
    SignInComponentCore.prototype.onSignUp = function () {
        var user = this.getUserObj();
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signUp', user: user });
    };
    SignInComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
        this.logger.error(this.errorMessage);
    };
    SignInComponentCore.prototype.onUsernameFieldChanged = function (event) {
        this.email = event.email || this.email;
        this.username = event.username || this.username;
        this.country_code = event.country_code || this.country_code;
        this.local_phone_number =
            event.local_phone_number || this.local_phone_number;
    };
    SignInComponentCore.prototype.getSignInUsername = function () {
        switch (this._usernameAttributes) {
            case UsernameAttributes.EMAIL:
                return this.email;
            case UsernameAttributes.PHONE_NUMBER:
                return composePhoneNumber(this.country_code, this.local_phone_number);
            default:
                return this.username;
        }
    };
    SignInComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-sign-in-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    SignInComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    SignInComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "hide": [{ type: Input },],
        "authState": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
    };
    return SignInComponentCore;
}());
export { SignInComponentCore };
//# sourceMappingURL=sign-in.component.core.js.map