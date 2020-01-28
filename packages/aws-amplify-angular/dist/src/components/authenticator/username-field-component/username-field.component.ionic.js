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
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { UsernameFieldComponentCore } from './username-field.component.core';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n\n    <ion-item lines=\"none\" *ngIf=\"this._usernameAttributes === 'email'\">\n        <ion-label class=\"amplify-input-label amplify-input-label-ionic\" for=\"emailField\" position=\"stacked\">{{ this.amplifyService.i18n().get('Email *') }}</ion-label>\n        <ion-input type=\"text\"\n            #emailField\n            class=\"amplify-form-input\"\n            type=\"email\"\n            placeholder=\"{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}\"\n            (keyup)=\"setEmail($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.emailInput + "\"\n        ></ion-input>\n    </ion-item> \n    <ion-item lines=\"none\" *ngIf=\"this._usernameAttributes === 'phone_number'\">\n       <amplify-auth-phone-field-ionic\n            (phoneFieldChanged)=\"onPhoneFieldChanged($event)\"\n        ></amplify-auth-phone-field-ionic>\n    </ion-item>\n    <ion-item lines=\"none\" *ngIf=\"this._usernameAttributes !== 'email' && this._usernameAttributes !== 'phone_number'\">\n        <ion-label class=\"amplify-input-label amplify-input-label-ionic\" for=\"usernameField\" position=\"stacked\">{{ this.amplifyService.i18n().get(getUsernameLabel()) }} *</ion-label>\n        <ion-input type=\"text\"\n            #usernameField\n            class=\"amplify-form-input\"\n            type=\"text\"\n            placeholder=\"{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}\"\n            (keyup)=\"setUsername($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.usernameInput + "\"\n        ></ion-input>\n    </ion-item>\n\n";
var UsernameFieldComponentIonic = /** @class */ (function (_super) {
    __extends(UsernameFieldComponentIonic, _super);
    function UsernameFieldComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    UsernameFieldComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-username-field-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    UsernameFieldComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return UsernameFieldComponentIonic;
}(UsernameFieldComponentCore));
export { UsernameFieldComponentIonic };
//# sourceMappingURL=username-field.component.ionic.js.map