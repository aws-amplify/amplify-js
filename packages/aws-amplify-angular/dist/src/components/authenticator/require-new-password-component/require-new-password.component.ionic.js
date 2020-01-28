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
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div\n  class=\"amplify-authenticator amplify-authenticator-ionic\"\n  *ngIf=\"_show\"\n  data-test=\"" + auth.requireNewPassword.section + "\"\n  >\n  <div class=\"amplify-form-body\" data-test=\"" + auth.requireNewPassword.bodySection + "\">\n    <div\n      class=\"amplify-form-header amplify-form-header-ionic\"\n      data-test=\"" + auth.requireNewPassword.headerSection + "\"\n      >\n      {{ this.amplifyService.i18n().get('Reset your password') }}\n    </div>\n    <ion-list>\n      <ion-item lines=\"none\">\n        <ion-label class=\"amplify-input-label amplify-input-label-ionic\" position=\"stacked\">\n          {{ this.amplifyService.i18n().get('Password') }}\n        </ion-label>\n        <ion-input\n          #password\n          type=\"password\"\n          class=\"amplify-form-input\"\n          (keyup)=\"setPassword(password.value)\"\n          (keyup.enter)=\"onSubmit()\"\n          data-test=\"" + auth.requireNewPassword.newPasswordInput + "\"\n        ></ion-input>\n      </ion-item>\n\n    </ion-list>\n\n    <div class=\"amplify-form-actions\">\n      <div class=\"amplify-form-row\">\n        <ion-button\n          expand=\"block\"\n          (click)=\"onSignIn()\"\n          data-test=\"" + auth.requireNewPassword.backToSignInLink + "\"\n        >{{ this.amplifyService.i18n().get('Back to Sign In') }}</ion-button>\n      </div>\n      <div class=\"amplify-form-row\">\n        <ion-button\n          expand=\"block\"\n          (click)=\"onSubmit()\"\n          data-test=\"" + auth.requireNewPassword.submitButton + "\"\n        >Submit</ion-button>\n      </div>\n    </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ errorMessage }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var RequireNewPasswordComponentIonic = /** @class */ (function (_super) {
    __extends(RequireNewPasswordComponentIonic, _super);
    function RequireNewPasswordComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    RequireNewPasswordComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-require-new-password-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    RequireNewPasswordComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return RequireNewPasswordComponentIonic;
}(RequireNewPasswordComponentCore));
export { RequireNewPasswordComponentIonic };
//# sourceMappingURL=require-new-password.component.ionic.js.map