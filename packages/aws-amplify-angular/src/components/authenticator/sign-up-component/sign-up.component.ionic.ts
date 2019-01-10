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
import { SignUpComponentCore } from './sign-up.component.core';
import { countrylist, country }  from '../../../assets/countries';


const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">{{this.header}}</div>
  <div class="{{applyClasses('sectionBody')}}">
    <ion-list lines="none">
      <ion-item lines="none" *ngFor="let field of signUpFields">
        <ion-label class="{{applyClasses('inputLabel')}}" 
        position="stacked" 
        *ngIf="field.key !== 'phone_number'">
          {{field.label}} 
          <span *ngIf="field.required">*</span>
        </ion-label>
        <ion-input
          [ngClass]="{'amplify-input-invalid ': field.invalid}"
          *ngIf="field.key !== 'phone_number'"
          #{{field.key}}
          type="text"
          class="{{applyClasses('input')}}"
          type={{field.type}}
          placeholder={{field.label}}
          (keyup)="setProp($event.target)"
          name={{field.key}}
        ></ion-input>
        <ion-content *ngIf="field.key === 'phone_number'" 
        class="amplify-phone-ion-content {{_classOverrides.ionicContentPhone}}">
          <ion-grid class="amplify-ionic-grid-padding-left {{_classOverrides.ionicGridPhone}}">
            <ion-row align-items-end>
              <ion-col size="5" class="amplify-ionic-grid-padding-left">
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
                class="amplify-select-phone-country {{_classOverrides.ionicSelectPhone}}" 
                [ngClass]="{'amplify-input-invalid ': field.invalid}"
                (ionChange)="onCodeChange($event.target.value)">
                  <ion-select-option *ngFor="let country of countries"  
                  value={{country.value}}>
                    {{country.label}} 
                  </ion-select-option>
                </ion-select>
              </ion-col>

              <ion-col size="6">
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
  </div>
  <ion-button expand="block" color="primary" (click)="onSignUp()">Sign Up</ion-button>
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterPrimaryContent')}}">
      Have an account? <a class="{{applyClasses('a')}}" (click)="onSignIn()">Sign in</a>
    </span>
    <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
        Have an code?
        <a class="{{applyClasses('a')}}" (click)="onConfirmSignUp()">Confirm</a>
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
  selector: 'amplify-auth-sign-up-ionic',
  template,
  styles: [
    `.amplify-input-label {
      font-size: 14px;
      margin: 0.5em 0.5em 0.5em 0;
      letter-spacing: 0.4px;
      line-height: 18px;
    }`,
    `.amplify-form-input {
      border: none
    }`,
    `.amplify-select-phone-country {
      height: 55px;
      min-width: 100%;
      border: var(--input-border);
      border-radius: 3px 0 0 3px;
      background-color: transparent;
    }`,
    `.md .amplify-select-phone-country {
      border: none;
      border-bottom: var(--input-border);
      background-color: transparent;
      margin-top: 0em;
      min-width: 100% !important;
      height: 47px !important;
      padding-left: 0;
    }`,
    `.amplify-form-input-phone-ionic {
      height: 36px;
      min-width: 100%;
      color: var(--color-accent-brown);
      font-size: 14px;
      letter-spacing: 0.4px;
      line-height: 20px;
      border: none;
      border-bottom: var(--input-border);
      border-radius: 0px;
    }`,
    `.amplify-ionic-grid-padding-left {
      padding-left: 0
    }`,
    `.amplify-phone-ion-content {
      height: 100px;
    }`
  ]
})
export class SignUpComponentIonic extends SignUpComponentCore {

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
