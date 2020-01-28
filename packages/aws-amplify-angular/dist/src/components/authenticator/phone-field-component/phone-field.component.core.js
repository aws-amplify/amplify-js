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
import { Component, Input, EventEmitter, Inject, Output, } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { countrylist } from '../../../assets/countries';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div>\n    <label class=\"amplify-input-label\" for=\"localPhoneNumberField\">\n        {{ this.amplifyService.i18n().get(this._label) }}\n        <span *ngIf=\"_required\">*</span>\n    </label>\n    <div class=\"amplify-input-group\">\n        <div class=\"amplify-input-group-item\">\n            <select \n            #countryCodeField\n            name=\"countryCode\"\n            class=\"amplify-select-phone-country\"\n            [(ngModel)]=\"_country_code\"\n            (change)=\"setCountryCode($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.dialCodeSelect + "\"\n            >\n            <option *ngFor=\"let country of _countries\"\n                value={{country.value}}>\n                {{country.label}}\n            </option>\n            </select>\n        </div>\n        <div class=\"amplify-input-group-item\">\n            <input\n                #localPhoneNumberField\n                class=\"amplify-form-input\"\n                placeholder=\"{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}\"\n                name=\"local_phone_number\"\n                type=\"tel\"\n                (keyup)=\"setLocalPhoneNumber($event.target.value)\"\n                data-test=\"" + auth.genericAttrs.phoneNumberInput + "\"\n            />\n        </div>\n    </div>\n</div>\n";
var PhoneFieldComponentCore = /** @class */ (function () {
    function PhoneFieldComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._placeholder = '';
        this._label = 'Phone Number';
        this._required = true;
        this._country_code = '1';
        this._local_phone_number = '';
        this.phoneFieldChanged = new EventEmitter();
        this._countries = countrylist;
    }
    Object.defineProperty(PhoneFieldComponentCore.prototype, "data", {
        set: function (data) {
            this._placeholder = data.placeholder || this._placeholder;
            this._label = data.label || this._label;
            this._country_code = data.defaultCountryCode || this._country_code;
            this._required =
                data.required === undefined ? this._required : data.required;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhoneFieldComponentCore.prototype, "placeholder", {
        set: function (placeholder) {
            this._placeholder = placeholder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhoneFieldComponentCore.prototype, "label", {
        set: function (label) {
            this._label = label;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhoneFieldComponentCore.prototype, "required", {
        set: function (required) {
            this._required = required;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhoneFieldComponentCore.prototype, "defaultCountryCode", {
        set: function (defaultCountryCode) {
            this._country_code = defaultCountryCode;
        },
        enumerable: true,
        configurable: true
    });
    PhoneFieldComponentCore.prototype.ngOnInit = function () { };
    PhoneFieldComponentCore.prototype.ngOnDestroy = function () { };
    PhoneFieldComponentCore.prototype.setCountryCode = function (country_code) {
        this._country_code = country_code;
        this.phoneFieldChanged.emit({
            country_code: this._country_code,
            local_phone_number: this._local_phone_number,
        });
    };
    PhoneFieldComponentCore.prototype.setLocalPhoneNumber = function (local_phone_number) {
        this._local_phone_number = local_phone_number;
        this.phoneFieldChanged.emit({
            country_code: this._country_code,
            local_phone_number: this._local_phone_number,
        });
    };
    PhoneFieldComponentCore.prototype.getPlaceholder = function () {
        return this.amplifyService
            .i18n()
            .get("Enter your phone number" || this._placeholder);
    };
    PhoneFieldComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-phone-field-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    PhoneFieldComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    PhoneFieldComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "placeholder": [{ type: Input },],
        "label": [{ type: Input },],
        "required": [{ type: Input },],
        "defaultCountryCode": [{ type: Input },],
        "phoneFieldChanged": [{ type: Output },],
    };
    return PhoneFieldComponentCore;
}());
export { PhoneFieldComponentCore };
//# sourceMappingURL=phone-field.component.core.js.map