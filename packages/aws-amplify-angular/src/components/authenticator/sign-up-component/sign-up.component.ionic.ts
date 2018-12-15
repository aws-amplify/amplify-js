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
import { SignUpComponentCore } from './sign-up.component.core';
import { countrylist, country }  from '../../../assets/countries';


const template = `
<div class="amplify-authenticator" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header">{{this.header}}</div>
    <ion-list lines="none">
      <ion-item lines="none" *ngFor="let field of signUpFields">
        <ion-label class="amplify-input-label" 
        position="stacked" 
        *ngIf="field.key !== 'phone_number'"
        >
          {{field.label}} 
          <span *ngIf="field.required">*</span>
        </ion-label>
        <ion-input
          [ngClass]="{'amplify-input-invalid ': field.invalid}"
          *ngIf="field.key !== 'phone_number'"
          #{{field.key}}
          type="text"
          class="amplify-form-input"
          type={{field.type}}
          placeholder={{field.label}}
          (keyup)="setProp($event.target)"
          name={{field.key}}
        ></ion-input>
       
        <ion-content *ngIf="field.key === 'phone_number'" class="amplify-phone-ion-content">
          <ion-grid class="amplify-ionic-grid-padding-left">
            <ion-row>
              <ion-col col-6 class="amplify-ionic-grid-padding-left">
                <ion-label class="amplify-input-label push-right" 
                position="stacked" 
                *ngIf="field.key === 'phone_number'"
                >
                  {{field.label}}
                  <span *ngIf="field.required">*</span>
                </ion-label>
                <ion-select #countryCode
                *ngIf="field.key === 'phone_number'"
                name="countryCode" 
                [value]="country_code"
                class="amplify-select-phone-country" 
                [ngClass]="{'amplify-input-invalid ': field.invalid}"
                (ionChange)="onCodeChange($event.target.value)">
                  <ion-select-option *ngFor="let country of countries"  
                  value={{country.value}}>
                    {{country.label}} 
                  </ion-select-option>
                </ion-select>
              </ion-col>

              <ion-col col-6>
                <ion-label class="amplify-input-label push-right">&nbsp;</ion-label>
                <ion-input 
                  #phone_number
                  [ngClass]="{'amplify-input-invalid ': field.invalid}"
                  *ngIf="field.key === 'phone_number'"
                  type={{field.type}}
                  class="amplify-form-input-phone-ionic"
                  placeholder={{field.label}}
                  (ionChange)="onNumberChange($event.target.value)"
                  name="local_phone_number"
                ></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-item>    
    </ion-list>
    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onSignUp()"
        >Sign Up</ion-button>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">
          Have an account? 
          <a class="amplify-form-link" (click)="onSignIn()">Sign In</a>
        </div>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">
          Have an code?
          <a class="amplify-form-link" (click)="onConfirmSignUp()">Confirm</a>
        </div>
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
  selector: 'amplify-auth-sign-up-ionic',
  template,
})
export class SignUpComponentIonic extends SignUpComponentCore {

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

  setProp(target){
    return this.user[target.name] = target.value;
  }

  onCodeChange(val) {
    this.country_code = val;
  }

  onNumberChange(val) {
    this.local_phone_number = val;
  }
}
