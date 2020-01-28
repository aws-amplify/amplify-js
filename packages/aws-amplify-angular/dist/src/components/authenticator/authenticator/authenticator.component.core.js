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
import { Component, Input } from '@angular/core';
import { AmplifyService } from '../../../providers';
var template = "\n  <div class=\"amplify-authenticator\">\n    <amplify-auth-sign-in-core\n      *ngIf=\"!shouldHide('SignIn')\"\n      [authState]=\"authState\"\n      [usernameAttributes]=\"_usernameAttributes\"\n      [hide]=\"hide\"\n    ></amplify-auth-sign-in-core>\n\n    <amplify-auth-sign-up-core\n      *ngIf=\"!shouldHide('SignUp')\"\n      [authState]=\"authState\"\n      [signUpConfig]=\"_signUpConfig\"\n      [usernameAttributes]=\"_usernameAttributes\"\n      [hide]=\"hide\"\n    ></amplify-auth-sign-up-core>\n\n    <amplify-auth-confirm-sign-up-core\n      *ngIf=\"!shouldHide('ConfirmSignUp')\"\n      [authState]=\"authState\"\n      [usernameAttributes]=\"_usernameAttributes\"\n      [hide]=\"hide\"\n    ></amplify-auth-confirm-sign-up-core>\n\n    <amplify-auth-confirm-sign-in-core\n      *ngIf=\"!shouldHide('ConfirmSignIn')\"\n      [authState]=\"authState\"\n      [hide]=\"hide\"\n    ></amplify-auth-confirm-sign-in-core>\n\n    <amplify-auth-forgot-password-core\n      *ngIf=\"!shouldHide('ForgotPassword')\"\n      [authState]=\"authState\"\n      [usernameAttributes]=\"_usernameAttributes\"\n      [hide]=\"hide\"\n    ></amplify-auth-forgot-password-core>\n\n    <amplify-auth-greetings-core\n    *ngIf=\"!shouldHide('Greetings')\"\n    [authState]=\"authState\"\n    [usernameAttributes]=\"_usernameAttributes\"\n    ></amplify-auth-greetings-core>\n\n     <amplify-auth-require-new-password-core\n      *ngIf=\"!shouldHide('RequireNewPassword')\"\n      [authState]=\"authState\"\n      [hide]=\"hide\"\n    ></amplify-auth-require-new-password-core>\n  </div>\n";
var AuthenticatorComponentCore = /** @class */ (function () {
    function AuthenticatorComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this.authState = {
            state: 'loading',
            user: null,
        };
        this._signUpConfig = {};
        this._usernameAttributes = 'username';
        this.hide = [];
        this.subscribe();
    }
    AuthenticatorComponentCore.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
        else {
            var loadStatus = this.amplifyService
                .auth()
                .currentAuthenticatedUser()
                .then(function (user) {
                if (_this.authState.state === 'loading' && user) {
                    _this.amplifyService.setAuthState({ state: 'signedIn', user: user });
                }
            })
                .catch(function (e) {
                if (_this.authState.state === 'loading') {
                    _this.amplifyService.setAuthState({ state: 'signIn', user: null });
                }
            });
        }
    };
    Object.defineProperty(AuthenticatorComponentCore.prototype, "data", {
        set: function (data) {
            if (data.signUpConfig) {
                this._signUpConfig = data.signUpConfig;
            }
            if (data.hide) {
                this.hide = data.hide;
            }
            this._usernameAttributes =
                data.usernameAttributes || this._usernameAttributes || 'username';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticatorComponentCore.prototype, "signUpConfig", {
        set: function (signUpConfig) {
            this._signUpConfig = signUpConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthenticatorComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes || 'username';
        },
        enumerable: true,
        configurable: true
    });
    AuthenticatorComponentCore.prototype.subscribe = function () {
        var _this = this;
        this.amplifyService.authStateChange$.subscribe(function (state) {
            _this.authState = state;
        }, function () {
            _this.authState = {
                state: 'signIn',
                user: null,
            };
        });
    };
    AuthenticatorComponentCore.prototype.shouldHide = function (comp) {
        return this.hide.filter(function (item) { return item === comp; }).length > 0;
    };
    AuthenticatorComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-authenticator-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    AuthenticatorComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, },
    ]; };
    AuthenticatorComponentCore.propDecorators = {
        "hide": [{ type: Input },],
        "data": [{ type: Input },],
        "signUpConfig": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
    };
    return AuthenticatorComponentCore;
}());
export { AuthenticatorComponentCore };
//# sourceMappingURL=authenticator.component.core.js.map