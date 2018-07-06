import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { SignUpComponentCore } from './sign-up.component.core';

const template = `
<div class="amplify-form-container" *ngIf="_show">
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
        <ion-input 
          #username
          type="text" 
          (keyup)="setUsername($event.target.value)"
        ></ion-input>
      </ion-item>
    
      <ion-item>
        <ion-label stacked>Password</ion-label>
        <ion-input 
          #password
          type="password" 
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignUp()"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label stacked>Email</ion-label>
        <ion-input 
          #email
          type="text" 
          (keyup)="setEmail(email.value)"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label stacked>Phone Number</ion-label>
        <ion-input 
          #phone_number
          type="text" 
          (keyup)="setPhoneNumber(phone_number.value)"
        ></ion-input>
      </ion-item>
    
    </ion-list>

    <div class="amplify-form-row">
      <div class="amplify-form-cell-right">
        <a class="amplify-form-link"
          (click)="onConfirmSignUp()"
        >Confirm a Code</a>
      </div>
    </div>
    <ion-button 
      (click)="onSignUp()"
    >Sign Up</ion-button>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-sign-up-ionic',
  template: template
})
export class SignUpComponentIonic extends SignUpComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService)
  }

}
