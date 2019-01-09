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
import { ForgotPasswordComponentCore } from './forgot-password.component.core';

const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">Reset your password
    <br />
    <div *ngIf="!code_sent" class="{{applyClasses('hint')}}">
      You will receive a verification code
    </div>
    <div *ngIf="code_sent" class="{{applyClasses('hint')}}">
      Enter the code you received and set a new password
    </div>
  </div>
  <div class="{{applyClasses('sectionBody')}}">
    <ion-list>
      <ion-item lines="none" *ngIf="!code_sent">
        <ion-label class="{{applyClasses('inputLabel')}}" position="stacked">
          Username *
        </ion-label>
        <ion-input type="text" 
       class="{{applyClasses('input')}}"
          (keyup)="setUsername($event.target.value)"
          [value]="username"
        ></ion-input>
      </ion-item>
    
      <ion-item lines="none" *ngIf="code_sent">
        <ion-label class="{{applyClasses('inputLabel')}}" position="stacked">
          Code *
        </ion-label>
        <ion-input 
          #code
          type="text"
         class="{{applyClasses('input')}}"
          (keyup)="setCode(code.value)"
        ></ion-input>
      </ion-item>
      <ion-item lines="none" *ngIf="code_sent">
        <ion-label class="{{applyClasses('inputLabel')}}" position="stacked">
          Password *
        </ion-label>
        <ion-input 
          #password
          type="password"
         class="{{applyClasses('input')}}"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
        ></ion-input>
      </ion-item>
    </ion-list>
  </div>
  <ion-button *ngIf="!code_sent"
  class="{{applyClasses('button')}}" 
  expand="block" color="primary" (click)="onSend()">Submit</ion-button>
  <ion-button *ngIf="code_sent"
  class="{{applyClasses('button')}}" 
  expand="block" color="primary" (click)="onSubmit()">Verify</ion-button>
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterPrimaryContent')}}">
      Have an account?  
      <a class="{{applyClasses('a')}}" (click)="onSignIn()">Back to SignIn</a>
    </span>
    <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
      Lost your code?  
      <a class="{{applyClasses('a')}}" (click)="onSend()">Resend</a>
    </span>
  </div>
  <div class="{{applyClasses('amplifyAlert')}}" *ngIf="errorMessage">
    <div class="{{applyClasses('alertBody')}}">
      <span class="{{applyClasses('alertIcon')}}">&#9888;</span>
      <div class="{{applyClasses('alertMessage')}}">{{ errorMessage }}</div>
      <a class="{{applyClasses('alertClose')}}" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-forgot-password-ionic',
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
export class ForgotPasswordComponentIonic extends ForgotPasswordComponentCore {


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
