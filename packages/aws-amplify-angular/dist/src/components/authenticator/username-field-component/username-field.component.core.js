var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { labelMap } from '../common';
import { UsernameAttributes, } from '../types';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-amplify-form-row amplify-signin-username\">\n    <div *ngIf=\"this._usernameAttributes === 'email'\">\n        <label class=\"amplify-input-label\" for=\"emailField\"> {{ this.amplifyService.i18n().get('Email') }} *</label>\n        <input\n            #emailField\n            class=\"amplify-form-input\"\n            type=\"email\"\n            placeholder=\"{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}\"\n            (keyup)=\"setEmail($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.emailInput + "\"\n        />\n    </div>\n    <div *ngIf=\"this._usernameAttributes === 'phone_number'\">\n        <amplify-auth-phone-field-core\n            (phoneFieldChanged)=\"onPhoneFieldChanged($event)\"\n        ></amplify-auth-phone-field-core>\n    </div>\n    <div *ngIf=\"this._usernameAttributes !== 'email' && this._usernameAttributes !== 'phone_number'\">\n        <label class=\"amplify-input-label\" for=\"usernameField\"> {{ this.amplifyService.i18n().get(getUsernameLabel()) }} *</label>\n        <input\n            #usernameField\n            class=\"amplify-form-input\"\n            type=\"text\"\n            value=\"{{this.username}}\"\n            placeholder=\"{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}\"\n            (keyup)=\"setUsername($event.target.value)\"\n            data-test=\"" + auth.genericAttrs.usernameInput + "\"\n        />\n    </div>\n</div>\n";
var UsernameFieldComponentCore = /** @class */ (function () {
    function UsernameFieldComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._usernameAttributes = UsernameAttributes.USERNAME;
        this._placeholder = '';
        this.usernameFieldChanged = new EventEmitter();
        this.onPhoneFieldChanged = this.onPhoneFieldChanged.bind(this);
    }
    Object.defineProperty(UsernameFieldComponentCore.prototype, "data", {
        set: function (data) {
            this._usernameAttributes = data.usernameAttributes;
            this._placeholder = data.placeholder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UsernameFieldComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UsernameFieldComponentCore.prototype, "placeholder", {
        set: function (placeholder) {
            this._placeholder = placeholder;
        },
        enumerable: true,
        configurable: true
    });
    UsernameFieldComponentCore.prototype.ngOnInit = function () {
        if (window &&
            window.location &&
            window.location.search &&
            this._usernameAttributes !== 'email' &&
            this._usernameAttributes !== 'phone_number') {
            var searchParams = new URLSearchParams(window.location.search);
            var username = searchParams ? searchParams.get('username') : undefined;
            this.setUsername(username);
            this.username = username;
        }
    };
    UsernameFieldComponentCore.prototype.ngOnDestroy = function () { };
    UsernameFieldComponentCore.prototype.setUsername = function (username) {
        this.usernameFieldChanged.emit({
            username: username,
        });
    };
    UsernameFieldComponentCore.prototype.setEmail = function (email) {
        this.usernameFieldChanged.emit({
            email: email,
        });
    };
    UsernameFieldComponentCore.prototype.getUsernameLabel = function () {
        return (labelMap[this._usernameAttributes] || this._usernameAttributes);
    };
    UsernameFieldComponentCore.prototype.getPlaceholder = function () {
        return this.amplifyService
            .i18n()
            .get("" + this.getUsernameLabel() || this._placeholder);
    };
    UsernameFieldComponentCore.prototype.onPhoneFieldChanged = function (event) {
        this.usernameFieldChanged.emit(__assign({}, event));
    };
    UsernameFieldComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-username-field-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    UsernameFieldComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    UsernameFieldComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
        "placeholder": [{ type: Input },],
        "usernameFieldChanged": [{ type: Output },],
    };
    return UsernameFieldComponentCore;
}());
export { UsernameFieldComponentCore };
//# sourceMappingURL=username-field.component.core.js.map