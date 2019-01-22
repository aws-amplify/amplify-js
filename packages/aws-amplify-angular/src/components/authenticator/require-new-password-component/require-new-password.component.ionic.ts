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
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';

const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">
    You are required to update your password
  </div>
  <div class="{{applyClasses('sectionBody')}}">
    <ion-list>
      <ion-item lines="none">
        <ion-label class="{{applyClasses('formField')}}" position="stacked">
          Password
        </ion-label>
        <ion-input 
          #password
          type="password"
          class="{{applyClasses('amplifyIonicInput')}}"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
        ></ion-input>
      </ion-item>
    </ion-list>
  </div>
  <ion-button expand="block"(click)="onSubmit()" color="primary">Submit</ion-button> 
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterPrimaryContent')}}">
      Have an account?  
      <a class="{{applyClasses('a')}}" (click)="onSignIn()">Back to SignIn</a>
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
  selector: 'amplify-auth-require-new-password-ionic',
  template,
  styles: [
    `.amplify-input-label {
      font-size: 14px;
      margin: 0.5em;
      letter-spacing: 0.4px;
      line-height: 18px;
    }`,
  ]
})
export class RequireNewPasswordComponentIonic extends RequireNewPasswordComponentCore {


  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
    super(amplifyService);
    
  }
}
