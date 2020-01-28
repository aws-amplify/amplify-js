var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmplifyService } from './providers/amplify.service';
import { AuthenticatorIonicComponent } from './components/authenticator/authenticator/authenticator.component.ionic';
import { ConfirmSignInComponentIonic } from './components/authenticator/confirm-sign-in-component/confirm-sign-in-component.ionic';
import { ConfirmSignUpComponentIonic } from './components/authenticator/confirm-sign-up-component/confirm-sign-up.component.ionic';
import { ForgotPasswordComponentIonic } from './components/authenticator/forgot-password-component/forgot-password.component.ionic';
import { GreetingComponentIonic } from './components/authenticator/greeting-component/greeting.component.ionic';
import { SignInComponentIonic } from './components/authenticator/sign-in-component/sign-in.component.ionic';
import { SignUpComponentIonic } from './components/authenticator/sign-up-component/sign-up.component.ionic';
import { PhoneFieldComponentIonic } from './components/authenticator/phone-field-component/phone-field.component.ionic';
import { UsernameFieldComponentIonic } from './components/authenticator/username-field-component/username-field.component.ionic';
import { RequireNewPasswordComponentIonic } from './components/authenticator/require-new-password-component/require-new-password.component.ionic';
import { PhotoPickerIonicComponent } from './components/storage/photo-picker-component/photo-picker.component.ionic';
import { S3AlbumComponentIonic } from './components/storage/s3-album-component/s3-album.component.ionic';
import { S3ImageComponentIonic } from './components/storage/s3-image-component/s3-image.component.ionic';
import { ChatbotComponentIonic } from './components/interactions/chatbot/chatbot.component.ionic';
import { SumerianSceneComponentIonic } from './components/xr/sumerian-scene-component/sumerian-scene.component.ionic';
import { SumerianSceneLoadingComponentIonic } from './components/xr/sumerian-scene-component/sumerian-scene-loading.component.ionic';
// tslint:enable:max-line-length
var components = [
    AuthenticatorIonicComponent,
    ConfirmSignInComponentIonic,
    ConfirmSignUpComponentIonic,
    ForgotPasswordComponentIonic,
    GreetingComponentIonic,
    SignInComponentIonic,
    SignUpComponentIonic,
    UsernameFieldComponentIonic,
    PhoneFieldComponentIonic,
    RequireNewPasswordComponentIonic,
    PhotoPickerIonicComponent,
    S3AlbumComponentIonic,
    S3ImageComponentIonic,
    ChatbotComponentIonic,
    SumerianSceneComponentIonic,
    SumerianSceneLoadingComponentIonic,
];
var AmplifyIonicModule = /** @class */ (function () {
    function AmplifyIonicModule() {
    }
    AmplifyIonicModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule, FormsModule],
                    declarations: __spreadArrays(components),
                    entryComponents: __spreadArrays(components),
                    providers: [AmplifyService],
                    schemas: [CUSTOM_ELEMENTS_SCHEMA],
                    exports: __spreadArrays(components),
                },] },
    ];
    return AmplifyIonicModule;
}());
export { AmplifyIonicModule };
//# sourceMappingURL=aws-amplify-ionic-module.js.map