import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { SignInComponentCore } from './sign-in.component.core';
import { includes } from '../common';

const template = `
<div class="amplify-form-container" *ngIf="_show">
  <div class="amplify-form-header"></div>
  <div class="amplify-form-body">
    
    <div class="amplify-form-row">
      
      <div class="amplify-form-cell-left">
        <a class="amplify-form-link"
          (click)="onSignIn()"
        >Sign In</a>
      </div>
      
      <div class="amplify-form-cell-right">
        <a class="amplify-form-link"
          (click)="onSignUp()"
        >Sign Up</a>
      </div>

    </div>

    <ion-list>

      <ion-item>
        <ion-label stacked>Username</ion-label>
        <ion-input type="text" 
          (keyup)="setUsername($event.target.value)"
          [value]="username"
        ></ion-input>
      </ion-item>
    
      <ion-item>
        <ion-label stacked>Password</ion-label>
        <ion-input 
          #password
          type="password" 
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
        ></ion-input>
      </ion-item>
    
    </ion-list>

    <div class="amplify-form-row">

      <div class="amplify-form-cell-right">
        <a class="amplify-form-link"
          (click)="onForgotPassword()"
        >Forgot Password</a>
      </div>

    </div>

    <ion-button
      (click)="onSignIn()"
    >Sign In</ion-button>

  </div>

  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
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
