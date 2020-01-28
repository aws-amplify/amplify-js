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
import { ConfirmSignUpComponentCore } from './confirm-sign-up.component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div\n  class=\"amplify-authenticator amplify-authenticator-ionic\"\n  *ngIf=\"_show\"\n  data-test=\"" + auth.confirmSignUp.section + "\"\n  >\n  <div class=\"amplify-form-body\" data-test=\"" + auth.confirmSignUp.bodySection + "\">\n    <div\n      class=\"amplify-form-header amplify-form-header-ionic\"\n      data-test=\"" + auth.confirmSignUp.headerSection + "\"\n      >\n      {{ this.amplifyService.i18n().get('Confirm your sign up code') }}\n    </div>\n    <ion-list>\n      <ion-item lines=\"none\">\n        <ion-label class=\"amplify-input-label amplify-input-label-ionic\" position=\"stacked\">\n          {{ this.amplifyService.i18n().get(getUsernameLabel()) }}\n        </ion-label>\n        <ion-input type=\"text\"\n          class=\"amplify-form-input\"\n          (keyup)=\"setUsername($event.target.value)\"\n          [value]=\"username\"\n          data-test=\"" + auth.confirmSignUp.usernameInput + "\"\n        ></ion-input>\n      </ion-item>\n\n      <ion-item lines=\"none\">\n        <ion-label  class=\"amplify-input-label amplify-input-label-ionic\" position=\"stacked\">\n          {{ this.amplifyService.i18n().get('Code *') }}\n        </ion-label>\n        <ion-input\n          #code\n          type=\"text\"\n          class=\"amplify-form-input\"\n          (keyup)=\"setCode(code.value)\"\n          (keyup.enter)=\"onConfirm()\"\n          data-test=\"" + auth.confirmSignUp.confirmationCodeInput + "\"\n        ></ion-input>\n      </ion-item>\n    </ion-list>\n\n    <div class=\"amplify-form-actions\">\n      <div>\n        <ion-button\n          expand=\"block\"\n          color=\"primary\"\n          (click)=\"onConfirm()\"\n          data-test=\"" + auth.confirmSignUp.confirmButton + "\"\n          >\n          {{ this.amplifyService.i18n().get('Confirm Code') }}</ion-button>\n      </div>\n    <div class=\"amplify-form-row\">\n      <div class=\"amplify-form-signup\">\n        {{ this.amplifyService.i18n().get('Have an account?') }}\n        <a\n          class=\"amplify-form-link\"\n          (click)=\"onSignIn()\"\n          data-test=\"" + auth.confirmSignUp.backToSignInLink + "\"\n          >\n          {{ this.amplifyService.i18n().get('Sign In') }}\n        </a>\n      </div>\n      <div class=\"amplify-form-signup\">\n        {{ this.amplifyService.i18n().get('Lost your code?') }}\n        <a\n          class=\"amplify-form-link\"\n          (click)=\"onResend()\"\n          data-test=\"" + auth.confirmSignUp.resendCodeLink + "\"\n          >\n          {{ this.amplifyService.i18n().get('Resend') }}\n        </a>\n      </div>\n    </div>\n  </div>\n</div>\n\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n\n</div>\n";
var ConfirmSignUpComponentIonic = /** @class */ (function (_super) {
    __extends(ConfirmSignUpComponentIonic, _super);
    function ConfirmSignUpComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    ConfirmSignUpComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-confirm-sign-up-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ConfirmSignUpComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return ConfirmSignUpComponentIonic;
}(ConfirmSignUpComponentCore));
export { ConfirmSignUpComponentIonic };
//# sourceMappingURL=confirm-sign-up.component.ionic.js.map