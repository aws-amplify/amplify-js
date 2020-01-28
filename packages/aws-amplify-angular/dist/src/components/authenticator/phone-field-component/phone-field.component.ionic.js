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
import { PhoneFieldComponentCore } from './phone-field.component.core';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<ion-grid class=\"amplify-ionic-grid-padding-left\">\n    <ion-row>\n        <ion-col size=\"6\" class=\"amplify-ionic-grid-padding-left\">\n            <ion-label class=\"amplify-input-label push-right\"\n                position=\"stacked\" \n                for=\"localPhoneNumberField\">\n                {{ this.amplifyService.i18n().get(this._label) }}\n                <span *ngIf=\"_required\">*</span>\n            </ion-label>\n            <ion-select \n            #countryCodeField\n            name=\"countryCode\"\n            class=\"amplify-select-phone-country\"\n            [value]=\"_country_code\"\n            (ionChange)=\"setCountryCode($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.dialCodeSelect + "\">\n            <ion-select-option *ngFor=\"let country of _countries\"\n            value={{country.value}}>\n                {{country.label}}\n            </ion-select-option>\n            </ion-select>\n        </ion-col>\n        <ion-col size=\"6\">\n            <ion-label class=\"amplify-input-label push-right\">&nbsp;</ion-label>\n            <ion-input\n            #localPhoneNumberField\n            class=\"amplify-form-input-phone-ionic\"\n            placeholder=\"{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}\"\n            name=\"local_phone_number\"\n            type=\"tel\"\n            (ionChange)=\"setLocalPhoneNumber($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.phoneNumberInput + "\"\n            ></ion-input>\n        </ion-col>\n    </ion-row>\n</ion-grid>";
var PhoneFieldComponentIonic = /** @class */ (function (_super) {
    __extends(PhoneFieldComponentIonic, _super);
    function PhoneFieldComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    PhoneFieldComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-phone-field-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    PhoneFieldComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return PhoneFieldComponentIonic;
}(PhoneFieldComponentCore));
export { PhoneFieldComponentIonic };
//# sourceMappingURL=phone-field.component.ionic.js.map