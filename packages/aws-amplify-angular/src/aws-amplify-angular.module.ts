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

import { NgModule, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// tslint:disable:max-line-length
import { AuthenticatorComponent } from './components/authenticator/authenticator/authenticator.factory';
import { AuthenticatorComponentCore } from './components/authenticator/authenticator/authenticator.component.core';
import { ConfirmSignInComponent } from './components/authenticator/confirm-sign-in-component/confirm-sign-in.factory';
import { ConfirmSignInComponentCore } from './components/authenticator/confirm-sign-in-component/confirm-sign-in-component.core';
import { ConfirmSignUpComponent } from './components/authenticator/confirm-sign-up-component/confirm-sign-up.factory';
import { ConfirmSignUpComponentCore } from './components/authenticator/confirm-sign-up-component/confirm-sign-up.component.core';
import { SignInComponent } from './components/authenticator/sign-in-component/sign-in.component.factory';
import { SignInComponentCore } from './components/authenticator/sign-in-component/sign-in.component.core';
import { SignUpComponent } from './components/authenticator/sign-up-component/sign-up.factory';
import { SignUpComponentCore } from './components/authenticator/sign-up-component/sign-up.component.core';
import { RequireNewPasswordComponent } from './components/authenticator/require-new-password-component/require-new-password.factory';
import { RequireNewPasswordComponentCore } from './components/authenticator/require-new-password-component/require-new-password.component.core';
import { GreetingComponent } from './components/authenticator/greeting-component/greeting.factory';
import { GreetingComponentCore } from './components/authenticator/greeting-component/greeting.component.core';
import { ForgotPasswordComponent } from './components/authenticator/forgot-password-component/forgot-password.factory';
import { ForgotPasswordComponentCore } from './components/authenticator/forgot-password-component/forgot-password.component.core';
import { UsernameFieldComponentCore } from './components/authenticator/username-field-component/username-field.component.core';
import { PhoneFieldComponentCore } from './components/authenticator/phone-field-component/phone-field.component.core';
import { S3AlbumComponent } from './components/storage/s3-album-component/s3-album.factory';
import { S3AlbumComponentCore } from './components/storage/s3-album-component/s3-album.component.core';
import { S3ImageComponent } from './components/storage/s3-image-component/s3-image.factory';
import { S3ImageComponentCore } from './components/storage/s3-image-component/s3-image.component.core';
import { PhotoPickerComponent } from './components/storage/photo-picker-component/photo-picker.factory';
import { PhotoPickerComponentCore } from './components/storage/photo-picker-component/photo-picker.component.core';
import { ChatBotComponent } from './components/interactions/chatbot/chatbot.factory';
import { ChatbotComponentCore } from './components/interactions/chatbot/chatbot.component.core';
import { DynamicComponentDirective } from './directives/dynamic.component.directive';
import { FormComponent } from './components/common/form.component';
import { SumerianSceneComponent } from './components/xr/sumerian-scene-component/sumerian-scene.factory';
import { SumerianSceneComponentCore } from './components/xr/sumerian-scene-component/sumerian-scene.component.core';
import { SumerianSceneLoadingComponentCore } from './components/xr/sumerian-scene-component/sumerian-scene-loading.component.core';
// tslint:enable:max-line-length

const components = [
	AuthenticatorComponent,
	AuthenticatorComponentCore,
	ConfirmSignInComponent,
	ConfirmSignInComponentCore,
	ConfirmSignUpComponent,
	ConfirmSignUpComponentCore,
	SignInComponent,
	SignInComponentCore,
	SignUpComponent,
	SignUpComponentCore,
	RequireNewPasswordComponent,
	RequireNewPasswordComponentCore,
	GreetingComponent,
	GreetingComponentCore,
	ForgotPasswordComponent,
	ForgotPasswordComponentCore,
	UsernameFieldComponentCore,
	PhoneFieldComponentCore,
	S3AlbumComponent,
	S3AlbumComponentCore,
	S3ImageComponent,
	S3ImageComponentCore,
	PhotoPickerComponent,
	PhotoPickerComponentCore,
	ChatBotComponent,
	ChatbotComponentCore,
	FormComponent,
	SumerianSceneComponent,
	SumerianSceneComponentCore,
	SumerianSceneLoadingComponentCore,
];

@NgModule({
	imports: [CommonModule, FormsModule],
	declarations: [DynamicComponentDirective, ...components],
	entryComponents: [...components],
	providers: [],
	exports: [...components],
})
export class AmplifyAngularModule {}
