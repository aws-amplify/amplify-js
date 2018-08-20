import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
import { includes } from '../common';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header">Sign in to your account</div>
    <div class="amplify-form-text" *ngIf="!code_sent">You will receive a verification code</div>
    <div class="amplify-form-text" *ngIf="code_sent">Enter the code you received and set a new password</div>

    <ion-list>

    <ion-item *ngIf="!code_sent">
      <ion-label position="stacked">Username</ion-label>
      <ion-input type="text" 
        placeholder="Username"
        (keyup)="setUsername($event.target.value)"
        [value]="username"
      ></ion-input>
    </ion-item>
  
    <ion-item *ngIf="code_sent">
      <ion-label position="stacked">Code</ion-label>
      <ion-input 
        #code
        type="text" 
        placeholder="Enter your code"
        (keyup)="setCode(code.value)"
      ></ion-input>
    </ion-item>

    <ion-item *ngIf="code_sent">
      <ion-label position="stacked">Password</ion-label>
      <ion-input 
        #password
        type="password" 
        placeholder="Enter your password"
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
      ></ion-input>
    </ion-item>
  
  </ion-list>

  <div class="amplify-form-row">
    <ion-button
      (click)="onSend()"
      *ngIf="!code_sent"
    >Submit</ion-button>
    <ion-button
      *ngIf="code_sent"
      (click)="onSubmit()"
    >Verify</ion-button>
    </div>
  </div>

  <ion-list>
    <ion-item *ngIf="code_sent">
      <a class="amplify-form-link" (click)="onSend()">Resend Code</a>
    </ion-item>
    
    <ion-item *ngIf="!code_sent">
      <a class="amplify-form-link" (click)="onSignIn()">Back to Sign in</a>
    </ion-item>
  </ion-list>

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
  selector: 'amplify-auth-forgot-password-ionic',
  template: template
})
export class ForgotPasswordComponentIonic extends ForgotPasswordComponentCore {


  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }


}
