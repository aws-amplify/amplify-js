var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { Component, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div\n  class=\"amplify-authenticator amplify-authenticator-ionic\"\n  *ngIf=\"_show\"\n  data-test=\"" + auth.forgotPassword.section + "\"\n  >\n  <div class=\"amplify-form-body\" data-test=\"" + auth.forgotPassword.bodySection + "\">\n  <div\n    class=\"amplify-form-header amplify-form-header-ionic\"\n    data-test=\"" + auth.forgotPassword.headerSection + "\"\n    >\n    {{ this.amplifyService.i18n().get('Reset your password') }}\n  </div>\n  <div class=\"amplify-form-text\" *ngIf=\"!code_sent\">\n    {{ this.amplifyService.i18n().get('You will receive a verification code to reset your password') }}\n  </div>\n\n  <ion-list>\n    <amplify-auth-username-field-ionic\n      [usernameAttributes]=\"_usernameAttributes\"\n      (usernameFieldChanged)=\"onUsernameFieldChanged($event)\"\n    ></amplify-auth-username-field-ionic>\n    <ion-item lines=\"none\" *ngIf=\"code_sent\">\n      <ion-label class=\"amplify-input-label amplify-input-label-ionic\" position=\"stacked\">\n        {{ this.amplifyService.i18n().get('Code *') }}\n      </ion-label>\n      <ion-input\n        #code\n        type=\"text\"\n        class=\"amplify-form-input\"\n        (keyup)=\"setCode(code.value)\"\n        data-test=\"" + auth.forgotPassword.codeInput + "\"\n      ></ion-input>\n    </ion-item>\n    <ion-item lines=\"none\" *ngIf=\"code_sent\">\n      <ion-label class=\"amplify-input-label amplify-input-label-ionic\" position=\"stacked\">\n        {{ this.amplifyService.i18n().get('Password *') }}\n      </ion-label>\n      <ion-input\n        #password\n        type=\"password\"\n        class=\"amplify-form-input\"\n        (keyup)=\"setPassword(password.value)\"\n        (keyup.enter)=\"onSubmit()\"\n        data-test=\"" + auth.forgotPassword.newPasswordInput + "\"\n      ></ion-input>\n    </ion-item>\n  </ion-list>\n  <div class=\"amplify-form-actions\">\n    <div>\n      <ion-button expand=\"block\" color=\"primary\"\n        (click)=\"onSend()\"\n        *ngIf=\"!code_sent\"\n        data-test=\"" + auth.forgotPassword.submitButton + "\"\n      >\n        {{ this.amplifyService.i18n().get('Submit') }}</ion-button>\n      <ion-button expand=\"block\" color=\"primary\"\n      *ngIf=\"code_sent\"\n      (click)=\"onSubmit()\"\n      >{{ this.amplifyService.i18n().get('Verify') }}</ion-button>\n    </div>\n    <div class=\"amplify-form-row\">\n      <div class=\"amplify-form-signup\">\n        {{ this.amplifyService.i18n().get('Have an account?') }}\n        <a class=\"amplify-form-link\" (click)=\"onSignIn()\">\n          {{ this.amplifyService.i18n().get('Sign In') }}\n        </a>\n      </div>\n      <div class=\"amplify-form-signup\">\n        {{ this.amplifyService.i18n().get('Lost your code?') }}\n        <a\n          class=\"amplify-form-link\"\n          (click)=\"onSend()\"\n          data-test=\"" + auth.forgotPassword.resendCodeLink + "\"\n          >\n          {{ this.amplifyService.i18n().get('Resend') }}\n        </a>\n      </div>\n    </div>\n  </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n\n</div>\n";
var ForgotPasswordComponentIonic = /** @class */ (function (_super) {
    __extends(ForgotPasswordComponentIonic, _super);
    function ForgotPasswordComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    ForgotPasswordComponentIonic.prototype.onCodeChange = function (val) {
        this.country_code = val;
    };
    ForgotPasswordComponentIonic.prototype.onNumberChange = function (val) {
        this.local_phone_number = val;
    };
    ForgotPasswordComponentIonic.prototype.setUsername = function (username) {
        this.username = username;
    };
    ForgotPasswordComponentIonic.prototype.setEmail = function (email) {
        this.email = email;
    };
    ForgotPasswordComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-forgot-password-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ForgotPasswordComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return ForgotPasswordComponentIonic;
}(ForgotPasswordComponentCore));
export { ForgotPasswordComponentIonic };
//# sourceMappingURL=forgot-password.component.ionic.js.map