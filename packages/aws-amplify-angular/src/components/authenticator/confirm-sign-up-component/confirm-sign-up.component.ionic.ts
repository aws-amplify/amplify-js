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
import { ConfirmSignUpComponentCore } from './confirm-sign-up.component.core';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header amplify-form-header-ionic">Confirm your sign up code</div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Username *</ion-label>
        <ion-input type="text" 
          class="amplify-form-input"
          (keyup)="setUsername($event.target.value)"
          [value]="username"
        ></ion-input>
      </ion-item>
    
      <ion-item lines="none">
        <ion-label  class="amplify-input-label amplify-input-label-ionic" position="stacked">Code *</ion-label>
        <ion-input 
          #code
          type="text"
          class="amplify-form-input"
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
        ></ion-input>
      </ion-item>
    </ion-list>
      
    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onConfirm()"
        >Confirm Code</ion-button>
      </div>
    <div class="amplify-form-cell-left">
      <div class="amplify-form-signup">Have an account? <a class="amplify-form-link" (click)="onSignIn()">Sign In</a></div>
    </div>
    <div class="amplify-form-cell-left">
      <div class="amplify-form-signup">Lost your code? <a class="amplify-form-link" (click)="onResend()">Resend</a></div>
    </div>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
  
</div>
`;

@Component({
  selector: 'amplify-auth-confirm-sign-up-ionic',
  template
})
export class ConfirmSignUpComponentIonic extends ConfirmSignUpComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
  }


}
