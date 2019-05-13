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
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { SignUpComponentCore } from './sign-up.component.core';
import { countrylist, country } from '../../../assets/countries';
import { auth } from '../../../assets/data-test-attributes';


const template = `
<div
  class="amplify-authenticator"
  *ngIf="_show"
  data-test="${auth.signUp.section}"
  >
  <div class="amplify-form-body" data-test="${auth.signUp.bodySection}">
    <div class="amplify-form-header" data-test="${auth.signUp.headerSection}">
      {{ this.amplifyService.i18n().get(this.header) }}</div>
    <ion-list lines="none">
      <ion-item lines="none" *ngFor="let field of signUpFields">
        <ion-label class="amplify-input-label"
        position="stacked"
        *ngIf="field.key !== 'phone_number'"
        >
          {{ this.amplifyService.i18n().get(field.label) }}
          <span *ngIf="field.required">*</span>
        </ion-label>
        <ion-input
          [ngClass]="{'amplify-input-invalid ': field.invalid}"
          *ngIf="field.key !== 'phone_number'"
          #{{field.key}}
          type="text"
          class="amplify-form-input"
          type={{field.type}}
          [placeholder]="this.amplifyService.i18n().get(field.label)"
          (keyup)="setProp($event.target)"
          name={{field.key}}
          data-test="${auth.signUp.nonPhoneNumberInput}"
        ></ion-input>
        <ion-content *ngIf="field.key === 'phone_number'" class="amplify-phone-ion-content">
          <ion-grid class="amplify-ionic-grid-padding-left">
            <ion-row>
              <ion-col size="6" class="amplify-ionic-grid-padding-left">
                <ion-label class="amplify-input-label push-right"
                position="stacked"
                *ngIf="field.key === 'phone_number'"
                >
                  {{ this.amplifyService.i18n().get(field.label) }}
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

              <ion-col size="6">
                <ion-label class="amplify-input-label push-right">&nbsp;</ion-label>
                <ion-input
                  #phone_number
                  [ngClass]="{'amplify-input-invalid ': field.invalid}"
                  *ngIf="field.key === 'phone_number'"
                  type={{field.type}}
                  class="amplify-form-input-phone-ionic"
                  [placeholder]="this.amplifyService.i18n().get(field.label)"
                  (ionChange)="onNumberChange($event.target.value)"
                  name="local_phone_number"
                  data-test="${auth.signUp.phoneNumberInput}"
                ></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-item>
    </ion-list>
    <div class="amplify-form-actions">
      <div class="amplify-form-row">
        <ion-button expand="block" color="primary"
          (click)="onSignUp()"
          data-test="${auth.signUp.createAccountButton}"
        >{{ this.amplifyService.i18n().get('Create Account') }}</ion-button>
      </div>
      <div class="amplify-form-row">
        <div class="amplify-form-signup">
          {{ this.amplifyService.i18n().get('Have an account?') }}
          <a class="amplify-form-link" (click)="onSignIn()" data-test="${auth.signUp.signInButton}">
            {{ this.amplifyService.i18n().get('Sign In') }}
          </a>
        </div>
        <div class="amplify-form-signup" *ngIf="!shouldHide('SignUp')">
          {{ this.amplifyService.i18n().get('Have a code?') }}
          <a
            class="amplify-form-link"
            (click)="onConfirmSignUp()"
            data-test="${auth.signUp.confirmButton}"
            >
            {{ this.amplifyService.i18n().get('Confirm') }}
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ this.amplifyService.i18n().get(errorMessage) }}</div>
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

  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
    super(amplifyService);
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
