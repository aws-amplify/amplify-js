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
import { UsernameAttributes } from '../types';
import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-greeting\" *ngIf=\"signedIn\">\n    <div class=\"amplify-greeting-text\">{{ greeting }}</div>\n    <div class=\"amplify-greeting-flex-spacer\"></div>\n    <a class=\"amplify-form-link amplify-greeting-sign-out\"\n      (click)=\"onSignOut()\"\n      data-test=\"" + auth.greeting.signOutButton + "\"\n    >{{ this.amplifyService.i18n().get('Sign Out') }}</a>\n</div>\n";
var GreetingComponentCore = /** @class */ (function () {
    function GreetingComponentCore(amplifyService) {
        this.amplifyService = amplifyService;
        this._usernameAttributes = 'username';
        this.logger = this.amplifyService.logger('GreetingComponent');
        this.subscribe();
    }
    Object.defineProperty(GreetingComponentCore.prototype, "usernameAttributes", {
        set: function (usernameAttributes) {
            this._usernameAttributes = usernameAttributes;
        },
        enumerable: true,
        configurable: true
    });
    GreetingComponentCore.prototype.ngOnInit = function () {
        if (!this.amplifyService.auth()) {
            throw new Error('Auth module not registered on AmplifyService provider');
        }
    };
    GreetingComponentCore.prototype.subscribe = function () {
        var _this = this;
        this.amplifyService.authStateChange$.subscribe(function (state) {
            return _this.setAuthState(state);
        });
    };
    GreetingComponentCore.prototype.setAuthState = function (authState) {
        this.authState = authState;
        this.signedIn = authState.state === 'signedIn';
        var username = '';
        if (authState.user) {
            if (this._usernameAttributes === UsernameAttributes.EMAIL) {
                username = authState.user.attributes
                    ? authState.user.attributes.email
                    : authState.user.username;
            }
            else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
                username = authState.user.attributes
                    ? authState.user.attributes.phone_number
                    : authState.user.username;
            }
            else {
                username = authState.user.username;
            }
        }
        this.greeting = this.signedIn
            ? this.amplifyService
                .i18n()
                .get('Hello, {{username}}')
                .replace('{{username}}', username)
            : '';
    };
    GreetingComponentCore.prototype.onSignOut = function () {
        this.amplifyService.auth().signOut();
    };
    GreetingComponentCore.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-greetings-core',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    GreetingComponentCore.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    GreetingComponentCore.propDecorators = {
        "authState": [{ type: Input },],
        "usernameAttributes": [{ type: Input },],
    };
    return GreetingComponentCore;
}());
export { GreetingComponentCore };
//# sourceMappingURL=greeting.component.core.js.map