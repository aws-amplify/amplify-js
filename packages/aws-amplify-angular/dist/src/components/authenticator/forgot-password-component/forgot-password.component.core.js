import { UsernameAttributes } from '../types';
import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { labelMap, composePhoneNumber } from '../common';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-container\" *ngIf=\"_show\">\n  <div class=\"amplify-form-container\" data-test=\"" + auth.forgotPassword.section + "\">\n    <div class=\"amplify-form-body\" data-test=\"" + auth.forgotPassword.bodySection + "\">\n    <div class=\"amplify-form-header\" data-test=\"" + auth.forgotPassword.headerSection + "\">\n      {{ this.amplifyService.i18n().get('Reset your password') }}\n    </div>\n    <div class=\"amplify-form-text\" *ngIf=\"!code_sent\">\n      {{ this.amplifyService.i18n().get('You will receive a verification code') }}\n    </div>\n    <div class=\"amplify-form-text\" *ngIf=\"code_sent\">\n      {{ this.amplifyService.i18n().get('Enter the code you received and set a new password') }}\n    </div>\n    <amplify-auth-username-field-core\n      *ngIf=\"!code_sent\"\n      [usernameAttributes]=\"_usernameAttributes\"\n      (usernameFieldChanged)=\"onUsernameFieldChanged($event)\"\n    ></amplify-auth-username-field-core>\n      <div class=\"amplify-form-row\" *ngIf=\"code_sent\">\n      <label class=\"amplify-input-label\" for=\"code\">\n        {{ this.amplifyService.i18n().get('Confirmation Code *') }}\n      </label>\n      <input #code\n        (keyup)=\"setCode(code.value)\"\n        class=\"amplify-form-input\"\n        type=\"text\"\n        autocomplete=\"off\"\n        placeholder=\"{{ this.amplifyService.i18n().get('Enter code') }}\"\n        data-test=\"" + auth.forgotPassword.codeInput + "\"\n      />\n      </div>\n      <div class=\"amplify-form-row\" *ngIf=\"code_sent\">\n      <label class=\"amplify-input-label\" for=\"password\">\n        {{ this.amplifyService.i18n().get('New Password *') }}\n      </label>\n      <input #password\n        (keyup)=\"setPassword(password.value)\"\n        (keyup.enter)=\"onSubmit()\"\n        class=\"amplify-form-input\"\n        type=\"password\"\n        autocomplete=\"off\"\n        placeholder=\"{{ this.amplifyService.i18n().get('Password') }}\"\n        data-test=\"" + auth.forgotPassword.newPasswordInput + "\"\n      />\n      </div>\n      <div class=\"amplify-form-actions\">\n        <div class=\"amplify-form-cell-right\">\n          <button class=\"amplify-form-button\"\n            *ngIf=\"!code_sent\"\n            (click)=\"onSend()\"\n            data-test=\"" + auth.forgotPassword.sendCodeButton + "\"\n            >\n              {{ this.amplifyService.i18n().get('Submit') }}</button>\n          <button class=\"amplify-form-button\"\n            *ngIf=\"code_sent\"\n            (click)=\"onSubmit()\"\n            data-test=\"" + auth.forgotPassword.submitButton + "\"\n            >\n              {{ this.amplifyService.i18n().get('Verify') }}</button>\n        </div>\n        <div class=\"amplify-form-cell-left\">\n          <div class=\"amplify-form-actions-left\">\n            <a\n              *ngIf=\"code_sent\"\n              class=\"amplify-form-link\"\n              (click)=\"onSend()\"\n              data-test=\"" + auth.forgotPassword.resendCodeLink + "\"\n              >\n              {{ this.amplifyService.i18n().get('Resend Code') }}\n            </a>\n            <a\n              *ngIf=\"!code_sent\"\n              class=\"amplify-form-link\"\n              (click)=\"onSignIn()\"\n              data-test=\"" + auth.forgotPassword.backToSignInLink + "\"\n              >\n              {{ this.amplifyService.i18n().get('Back to Sign in') }}\n            </a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var ForgotPasswordComponentCore = /** @class */ (function () {
    function ForgotPasswordComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._usernameAttributes = 'username';
        this.code_sent = false;
        this.country_code = '1';
        this.hide = [];
        this.logger = this.amplifyService.logger('ForgotPasswordComponent');
    }
    Object.defineProperty(ForgotPasswordComponentCore.prototype, "data", {
        set: function (data) {
            this._authState = data.authState;
            this._show = data.authState.state === 'forgotPassword';
            this._usernameAttributes = data.usernameAttributes;
            this.hide = data.hide ? data.hide : this.hide;
            this.username =
                data.authState.user && data.authState.user.username
                    ? data.authState.user.username
                    : '';
        },
        enumerable: true,
        configurable: true
    });
    ForgotPasswordComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    Object.defineProperty(ForgotPasswordComponentCore.prototype, "authState", {
        set: function (authState) {
            this._authState = authState;
            this._show = authState.state === 'forgotPassword';
            this.email =
                authState.user && authState.user.email ? authState.user.email : '';
            this.country_code =
                authState.user && authState.user.contry_code
                    ? authState.user.country_code
                    : '1';
            this.local_phone_number =
                authState.user && authState.user.local_phone_number
                    ? authState.user.local_phone_number
                    : '';
            this.username =
                authState.user && authState.user.username ? authState.user.username : '';
        },
        enumerable: true,
        configurable: true
    });
    ForgotPasswordComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
    };
    Object.defineProperty(ForgotPasswordComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes;
        },
        enumerable: true,
        configurable: true
    });
    ForgotPasswordComponentCore.prototype.setCode = function (code) {
        this.code = code;
    };
    ForgotPasswordComponentCore.prototype.setPassword = function (password) {
        this.password = password;
    };
    ForgotPasswordComponentCore.prototype.getforgotPwUsername = function () {
        switch (this._usernameAttributes) {
            case UsernameAttributes.EMAIL:
                return this.email;
            case UsernameAttributes.PHONE_NUMBER:
                return composePhoneNumber(this.country_code, this.local_phone_number);
            default:
                return this.username;
        }
    };
    ForgotPasswordComponentCore.prototype.onSend = function () {
        var _this = this;
        var forgotPwUsername = this.getforgotPwUsername();
        if (!forgotPwUsername) {
            this.errorMessage = 'Username cannot be empty';
            return;
        }
        this.amplifyService
            .auth()
            .forgotPassword(forgotPwUsername)
            .then(function () {
            _this.code_sent = true;
        })
            .catch(function (err) {
            _this._setError(err);
            _this.code_sent = false;
        });
    };
    ForgotPasswordComponentCore.prototype.onSubmit = function () {
        var _this = this;
        this.amplifyService
            .auth()
            .forgotPasswordSubmit(this.getforgotPwUsername(), this.code, this.password)
            .then(function () {
            var user = { username: _this.username };
            _this.onAlertClose();
            _this.amplifyService.setAuthState({ state: 'signIn', user: user });
        })
            .catch(function (err) { return _this._setError(err); });
    };
    ForgotPasswordComponentCore.prototype.onSignIn = function () {
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signIn', user: null });
    };
    ForgotPasswordComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    ForgotPasswordComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
    };
    ForgotPasswordComponentCore.prototype.getUsernameLabel = function () {
        return (labelMap[this._usernameAttributes] || this._usernameAttributes);
    };
    ForgotPasswordComponentCore.prototype.onUsernameFieldChanged = function (event) {
        this.email = event.email || this.email;
        this.username = event.username || this.username;
        this.country_code = event.country_code || this.country_code;
        this.local_phone_number =
            event.local_phone_number || this.local_phone_number;
    };
    ForgotPasswordComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-forgot-password-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ForgotPasswordComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    ForgotPasswordComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "hide": [{ type: Input },],
        "authState": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
    };
    return ForgotPasswordComponentCore;
}());
export { ForgotPasswordComponentCore };
//# sourceMappingURL=forgot-password.component.core.js.map