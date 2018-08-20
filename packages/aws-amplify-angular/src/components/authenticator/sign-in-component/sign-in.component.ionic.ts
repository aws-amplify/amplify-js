import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { SignInComponentCore } from './sign-in.component.core';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-body">
  <div class="amplify-form-header">Sign in to your account</div>
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Username</ion-label>
        <ion-input type="text" 
          placeholder="Username"
          (keyup)="setUsername($event.target.value)"
          [value]="username"
        ></ion-input>
      </ion-item>
    
      <ion-item>
        <ion-label position="stacked">Password</ion-label>
        <ion-input 
          #password
          placeholder="Enter your password"
          type="password" 
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
        ></ion-input> 
      </ion-item>
      
      <ion-item>
        <span class="amplify-form-action">Forgot Password?
        <a class="amplify-form-link"
            (click)="onForgotPassword()"
          >Reset your password</a></span>
      </ion-item>

    </ion-list>

    <ion-button
      class="button-block"
      (click)="onSignIn()"
    >Sign In</ion-button>

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
  selector: 'amplify-auth-sign-in-ionic',
  template: template
})
export class SignInComponentIonic extends SignInComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);    
  }
  
}
