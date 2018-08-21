import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { SignInComponentCore } from './sign-in.component.core';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header amplify-form-header-ionic">Sign in to your account</div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" for="username" position="stacked">Username *</ion-label>
          <ion-input type="text" 
          #username
          class="amplify-form-input"
          (keyup)="setUsername($event.target.value)"
        ></ion-input>
      </ion-item>

      <ion-item lines="none" class="test">
        <ion-label class="amplify-input-label amplify-input-label-ionic" for="password" position="stacked">Password *</ion-label>
        <ion-input 
          #password
          type="password" 
          class="amplify-form-input"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
        ></ion-input>
      </ion-item>
    </ion-list>
    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onSignIn()"
        >Sign In</ion-button>
      </div>
      <div class="amplify-form-cell-left">
        <div class="amplify-form-signup">No account? <a class="amplify-form-link" (click)="onSignUp()">Create account</a></div>
      </div>
      <div class="amplify-form-cell-right">
        <div class="amplify-form-signup"><a class="amplify-form-link" (click)="onForgotPassword()">Reset Password</a></div>
      </div>
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
