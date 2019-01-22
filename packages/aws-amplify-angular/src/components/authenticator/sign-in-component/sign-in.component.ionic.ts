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
import { AmplifyService, AuthState } from '../../../providers';
import { SignInComponentCore } from './sign-in.component.core';

const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">{{this.header}}</div>
  <div class="{{applyClasses('sectionBody')}}">
    <ion-list lines="none">
      <ion-item lines="none">
        <ion-label class="{{applyClasses('inputLabel')}}"
        for="username" position="stacked">
          Username *
        </ion-label>
        <ion-input type="text" 
          #username
          class="{{applyClasses('amplifyIonicInput')}}"
          (keyup)="setUsername($event.target.value)">
        </ion-input>
      </ion-item>
      <ion-item lines="none">
        <ion-label class="{{applyClasses('inputLabel')}}" 
        for="password" position="stacked">
          Password *
        </ion-label>
        <ion-input 
          #password
          type="password" 
          class="{{applyClasses('amplifyIonicInput')}}"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
        ></ion-input>
      </ion-item>
    </ion-list>
  </div>
  <ion-button expand="block" color="primary" (click)="onSignIn()">
    Sign In
  </ion-button>
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
      No account?  
      <a class="{{applyClasses('a')}}" (click)="onSignUp()">Create account</a>
    </span>
  </div>
  <br />
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
      <a class="{{applyClasses('a')}}" (click)="onForgotPassword()">Reset Password</a>
    </span>
  </div>
  <div class="{{applyClasses('amplifyAlert')}}" *ngIf="errorMessage">
    <div class="{{applyClasses('amplifyAlertBody')}}">
      <span class="amplify-alert-icon {{_classOverrides.amplifyAlertBody}}">&#9888;</span>
      <div class="{{applyClasses('amplifyAlertMessage')}}">{{ errorMessage }}</div>
      <a class="{{applyClasses('amplifyAlertClose')}}" (click)="onamplifyAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-sign-in-ionic',
  template
})
export class SignInComponentIonic extends SignInComponentCore {

  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
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
