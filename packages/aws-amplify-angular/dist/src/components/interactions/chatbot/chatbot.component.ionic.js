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
import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { ChatbotComponentCore } from './chatbot.component.core';
import { AmplifyService } from '../../../providers/amplify.service';
var template = "\n<div class=\"amplify-interactions-container\">\n\t<div class=\"amplify-form-container\">\n\t\t<ion-grid>\n\t\t\t<ion-row *ngIf=\"chatTitle\"> \n\t\t\t\t<ion-col>\n\t\t\t\t\t<ion-row>\n\t\t\t\t\t\t<ion-col align-self-start>\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<ion-chip color=\"primary\">\n\t\t\t\t\t\t\t\t\t<ion-label>{{chatTitle}}</ion-label>\n\t\t\t\t\t\t\t\t</ion-chip>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</ion-col>\n\t\t\t\t\t\t<ion-col align-self-end>\n\t\t\t\t\t\t\t&nbsp;\n\t\t\t\t\t\t</ion-col>\n\t\t\t\t\t</ion-row>\n\t\t\t\t</ion-col>\n\t\t\t</ion-row>\n\t\t\t<ion-row *ngFor=\"let message of messages\">\n\t\t\t\t<ion-col>\n\t\t\t\t\t<ion-row>\n\t\t\t\t\t\t<ion-col align-self-start>\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t&nbsp;\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</ion-col>\n\t\t\t\t\t\t<ion-col align-self-end>\n\t\t\t\t\t\t\t<ion-chip style=\"float:right\">\n\t\t\t\t\t\t\t\t<ion-label>{{message.me}}</ion-label>\n\t\t\t\t\t\t\t</ion-chip>\n\t\t\t\t\t\t</ion-col>\n\t\t\t\t\t</ion-row>\n\t\t\t\t\t<ion-row>\n\t\t\t\t\t\t<ion-col align-self-start>\n\t\t\t\t\t\t\t<ion-chip color=\"primary\">\n\t\t\t\t\t\t\t\t<ion-label>{{message.bot}}</ion-label>\n\t\t\t\t\t\t\t</ion-chip>\n\t\t\t\t\t\t</ion-col>\n\t\t\t\t\t\t<ion-col align-self-end>\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t&nbsp;\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</ion-col>\n\t\t\t\t\t</ion-row>\n\t\t\t\t</ion-col>\n\t\t\t</ion-row>\n\t\t</ion-grid>\n\t\t<div class=\"amplify-form-row\">\n\t\t    <ion-input #inputValue\n\t\t\t\ttype='text'\n\t\t        class=\"amplify-form-input amplify-form-input-interactions-ionic\"\n\t\t        placeholder=\"{{currentVoiceState}}\"\n\t\t        [value]=\"inputText\"\n\t\t        (keyup.enter)=\"onSubmit(inputValue.value)\"\n\t\t\t\t(ionChange)=\"onInputChange($event.target.value)\"\n\t\t\t\t[disabled]=\"inputDisabled\"\n\t\t\t\t*ngIf=\"textEnabled\"></ion-input>\n\t\t\t<ion-input #inputValue\n\t\t\t\ttype='text'\n\t\t\t\tclass=\"amplify-form-input amplify-form-input-interactions-ionic\"\n\t\t\t\tplaceholder=\"{{currentVoiceState}}\"\n\t\t\t\t[disabled]=\"!textEnabled\"\n\t\t\t\t*ngIf=\"!textEnabled\"></ion-input>\n\t\t\t<ion-button \n\t\t\t\texpand=\"block\"\n\t\t\t\t*ngIf=\"voiceEnabled\"\n\t\t\t\tng-style=\"{float: 'right'}\"\n\t\t\t\t(click)=\"micButtonHandler()\"\n\t\t\t\t[disabled]=\"micButtonDisabled\"\n\t\t\t>\n\t\t\t\t{{micText}}\n\t\t\t</ion-button>\n\t\t\t<ion-button\n\t\t\t\texpand=\"block\"\n\t\t\t\t*ngIf=\"textEnabled\"\n\t\t\t\tng-style=\"{float: 'right'}\"\n\t\t\t\t(click)=\"inputDisabled === false || onSubmit(inputValue.value)\"\n\t\t\t>\n\t\t\t\tSend\n\t\t\t</ion-button>\n\t\t</div>\n\t</div>\n</div>\n";
var ChatbotComponentIonic = /** @class */ (function (_super) {
    __extends(ChatbotComponentIonic, _super);
    function ChatbotComponentIonic(ref, amplifyService) {
        var _this = _super.call(this, ref, amplifyService) || this;
        _this.amplifyService = amplifyService;
        return _this;
    }
    ChatbotComponentIonic.decorators = [
        { type: Component, args: [{
                    selector: 'amplify-interactions-ionic',
                    template: template,
                },] },
    ];
    /** @nocollapse */
    ChatbotComponentIonic.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
        { type: AmplifyService, decorators: [{ type: Inject, args: [AmplifyService,] },] },
    ]; };
    return ChatbotComponentIonic;
}(ChatbotComponentCore));
export { ChatbotComponentIonic };
//# sourceMappingURL=chatbot.component.ionic.js.map