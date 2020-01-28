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
import { SignUpComponentCore } from './sign-up.component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div\n  class=\"amplify-authenticator\"\n  *ngIf=\"_show\"\n  data-test=\"" + auth.signUp.section + "\"\n  >\n  <div class=\"amplify-form-body\" data-test=\"" + auth.signUp.bodySection + "\">\n    <div class=\"amplify-form-header\" data-test=\"" + auth.signUp.headerSection + "\">\n      {{ this.amplifyService.i18n().get(this.header) }}</div>\n    <ion-list lines=\"none\">\n      <ion-item lines=\"none\" *ngFor=\"let field of signUpFields\">\n        <ion-label class=\"amplify-input-label\"\n        position=\"stacked\"\n        *ngIf=\"field.key !== 'phone_number'\"\n        >\n          {{ this.amplifyService.i18n().get(field.label) }}\n          <span *ngIf=\"field.required\">*</span>\n        </ion-label>\n        <ion-input\n          [ngClass]=\"{'amplify-input-invalid ': field.invalid}\"\n          *ngIf=\"field.key !== 'phone_number'\"\n          #{{field.key}}\n          type=\"text\"\n          class=\"amplify-form-input\"\n          type={{field.type}}\n          [placeholder]=\"this.amplifyService.i18n().get(field.label)\"\n          (keyup)=\"setProp($event.target)\"\n          name={{field.key}}\n          data-test=\"" + auth.signUp.nonPhoneNumberInput + "\"\n        ></ion-input>\n        <ion-content *ngIf=\"field.key === 'phone_number'\" class=\"amplify-phone-ion-content\">\n          <amplify-auth-phone-field-ionic\n            [label]=\"field.label\"\n            [required]=\"field.required\"\n            [placeholder]=\"field.placeholder\"\n            [defaultCountryCode]=\"country_code\"\n            (phoneFieldChanged)=\"onPhoneFieldChanged($event)\"\n          ></amplify-auth-phone-field-ionic>\n        </ion-content>\n      </ion-item>\n    </ion-list>\n    <div class=\"amplify-form-actions\">\n      <div class=\"amplify-form-row\">\n        <ion-button expand=\"block\" color=\"primary\"\n          (click)=\"onSignUp()\"\n          data-test=\"" + auth.signUp.createAccountButton + "\"\n        >{{ this.amplifyService.i18n().get('Create Account') }}</ion-button>\n      </div>\n      <div class=\"amplify-form-row\">\n        <div class=\"amplify-form-signup\">\n          {{ this.amplifyService.i18n().get('Have an account?') }}\n          <a class=\"amplify-form-link\" (click)=\"onSignIn()\" data-test=\"" + auth.signUp.signInButton + "\">\n            {{ this.amplifyService.i18n().get('Sign In') }}\n          </a>\n        </div>\n        <div class=\"amplify-form-signup\" *ngIf=\"!shouldHide('SignUp')\">\n          {{ this.amplifyService.i18n().get('Have a code?') }}\n          <a\n            class=\"amplify-form-link\"\n            (click)=\"onConfirmSignUp()\"\n            data-test=\"" + auth.signUp.confirmButton + "\"\n            >\n            {{ this.amplifyService.i18n().get('Confirm') }}\n          </a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var SignUpComponentIonic = /** @class */ (function (_super) {
    __extends(SignUpComponentIonic, _super);
    function SignUpComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    SignUpComponentIonic.prototype.setProp = function (target) {
        return (this.user[target.name] = target.value);
    };
    SignUpComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-sign-up-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    SignUpComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return SignUpComponentIonic;
}(SignUpComponentCore));
export { SignUpComponentIonic };
//# sourceMappingURL=sign-up.component.ionic.js.map