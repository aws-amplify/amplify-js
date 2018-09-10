import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
import { includes } from '../common';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic" *ngIf="_show">
  <div class="amplify-form-body">
  <div class="amplify-form-header amplify-form-header-ionic">Reset your password</div>
  <div class="amplify-form-text" *ngIf="!code_sent">You will receive a verification code to reset your password</div>

  <ion-list>

    <ion-item lines="none" *ngIf="!code_sent">
      <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Username *</ion-label>
      <ion-input type="text" 
        class="amplify-form-input"
        (keyup)="setUsername($event.target.value)"
        [value]="username"
      ></ion-input>
    </ion-item>
  
    <ion-item lines="none" *ngIf="code_sent">
      <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Code *</ion-label>
      <ion-input 
        #code
        type="text"
        class="amplify-form-input"
        (keyup)="setCode(code.value)"
      ></ion-input>
    </ion-item>

    <ion-item lines="none" *ngIf="code_sent">
      <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Password *</ion-label>
      <ion-input 
        #password
        type="password"
        class="amplify-form-input"
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
      ></ion-input>
    </ion-item>
  
  </ion-list>
  <div class="amplify-form-actions">
    <div>
      <ion-button expand="block" color="primary"
        (click)="onSend()"
        *ngIf="!code_sent"
      >Submit</ion-button>
      <ion-button expand="block" color="primary"
      *ngIf="code_sent"
      (click)="onSubmit()"
      >Verify</ion-button>
    </div>
    <div class="amplify-form-row">
      <div class="amplify-form-signup">Have an account? <a class="amplify-form-link" (click)="onSignIn()">Sign In</a></div>
      <div class="amplify-form-signup">Lost your code? <a class="amplify-form-link" (click)="onResend()">Resend</a></div>
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
  selector: 'amplify-auth-forgot-password-ionic',
  template
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
