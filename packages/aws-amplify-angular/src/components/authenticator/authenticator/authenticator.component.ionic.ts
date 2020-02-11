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

import {
	Component,
	Input,
	ViewEncapsulation,
	Injector,
	ElementRef,
} from '@angular/core';

import { AmplifyService, AuthState } from '../../../providers';
import { AuthenticatorComponentCore } from './authenticator.component.core';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic ">

<amplify-auth-sign-in-ionic
  *ngIf="!shouldHide('SignIn')"
  [authState]="authState"
  [usernameAttributes]="_usernameAttributes"
  [hide]="hide"
></amplify-auth-sign-in-ionic>

<amplify-auth-sign-up-ionic
  *ngIf="!shouldHide('SignUp')"
  [authState]="authState"
  [signUpConfig]="_signUpConfig"
  [usernameAttributes]="_usernameAttributes"
  [hide]="hide"
></amplify-auth-sign-up-ionic>

<amplify-auth-confirm-sign-up-ionic
  *ngIf="!shouldHide('ConfirmSignUp')"
  [authState]="authState"
  [usernameAttributes]="_usernameAttributes"
  [hide]="hide"
></amplify-auth-confirm-sign-up-ionic>

<amplify-auth-confirm-sign-in-ionic
  *ngIf="!shouldHide('ConfirmSignIn')"
  [authState]="authState"
  [hide]="hide"
></amplify-auth-confirm-sign-in-ionic>

<amplify-auth-forgot-password-ionic
  *ngIf="!shouldHide('ForgotPassword')"
  [authState]="authState"
  [usernameAttributes]="_usernameAttributes"
  [hide]="hide"
></amplify-auth-forgot-password-ionic>

<amplify-auth-greetings-ionic
  *ngIf="!shouldHide('Greetings')"
  [authState]="authState"
  [usernameAttributes]="_usernameAttributes"
></amplify-auth-greetings-ionic>

<amplify-auth-require-new-password-ionic
  *ngIf="!shouldHide('RequireNewPassword')"
  [authState]="authState"
  [hide]="hide"
></amplify-auth-require-new-password-ionic>
</div>
`;

@Component({
	selector: 'amplify-authenticator-ionic',
	template,
})
export class AuthenticatorIonicComponent extends AuthenticatorComponentCore {
	constructor(public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
