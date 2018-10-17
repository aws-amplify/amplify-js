import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { SignUpComponentCore } from './sign-up.component.core';
import { countrylist, country }  from '../../../assets/countries';


const template = `
<div class="amplify-authenticator" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header">Create a new account</div>
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
          *ngIf="field.key !== 'phone_number'"
          #{{field.key}}
          type="text"
          class="amplify-form-input"
          placeholder={{field.label}}
          [value]="user[field.label]"
          name={{field.key}}
        ></ion-input>
        <ion-label class="amplify-input-label pull-right" 
        position="stacked" 
        *ngIf="field.key === 'phone_number'"
        >
          {{field.label}}
          <span *ngIf="field.required">*</span>
        </ion-label>
        <ion-select #countryCode
        slot="start"
        *ngIf="field.key === 'phone_number'"
        name="countryCode" 
        class="amplify-select-phone-country" 
        [value]="country_code">
          <ion-select-option *ngFor="let country of countries"  
          value={{country.value}}>
            {{country.label}} 
          </ion-select-option>
        </ion-select>
        <ion-input 
          slot="end"
          #phone_number
          *ngIf="field.key === 'phone_number'"
          type="tel"
          class="amplify-form-input"
          placeholder={{field.label}}
          (keyup)="setProp($event.target)"
          name="local_phone_number"
        ></ion-input>
      </ion-item>
    
    </ion-list>
    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onSignUp()"
        >Sign Up</ion-button>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">Have an account? <a class="amplify-form-link" (click)="onSignIn()">Sign In</a></div>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">Have an code? <a class="amplify-form-link" (click)="onConfirmSignUp()">Confirm</a></div>
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
`

@Component({
  selector: 'amplify-auth-sign-up-ionic',
  template
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

}
