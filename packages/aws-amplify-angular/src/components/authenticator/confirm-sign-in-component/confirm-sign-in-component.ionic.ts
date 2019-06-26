<<<<<<< HEAD
import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
import { auth } from '../../../assets/data-test-attributes';
=======
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
import { AmplifyService, AuthState } from '../../../providers';
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
>>>>>>> initial commit

const template = `
<div class="amplify-form-container" *ngIf="_show" data-test="${auth.confirmSignIn.section}">
  <div class="amplify-form-body" data-test="${auth.confirmSignIn.bodySection}">
    <div
      class="amplify-form-header amplify-form-header-ionic"
      data-test="${auth.confirmSignIn.headerSection}"
      >
        {{ this.amplifyService.i18n().get('Confirm your sign in code') }}
    </div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">
<<<<<<< HEAD
          {{ this.amplifyService.i18n().get('Code *') }}
        </ion-label>
        <ion-input
=======
          Code *
        </ion-label>
        <ion-input 
>>>>>>> initial commit
          #code
          type="text"
          class="amplify-form-input"
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
          data-test="${auth.confirmSignIn.codeInput}"
        ></ion-input>
      </ion-item>
    </ion-list>

    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onConfirm()"
          data-test="${auth.confirmSignIn.confirmButton}"
        >{{ this.amplifyService.i18n().get('Confirm Code') }}</ion-button>
      </div>
    </div>
  </div>

  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ this.amplifyService.i18n().get(errorMessage) }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>

</div>
`;

@Component({
  selector: 'amplify-auth-confirm-sign-in-ionic',
  template
})
export class ConfirmSignInComponentIonic extends ConfirmSignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  code: string;
  errorMessage: string;

<<<<<<< HEAD
  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
=======
  constructor(amplifyService: AmplifyService) {
>>>>>>> initial commit
    super(amplifyService);
  }
}
