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
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-container\" *ngIf=\"_show\">\n<div class=\"amplify-form-container\" data-test=\"" + auth.requireNewPassword.section + "\">\n  <div class=\"amplify-form-body\" data-test=\"" + auth.requireNewPassword.bodySection + "\">\n  <div class=\"amplify-form-header\" data-test=\"" + auth.requireNewPassword.headerSection + "\">\n    {{ this.amplifyService.i18n().get('You are required to update your password') }}\n  </div>\n  <div class=\"amplify-form-row\">\n    <label class=\"amplify-input-label\" for=\"password\">\n      {{ this.amplifyService.i18n().get('Password *') }}\n    </label>\n    <input #password\n      (keyup)=\"setPassword(password.value)\"\n      (keyup.enter)=\"onSubmit()\"\n      class=\"amplify-form-input\"\n      type=\"password\"\n      placeholder=\"{{ this.amplifyService.i18n().get('Password') }}\"\n      data-test=\"" + auth.requireNewPassword.newPasswordInput + "\"\n    />\n    </div>\n    <div class=\"amplify-form-actions\">\n      <div class=\"amplify-form-cell-left\">\n        <a class=\"amplify-form-link\"\n          (click)=\"onSignIn()\"\n          data-test=\"" + auth.requireNewPassword.backToSignInLink + "\"\n        >{{ this.amplifyService.i18n().get('Back to Sign In') }}</a>\n      </div>\n      <div class=\"amplify-form-cell-right\">\n        <button class=\"amplify-form-button\"\n          (click)=\"onSubmit()\"\n          data-test=\"" + auth.requireNewPassword.submitButton + "\"\n        >{{ this.amplifyService.i18n().get('Submit') }}</button>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n<div class=\"amplify-alert-body\">\n  <span class=\"amplify-alert-icon\">&#9888;</span>\n  <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n  <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n</div>\n</div>\n</div>\n";
var RequireNewPasswordComponentCore = /** @class */ (function () {
    function RequireNewPasswordComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this.hide = [];
        this.logger = this.amplifyService.logger('RequireNewPasswordComponent');
    }
    Object.defineProperty(RequireNewPasswordComponentCore.prototype, "authState", {
        set: function (authState) {
            this._authState = authState;
            this._show = authState.state === 'requireNewPassword';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequireNewPasswordComponentCore.prototype, "data", {
        set: function (data) {
            this._authState = data.authState;
            this._show = data.authState.state === 'requireNewPassword';
            this.hide = data.hide ? data.hide : this.hide;
        },
        enumerable: true,
        configurable: true
    });
    RequireNewPasswordComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
    };
    RequireNewPasswordComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    RequireNewPasswordComponentCore.prototype.setPassword = function (password) {
        this.password = password;
    };
    RequireNewPasswordComponentCore.prototype.onSubmit = function () {
        var _this = this;
        var user = this._authState.user;
        var requiredAttributes = user.challengeParam.requiredAttributes;
        this.amplifyService
            .auth()
            .completeNewPassword(user, this.password, requiredAttributes)
            .then(function () {
            _this.onAlertClose();
            _this.amplifyService.setAuthState({ state: 'signIn', user: user });
        })
            .catch(function (err) { return _this._setError(err); });
    };
    RequireNewPasswordComponentCore.prototype.onSignIn = function () {
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signIn', user: null });
    };
    RequireNewPasswordComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    RequireNewPasswordComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
    };
    RequireNewPasswordComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-require-new-password-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    RequireNewPasswordComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    RequireNewPasswordComponentCore.propDecorators = {
        "authState": [{ type: Input },],
        "hide": [{ type: Input },],
        "data": [{ type: Input },],
    };
    return RequireNewPasswordComponentCore;
}());
export { RequireNewPasswordComponentCore };
//# sourceMappingURL=require-new-password.component.core.js.map