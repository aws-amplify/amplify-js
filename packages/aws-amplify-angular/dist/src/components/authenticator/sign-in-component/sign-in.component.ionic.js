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
import { SignInComponentCore } from './sign-in.component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div\n  class=\"amplify-authenticator\"\n  *ngIf=\"_show\"\n  data-test=\"" + auth.signIn.section + "\"\n  >\n  <div class=\"amplify-form-body\" data-test=\"" + auth.signIn.bodySection + "\">\n    <div class=\"amplify-form-header\" data-test=\"" + auth.signIn.headerSection + "\">\n      {{ this.amplifyService.i18n().get('Sign in to your account') }}\n    </div>\n    <ion-list lines=\"none\">\n      <amplify-auth-username-field-ionic\n        [usernameAttributes]=\"_usernameAttributes\"\n        (usernameFieldChanged)=\"onUsernameFieldChanged($event)\"\n      ></amplify-auth-username-field-ionic>\n      <ion-item lines=\"none\">\n        <ion-label class=\"amplify-input-label\" for=\"password\" position=\"stacked\">\n          {{ this.amplifyService.i18n().get('Password *') }}\n        </ion-label>\n        <ion-input\n          #password\n          type=\"password\"\n          class=\"amplify-form-input\"\n          (keyup)=\"setPassword(password.value)\"\n          (keyup.enter)=\"onSignIn()\"\n          data-test=\"" + auth.signIn.passwordInput + "\"\n        ></ion-input>\n      </ion-item>\n    </ion-list>\n    <div class=\"amplify-form-actions\">\n      <div class=\"amplify-form-row\">\n        <ion-button expand=\"block\" color=\"primary\"\n          (click)=\"onSignIn()\"\n          data-test=\"" + auth.signIn.signInButton + "\"\n          >{{ this.amplifyService.i18n().get('Sign In') }}</ion-button>\n      </div>\n\n      <div class=\"amplify-form-row\">\n        <div class=\"amplify-form-signup\" *ngIf=\"!shouldHide('SignUp')\">\n          {{ this.amplifyService.i18n().get('No account?') }}\n          <a\n            class=\"amplify-form-link\"\n            (click)=\"onSignUp()\"\n            data-test=\"" + auth.signIn.createAccountLink + "\"\n            >\n            {{ this.amplifyService.i18n().get('Create account') }}\n          </a>\n        </div>\n        <div class=\"amplify-form-signup\" *ngIf=\"!shouldHide('ForgotPassword')\">\n          <a class=\"amplify-form-link\" (click)=\"onForgotPassword()\" data-test=\"" + auth.signIn.forgotPasswordLink + "\">\n            {{ this.amplifyService.i18n().get('Reset Password') }}\n          </a>\n        </div>\n      </div>\n\n    </div>\n  </div>\n\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var SignInComponentIonic = /** @class */ (function (_super) {
    __extends(SignInComponentIonic, _super);
    function SignInComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    SignInComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-sign-in-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    SignInComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return SignInComponentIonic;
}(SignInComponentCore));
export { SignInComponentIonic };
//# sourceMappingURL=sign-in.component.ionic.js.map