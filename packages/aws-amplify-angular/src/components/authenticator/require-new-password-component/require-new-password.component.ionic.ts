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
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div
  class="amplify-authenticator amplify-authenticator-ionic"
  *ngIf="_show"
  data-test="${auth.requireNewPassword.section}"
  >
  <div class="amplify-form-body" data-test="${auth.requireNewPassword.bodySection}">
    <div
      class="amplify-form-header amplify-form-header-ionic"
      data-test="${auth.requireNewPassword.headerSection}"
      >
      {{ this.amplifyService.i18n().get('Reset your password') }}
    </div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">
          {{ this.amplifyService.i18n().get('Password') }}
        </ion-label>
        <ion-input
          #password
          type="password"
          class="amplify-form-input"
          (input)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
          data-test="${auth.requireNewPassword.newPasswordInput}"
        ></ion-input>
      </ion-item>

    </ion-list>

    <div class="amplify-form-actions">
      <div class="amplify-form-row">
        <ion-button
          expand="block"
          (click)="onSignIn()"
          data-test="${auth.requireNewPassword.backToSignInLink}"
        >{{ this.amplifyService.i18n().get('Back to Sign In') }}</ion-button>
      </div>
      <div class="amplify-form-row">
        <ion-button
          expand="block"
          (click)="onSubmit()"
          data-test="${auth.requireNewPassword.submitButton}"
        >Submit</ion-button>
      </div>
    </div>
  </div>
  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ errorMessage }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
	selector: 'amplify-auth-require-new-password-ionic',
	template,
})
export class RequireNewPasswordComponentIonic extends RequireNewPasswordComponentCore {
	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
