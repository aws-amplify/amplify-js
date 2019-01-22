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
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';

const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">{{this.header}}</div>
  <div class="{{applyClasses('sectionBody')}}">
    <ion-list>
      <ion-item lines="none">
        <ion-label class="{{applyClasses('inputLabel')}}" position="stacked">
          Code *
        </ion-label>
        <ion-input 
          #code
          type="text"
          class="{{applyClasses('amplifyIonicInput')}}"
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
        ></ion-input>
      </ion-item>
    </ion-list>
  </div>
  <ion-button
    expand="block" color="primary" (click)="onConfirm()">
    Confirm Code
  </ion-button>
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
      <a class="{{applyClasses('a')}}" (click)="onSignIn()">Back to Sign in</a>
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
  selector: 'amplify-auth-confirm-sign-in-ionic',
  template
})
export class ConfirmSignInComponentIonic extends ConfirmSignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  code: string;
  errorMessage: string;
  amplifyService: AmplifyService;
  

  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
    super(amplifyService);
  }
}
