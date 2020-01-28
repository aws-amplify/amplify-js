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
import { Component, } from '@angular/core';
import { AmplifyService } from '../../../providers';
import { AuthenticatorComponentCore } from './authenticator.component.core';
var template = "\n<div class=\"amplify-authenticator amplify-authenticator-ionic \">\n\n<amplify-auth-sign-in-ionic\n  *ngIf=\"!shouldHide('SignIn')\"\n  [authState]=\"authState\"\n  [usernameAttributes]=\"_usernameAttributes\"\n  [hide]=\"hide\"\n></amplify-auth-sign-in-ionic>\n\n<amplify-auth-sign-up-ionic\n  *ngIf=\"!shouldHide('SignUp')\"\n  [authState]=\"authState\"\n  [signUpConfig]=\"_signUpConfig\"\n  [usernameAttributes]=\"_usernameAttributes\"\n  [hide]=\"hide\"\n></amplify-auth-sign-up-ionic>\n\n<amplify-auth-confirm-sign-up-ionic\n  *ngIf=\"!shouldHide('ConfirmSignUp')\"\n  [authState]=\"authState\"\n  [usernameAttributes]=\"_usernameAttributes\"\n  [hide]=\"hide\"\n></amplify-auth-confirm-sign-up-ionic>\n\n<amplify-auth-confirm-sign-in-ionic\n  *ngIf=\"!shouldHide('ConfirmSignIn')\"\n  [authState]=\"authState\"\n  [hide]=\"hide\"\n></amplify-auth-confirm-sign-in-ionic>\n\n<amplify-auth-forgot-password-ionic\n  *ngIf=\"!shouldHide('ForgotPassword')\"\n  [authState]=\"authState\"\n  [usernameAttributes]=\"_usernameAttributes\"\n  [hide]=\"hide\"\n></amplify-auth-forgot-password-ionic>\n\n<amplify-auth-greetings-ionic\n  *ngIf=\"!shouldHide('Greetings')\"\n  [authState]=\"authState\"\n  [usernameAttributes]=\"_usernameAttributes\"\n></amplify-auth-greetings-ionic>\n\n<amplify-auth-require-new-password-ionic\n  *ngIf=\"!shouldHide('RequireNewPassword')\"\n  [authState]=\"authState\"\n  [hide]=\"hide\"\n></amplify-auth-require-new-password-ionic>\n</div>\n";
var AuthenticatorIonicComponent = /** @class */ (function (_super) {
    __extends(AuthenticatorIonicComponent, _super);
    function AuthenticatorIonicComponent(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    AuthenticatorIonicComponent.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-authenticator-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    AuthenticatorIonicComponent.ctorParameters = function () { return [
        { type: AmplifyService, },
    ]; };
    return AuthenticatorIonicComponent;
}(AuthenticatorComponentCore));
export { AuthenticatorIonicComponent };
//# sourceMappingURL=authenticator.component.ionic.js.map