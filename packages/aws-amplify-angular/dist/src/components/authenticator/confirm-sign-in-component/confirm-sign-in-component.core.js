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
var template = "\n<div class=\"amplify-container\" *ngIf=\"_show\">\n  <div class=\"amplify-form-container\" data-test=\"" + auth.confirmSignIn.section + "\">\n    <div class=\"amplify-form-body\" data-test=\"" + auth.confirmSignIn.bodySection + "\">\n    <div class=\"amplify-form-header\" data-test=\"" + auth.confirmSignIn.headerSection + "\">{{ this.amplifyService.i18n().get('Confirm Sign in') }}</div>\n      <div class=\"amplify-form-row\" *ngIf=\"!shouldHide('SignIn')\">\n        <label class=\"amplify-input-label\" for=\"code\">\n          {{ this.amplifyService.i18n().get('Confirmation Code *') }}\n        </label>\n        <input #code\n          (change)=\"setCode(code.value)\"\n          (keyup)=\"setCode(code.value)\"\n          (keyup.enter)=\"onConfirm()\"\n          class=\"amplify-form-input\"\n          type=\"text\"\n          placeholder=\"{{ this.amplifyService.i18n().get('Enter your Code') }}\"\n          data-test=\"" + auth.confirmSignIn.codeInput + "\"\n        />\n      </div>\n      <div class=\"amplify-form-actions\">\n        <div class=\"amplify-form-cell-left\">\n          <div class=\"amplify-form-actions-left\">\n            <a \n              class=\"amplify-form-link\"\n              (click)=\"onSignIn()\"\n              data-test=\"" + auth.confirmSignIn.backToSignInLink + "\"\n              >\n                {{ this.amplifyService.i18n().get('Back to Sign in') }}\n            </a>\n          </div>\n        </div>\n        <div class=\"amplify-form-cell-right\">\n          <button\n            class=\"amplify-form-button\"\n            data-test=\"" + auth.confirmSignIn.confirmButton + "\"\n            (click)=\"onConfirm()\"\n            >\n              {{ this.amplifyService.i18n().get('Confirm') }}</button>\n        </div>\n      </div>\n      </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var ConfirmSignInComponentCore = /** @class */ (function () {
    function ConfirmSignInComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this.hide = [];
        this.logger = this.amplifyService.logger('ConfiSignInComponent');
    }
    Object.defineProperty(ConfirmSignInComponentCore.prototype, "data", {
        set: function (data) {
            this.hide = data.hide ? data.hide : this.hide;
            this._authState = data.authState;
            this._show = data.authState.state === 'confirmSignIn';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfirmSignInComponentCore.prototype, "authState", {
        set: function (authState) {
            this._authState = authState;
            this._show = authState.state === 'confirmSignIn';
        },
        enumerable: true,
        configurable: true
    });
    ConfirmSignInComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
    };
    ConfirmSignInComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    ConfirmSignInComponentCore.prototype.setCode = function (code) {
        this.code = code;
    };
    ConfirmSignInComponentCore.prototype.onConfirm = function () {
        var _this = this;
        var user = this._authState.user;
        var challengeName = user.challengeName;
        var mfaType = challengeName === 'SOFTWARE_TOKEN_MFA' ? challengeName : null;
        this.amplifyService
            .auth()
            .confirmSignIn(user, this.code, mfaType)
            .then(function () {
            _this.onAlertClose();
            _this.amplifyService.setAuthState({ state: 'signedIn', user: user });
        })
            .catch(function (err) { return _this._setError(err); });
    };
    ConfirmSignInComponentCore.prototype.onSignIn = function () {
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signIn', user: null });
    };
    ConfirmSignInComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    ConfirmSignInComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
    };
    ConfirmSignInComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-confirm-sign-in-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ConfirmSignInComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    ConfirmSignInComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "authState": [{ type: Input },],
        "hide": [{ type: Input },],
    };
    return ConfirmSignInComponentCore;
}());
export { ConfirmSignInComponentCore };
//# sourceMappingURL=confirm-sign-in-component.core.js.map