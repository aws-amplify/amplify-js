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
  <div class="{{applyClasses('sectionHeader')}}">Confirm Sign in</div>
  <div class="{{applyClasses('sectionBody')}}">
    <ion-list>
      <ion-item lines="none">
        <ion-label class="{{applyClasses('inputLabel')}}" position="stacked">
          Code *
        </ion-label>
        <ion-input 
          #code
          type="text"
         class="{{applyClasses('input')}}"
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
        ></ion-input>
      </ion-item>
    </ion-list>
  </div>
  <ion-button
    class="{{applyClasses('button')}}" 
    expand="block" color="primary" (click)="onConfirm()">
    Confirm Code
  </ion-button>
  <div class="{{applyClasses('sectionFooter')}}">
      <span class="{{applyClasses('sectionFooterPrimaryContent')}}">
        <a class="{{applyClasses('a')}}" (click)="onSignIn()">Back to Sign in</a>
      </span>
      <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
        <button class="{{applyClasses('button')}}" (click)="onConfirm()">
          Confirm
        </button>
      </span>
    </div>
  <div class="{{applyClasses('amplifyAlert')}}" *ngIf="errorMessage">
    <div class="{{applyClasses('alertBody')}}">
      <span class="amplify-alert-icon {{_classOverrides.alertBody}}">&#9888;</span>
      <div class="{{applyClasses('alertMessage')}}">{{ errorMessage }}</div>
      <a class="{{applyClasses('alertClose')}}" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-confirm-sign-in-ionic',
  template,
  styles: [
    `.amplify-input-label {
      font-size: 14px;
      margin: 0.5em;
      letter-spacing: 0.4px;
      line-height: 18px;
    }`,
    `.amplify-form-input {
      border: none
    }`
  ]
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
