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
import { labelMap } from '../common';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-container\" *ngIf=\"_show\">\n<div class=\"amplify-form-container\" data-test=\"" + auth.confirmSignUp.section + "\">\n  <div class=\"amplify-form-body\" data-test=\"" + auth.confirmSignUp.bodySection + "\">\n    <div\n      class=\"amplify-form-header\"\n      data-test=\"" + auth.confirmSignUp.headerSection + "\"\n    >\n      {{ this.amplifyService.i18n().get('Confirm Sign up') }}</div>\n    <div class=\"amplify-form-row\">\n      <label class=\"amplify-input-label\" for=\"amplifyUsername\">\n        {{ this.amplifyService.i18n().get(getUsernameLabel()) }}\n      </label>\n      <input\n        #amplifyUsername\n        class=\"amplify-form-input\"\n        type=\"text\"\n        disabled\n        placeholder=\"{{ this.amplifyService.i18n().get(getUsernameLabel()) }}\"\n        [value]=\"username\"\n        data-test=\"" + auth.confirmSignUp.usernameInput + "\"\n      />\n    </div>\n    <div class=\"amplify-form-row\">\n      <label class=\"amplify-input-label\" for=\"code\">\n        {{ this.amplifyService.i18n().get('Confirmation Code *') }}\n      </label>\n      <input #code\n        (change)=\"setCode(code.value)\"\n        (keyup)=\"setCode(code.value)\"\n        (keyup.enter)=\"onConfirm()\"\n        class=\"amplify-form-input\"\n        type=\"text\"\n        placeholder=\"{{ this.amplifyService.i18n().get('Enter your Code') }}\"\n        data-test=\"" + auth.confirmSignUp.confirmationCodeInput + "\"\n      />\n      <span class=\"amplify-form-action\">{{ this.amplifyService.i18n().get('Lost your code?') }}\n        <a class=\"amplify-form-link\"\n            (click)=\"onResend()\"\n            data-test=\"" + auth.confirmSignUp.resendCodeLink + "\"\n          >{{ this.amplifyService.i18n().get('Resend Code') }}</a></span>\n    </div>\n    <div class=\"amplify-form-actions\">\n      <div class=\"amplify-form-cell-left\">\n        <div class=\"amplify-form-actions-left\">\n          <a\n            class=\"amplify-form-link\"\n            (click)=\"onSignIn()\"\n            data-test=\"" + auth.confirmSignUp.backToSignInLink + "\"\n            >\n            {{ this.amplifyService.i18n().get('Back to Sign in') }}\n          </a>\n        </div>\n      </div>\n      <div class=\"amplify-form-cell-right\">\n        <button\n          class=\"amplify-form-button\"\n          (click)=\"onConfirm()\"\n          data-test=\"" + auth.confirmSignUp.confirmButton + "\"\n          >{{ this.amplifyService.i18n().get('Confirm') }}</button>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n  <div class=\"amplify-alert-body\">\n    <span class=\"amplify-alert-icon\">&#9888;</span>\n    <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n    <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n  </div>\n</div>\n</div>\n";
var ConfirmSignUpComponentCore = /** @class */ (function () {
    function ConfirmSignUpComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._usernameAttributes = 'username';
        this.hide = [];
        this.logger = this.amplifyService.logger('ConfirmSignUpComponent');
    }
    Object.defineProperty(ConfirmSignUpComponentCore.prototype, "data", {
        set: function (data) {
            this.hide = data.hide ? data.hide : this.hide;
            this._authState = data.authState;
            this._show = data.authState.state === 'confirmSignUp';
            this.username = data.authState.user
                ? data.authState.user.username || ''
                : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfirmSignUpComponentCore.prototype, "authState", {
        set: function (authState) {
            this._authState = authState;
            this._show = authState.state === 'confirmSignUp';
            this.username = authState.user ? authState.user.username || '' : '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfirmSignUpComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes;
        },
        enumerable: true,
        configurable: true
    });
    ConfirmSignUpComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
    };
    ConfirmSignUpComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    ConfirmSignUpComponentCore.prototype.setUsername = function (username) {
        this.username = username;
    };
    ConfirmSignUpComponentCore.prototype.setCode = function (code) {
        this.code = code;
    };
    ConfirmSignUpComponentCore.prototype.onConfirm = function () {
        var _this = this;
        this.amplifyService
            .auth()
            .confirmSignUp(this.username, this.code)
            .then(function () { return _this.logger.info('confirm success'); })
            .catch(function (err) { return _this._setError(err); });
    };
    ConfirmSignUpComponentCore.prototype.onResend = function () {
        var _this = this;
        this.amplifyService
            .auth()
            .resendSignUp(this.username)
            .then(function () { return _this.logger.info('code resent'); })
            .catch(function (err) { return _this._setError(err); });
    };
    ConfirmSignUpComponentCore.prototype.onSignIn = function () {
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signIn', user: null });
    };
    ConfirmSignUpComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    ConfirmSignUpComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
    };
    ConfirmSignUpComponentCore.prototype.getUsernameLabel = function () {
        return (labelMap[this._usernameAttributes] || this._usernameAttributes);
    };
    ConfirmSignUpComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-confirm-sign-up-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ConfirmSignUpComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    ConfirmSignUpComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "hide": [{ type: Input },],
        "authState": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
    };
    return ConfirmSignUpComponentCore;
}());
export { ConfirmSignUpComponentCore };
//# sourceMappingURL=confirm-sign-up.component.core.js.map