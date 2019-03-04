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
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header amplify-form-header-ionic">Reset your password</div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Password</ion-label>
        <ion-input 
          #password
          type="password"
          class="amplify-form-input"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
        ></ion-input>
      </ion-item>

    </ion-list>

    <div class="amplify-form-row">
    <ion-button
      expand="block"
      (click)="onSignIn()"
    >Back to Sign In</ion-button>
    <ion-button
      expand="block"
      (click)="onSubmit()"
    >Submit</ion-button>
    </div>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>

`;

@Component({
  selector: 'amplify-auth-require-new-password-ionic',
  template: template
})
export class RequireNewPasswordComponentIonic extends RequireNewPasswordComponentCore {


  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }


}
