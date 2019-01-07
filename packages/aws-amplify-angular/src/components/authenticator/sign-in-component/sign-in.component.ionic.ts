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
import { SignInComponentCore } from './sign-in.component.core';

const template = `
<div class="{{amplifyUI.formSection}}" *ngIf="_show">
  <div class={{amplifyUI.sectionHeader}}>Sign In</div>
  <div class={{amplifyUI.sectionBody}}>
    <ion-list lines="none">
      <ion-item lines="none">
        <ion-label class={{amplifyUI.inputLabel}} for="username" position="stacked">
          Username *
        </ion-label>
        <ion-input type="text" 
          #username
          class={{amplifyUI.input}}
          (keyup)="setUsername($event.target.value)">
        </ion-input>
      </ion-item>
      <ion-item lines="none">
        <ion-label class={{amplifyUI.inputLabel}} for="password" position="stacked">
          Password *
        </ion-label>
        <ion-input 
          #password
          type="password" 
          class={{amplifyUI.input}}
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
        ></ion-input>
      </ion-item>
    </ion-list>
  </div>
  <ion-button expand="block" color="primary" (click)="onSignIn()">
    Sign In
  </ion-button>
  <div class={{amplifyUI.sectionFooter}}>
    <span class={{amplifyUI.sectionFooterSecondaryContent}}>
      No account?  
      <a class={{amplifyUI.a}} (click)="onSignUp()">Create account</a>
    </span>
  </div>
  <div class={{amplifyUI.sectionFooter}}>
    <span class={{amplifyUI.sectionFooterSecondaryContent}}>
      Reset Password  
      <a  class={{amplifyUI.a}} (click)="onForgotPassword()">Reset Password</a>
     </span>
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
  selector: 'amplify-auth-sign-in-ionic',
  template
})
export class SignInComponentIonic extends SignInComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);    
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    alert(err.message || err);
  }
  
}
