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
import { GreetingComponentCore } from './greeting.component.core';
import { auth } from '../../../assets/data-test-attributes';
var template = "\n<div class=\"amplify-greeting\" *ngIf=\"signedIn\">\n    <div class=\"amplify-greeting-text\">{{ greeting }}</div>\n    <div class=\"amplify-greeting-flex-spacer\"></div>\n    <ion-button\n        class=\"amplify-greeting-sign-out\"\n        size=\"small\"\n        *ngIf=\"signedIn\"\n        (click)=\"onSignOut()\"\n        data-test=\"" + auth.greeting.signOutButton + "\"\n      >{{ this.amplifyService.i18n().get('Sign Out') }}</ion-button>\n</div>\n";
var GreetingComponentIonic = /** @class */ (function (_super) {
    __extends(GreetingComponentIonic, _super);
    function GreetingComponentIonic(amplifyService) {
        var _this = _super.call(this, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    GreetingComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-auth-greetings-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    GreetingComponentIonic.ctorParameters = function () { return [
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return GreetingComponentIonic;
}(GreetingComponentCore));
export { GreetingComponentIonic };
//# sourceMappingURL=greeting.component.ionic.js.map