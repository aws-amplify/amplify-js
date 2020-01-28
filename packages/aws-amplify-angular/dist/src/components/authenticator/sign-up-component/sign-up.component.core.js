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
import { Component, Input, Inject } from '@angular/core';
import defaultSignUpFieldAssets, { signUpWithEmailFields, signUpWithPhoneNumberFields, } from '../../../assets/default-sign-up-fields';
import { UsernameAttributes } from '../types';
import { AmplifyService } from '../../../providers/amplify.service';
import { labelMap, composePhoneNumber } from '../common';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-container\" *ngIf=\"_show\">\n  <div class=\"amplify-form-container\" data-test=\"" + auth.signUp.section + "\">\n    <div class=\"amplify-form-body\" data-test=\"" + auth.signUp.bodySection + "\">\n      <div\n        class=\"amplify-form-header\"\n        data-test=\"" + auth.signUp.headerSection + "\"\n        >{{ this.amplifyService.i18n().get(this.header) }}</div>\n      <div class=\"amplify-form-row\" *ngFor=\"let field of signUpFields\">\n        <div *ngIf=\"field.key !== 'phone_number'\">\n          <label class=\"amplify-input-label\">\n            {{ this.amplifyService.i18n().get(field.label) }}\n            <span *ngIf=\"field.required\">*</span>\n          </label>\n          <input #{{field.key}}\n            class=\"amplify-form-input\"\n            [ngClass]=\"{'amplify-input-invalid ': field.invalid}\"\n            type={{field.type}}\n            [placeholder]=\"this.amplifyService.i18n().get(field.label)\"\n            [(ngModel)]=\"user[field.key]\"\n            name=\"field.key\"\n            data-test=\"" + auth.signUp.nonPhoneNumberInput + "\"\n            />\n            <div *ngIf=\"field.key === 'password'\" class=\"amplify-form-extra-details\">\n              {{passwordPolicy}}\n            </div>\n        </div>\n        <div *ngIf=\"field.key === 'phone_number'\">\n          <amplify-auth-phone-field-core\n            [label]=\"field.label\"\n            [required]=\"field.required\"\n            [placeholder]=\"field.placeholder\"\n            [defaultCountryCode]=\"country_code\"\n            (phoneFieldChanged)=\"onPhoneFieldChanged($event)\"\n          ></amplify-auth-phone-field-core>\n        </div>\n      </div>\n      <div class=\"amplify-form-actions\">\n        <div class=\"amplify-form-cell-left\" *ngIf=\"!shouldHide('SignIn')\">\n          <div class=\"amplify-form-signup\">\n            {{ this.amplifyService.i18n().get('Have an account?') }}\n            <a class=\"amplify-form-link\" (click)=\"onSignIn()\" data-test=\"" + auth.signUp.signInLink + "\">\n              {{ this.amplifyService.i18n().get('Sign in') }}\n            </a>\n          </div>\n        </div>\n        <div class=\"amplify-form-cell-right\">\n          <button class=\"amplify-form-button\"\n          (click)=\"onSignUp()\"\n          data-test=\"" + auth.signUp.createAccountButton + "\"\n          >{{ this.amplifyService.i18n().get('Create Account') }}</button>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"amplify-alert\" *ngIf=\"errorMessage\">\n    <div class=\"amplify-alert-body\">\n      <span class=\"amplify-alert-icon\">&#9888;</span>\n      <div class=\"amplify-alert-message\">{{ this.amplifyService.i18n().get(errorMessage) }}</div>\n      <a class=\"amplify-alert-close\" (click)=\"onAlertClose()\">&times;</a>\n    </div>\n  </div>\n</div>\n";
var SignUpField = /** @class */ (function () {
    function SignUpField() {
    }
    return SignUpField;
}());
export { SignUpField };
var SignUpComponentCore = /** @class */ (function () {
    function SignUpComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._usernameAttributes = 'username';
        this.user = {};
        this.country_code = '1';
        this.header = 'Create a new account';
        this.defaultSignUpFields = defaultSignUpFieldAssets;
        this.signUpFields = this.defaultSignUpFields;
        this.hiddenFields = [];
        this.hide = [];
        this.logger = this.amplifyService.logger('SignUpComponent');
    }
    Object.defineProperty(SignUpComponentCore.prototype, "data", {
        set: function (data) {
            this._authState = data.authState;
            this._show = data.authState.state === 'signUp';
            this._usernameAttributes = data.usernameAttributes;
            if (data.signUpConfig) {
                this._signUpConfig = data.signUpConfig;
                if (this._signUpConfig.defaultCountryCode) {
                    this.country_code = this._signUpConfig.defaultCountryCode;
                }
                if (this._signUpConfig.signUpFields) {
                    this.signUpFields = this._signUpConfig.signUpFields;
                }
                if (this._signUpConfig.header) {
                    this.header = this._signUpConfig.header;
                }
                if (this._signUpConfig.hiddenDefaults) {
                    this.hiddenFields = this._signUpConfig.hiddenDefaults;
                }
                if (this._usernameAttributes === UsernameAttributes.EMAIL) {
                    this.signUpFields = signUpWithEmailFields;
                    this.defaultSignUpFields = signUpWithEmailFields;
                }
                else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
                    this.signUpFields = signUpWithPhoneNumberFields;
                    this.defaultSignUpFields = signUpWithPhoneNumberFields;
                }
                if (this._signUpConfig.passwordPolicy) {
                    this.passwordPolicy = this._signUpConfig.passwordPolicy;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignUpComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes;
            if (this._usernameAttributes === UsernameAttributes.EMAIL) {
                this.signUpFields = signUpWithEmailFields;
                this.defaultSignUpFields = signUpWithEmailFields;
            }
            else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
                this.signUpFields = signUpWithPhoneNumberFields;
                this.defaultSignUpFields = signUpWithPhoneNumberFields;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignUpComponentCore.prototype, "authState", {
        set: function (authState) {
            this._authState = authState;
            this._show = authState.state === 'signUp';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignUpComponentCore.prototype, "signUpConfig", {
        set: function (signUpConfig) {
            if (signUpConfig) {
                this._signUpConfig = signUpConfig;
                if (this._signUpConfig.defaultCountryCode) {
                    this.country_code = this._signUpConfig.defaultCountryCode;
                }
                if (this._signUpConfig.signUpFields) {
                    this.signUpFields = this._signUpConfig.signUpFields;
                }
                if (this._signUpConfig.header) {
                    this.header = this._signUpConfig.header;
                }
                if (this._signUpConfig.hiddenDefaults) {
                    this.hiddenFields = this._signUpConfig.hiddenDefaults;
                }
                if (this._signUpConfig.passwordPolicy) {
                    this.passwordPolicy = this._signUpConfig.passwordPolicy;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    SignUpComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            this.logger.warn('Auth module not registered on AmplifyService provider');
        }
        this.sortFields();
    };
    SignUpComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    SignUpComponentCore.prototype.onSignUp = function () {
        var _this = this;
        // validate  required inputs
        var validation = this.validate();
        if (validation && validation.length > 0) {
            return this._setError("The following fields need to be filled out: " + validation.join(', '));
        }
        // create user attribute property
        this.user.attributes = {};
        // format phone number if it is a signUpField
        var phoneNumberRequested = this.signUpFields.find(function (el) {
            return el.key === 'phone_number';
        });
        if (phoneNumberRequested) {
            this.user.phone_number = composePhoneNumber(this.country_code, this.local_phone_number);
        }
        // create user key and value arrays
        var userKeys = Object.keys(this.user);
        var userValues = userKeys.map(function (key) { return _this.user[key]; });
        // format data for Cognito user pool
        userKeys.forEach(function (key, index) {
            if (key !== 'username' && key !== 'password' && key !== 'attributes') {
                // needsPrefix determines if a custom attribute is indicated
                // and prepends 'custom:' to the key before sending to Cognito if needed
                var newKey = "" + (_this.needPrefix(key) ? 'custom:' : '') + key;
                _this.user.attributes[newKey] = userValues[index];
            }
        });
        var labelCheck = false;
        this.signUpFields.forEach(function (field) {
            if (field.label === _this.getUsernameLabel()) {
                _this.amplifyService.logger("Changing the username to the value of " + field.label, 'DEBUG');
                _this.user.username =
                    _this.user.attributes[field.key] || _this.user.username;
                labelCheck = true;
            }
        });
        if (!labelCheck && !this.user.username) {
            // if the customer customized the username field in the sign up form
            // He needs to either set the key of that field to 'username'
            // Or make the label of the field the same as the 'usernameAttributes'
            throw new Error("Couldn't find the label: " + this.getUsernameLabel() + ", in sign up fields according to usernameAttributes!");
        }
        this.amplifyService
            .auth()
            .signUp(this.user)
            .then(function (user) {
            var username = _this.user.username;
            _this.user = {};
            _this.onAlertClose();
            _this.amplifyService.setAuthState({
                state: 'confirmSignUp',
                user: { username: username },
            });
        })
            .catch(function (err) { return _this._setError(err); });
    };
    SignUpComponentCore.prototype.onSignIn = function () {
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signIn', user: null });
    };
    SignUpComponentCore.prototype.needPrefix = function (key) {
        var field = this.signUpFields.find(function (e) { return e.key === key; });
        if (key.indexOf('custom:') !== 0) {
            return field.custom;
        }
        else if (key.indexOf('custom:') === 0 && field.custom === false) {
            this.logger.warn('Custom prefix prepended to key but custom field flag is set to false');
        }
        return null;
    };
    SignUpComponentCore.prototype.onConfirmSignUp = function () {
        this.onAlertClose();
        this.amplifyService.setAuthState({
            state: 'confirmSignUp',
            user: { username: this.user.username },
        });
    };
    SignUpComponentCore.prototype.sortFields = function () {
        var _this = this;
        if (this.hiddenFields.length > 0) {
            this.defaultSignUpFields = this.defaultSignUpFields.filter(function (d) {
                return !_this.hiddenFields.includes(d.key);
            });
        }
        if (this._signUpConfig &&
            this._signUpConfig.signUpFields &&
            this._signUpConfig.signUpFields.length > 0) {
            if (!this._signUpConfig.hideAllDefaults) {
                // see if fields passed to component should override defaults
                this.defaultSignUpFields.forEach(function (f, i) {
                    var matchKey = _this.signUpFields.findIndex(function (d) {
                        return d.key === f.key;
                    });
                    if (matchKey === -1) {
                        _this.signUpFields.push(f);
                    }
                });
            }
            /*
                    sort fields based on following rules:
                    1. Fields with displayOrder are sorted before those without displayOrder
                    2. Fields with conflicting displayOrder are sorted alphabetically by key
                    3. Fields without displayOrder are sorted alphabetically by key
                  */
            this.signUpFields.sort(function (a, b) {
                if (a.displayOrder && b.displayOrder) {
                    if (a.displayOrder < b.displayOrder) {
                        return -1;
                    }
                    else if (a.displayOrder > b.displayOrder) {
                        return 1;
                    }
                    else {
                        if (a.key < b.key) {
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    }
                }
                else if (!a.displayOrder && b.displayOrder) {
                    return 1;
                }
                else if (a.displayOrder && !b.displayOrder) {
                    return -1;
                }
                else if (!a.displayOrder && !b.displayOrder) {
                    if (a.key < b.key) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                }
            });
            this.signUpFields = this.removeHiddenFields();
        }
    };
    SignUpComponentCore.prototype.onAlertClose = function () {
        this._setError(null);
    };
    SignUpComponentCore.prototype.removeHiddenFields = function () {
        return this.signUpFields.filter(function (f) {
            return !f.displayOrder || f.displayOrder !== -1;
        });
    };
    SignUpComponentCore.prototype.validate = function () {
        var _this = this;
        var invalids = [];
        this.signUpFields.map(function (el) {
            if (el.key !== 'phone_number') {
                if (el.required && !_this.user[el.key]) {
                    el.invalid = true;
                    invalids.push(_this.amplifyService.i18n().get(el.label));
                }
                else {
                    el.invalid = false;
                }
            }
            else {
                if (el.required && (!_this.country_code || !_this.local_phone_number)) {
                    el.invalid = true;
                    invalids.push(_this.amplifyService.i18n().get(el.label));
                }
                else {
                    el.invalid = false;
                }
            }
        });
        return invalids;
    };
    SignUpComponentCore.prototype._setError = function (err) {
        if (!err) {
            this.errorMessage = null;
            return;
        }
        this.errorMessage = err.message || err;
    };
    SignUpComponentCore.prototype.getUsernameLabel = function () {
        return (labelMap[this._usernameAttributes] || this._usernameAttributes);
    };
    SignUpComponentCore.prototype.onPhoneFieldChanged = function (event) {
        this.country_code = event.country_code;
        this.local_phone_number = event.local_phone_number;
    };
    SignUpComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-sign-up-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    SignUpComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    SignUpComponentCore.propDecorators = {
        "data": [{ type: Input },],
        "hide": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
        "authState": [{ type: Input },],
        "signUpConfig": [{ type: Input },],
    };
    return SignUpComponentCore;
}());
export { SignUpComponentCore };
//# sourceMappingURL=sign-up.component.core.js.map