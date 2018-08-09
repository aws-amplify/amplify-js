import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { ConfirmSignUpComponentCore } from './confirm-sign-up.component.core';

const template = `
<div class="amplify-form-container" *ngIf="_show">
  <div class="amplify-form-body">

    <div class="amplify-form-row">
      
      <div class="amplify-form-cell-left">
        <a class="amplify-form-link"
          (click)="onSignIn()"
        >Back to Sign In</a>
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
        <ion-label stacked>Code</ion-label>
        <ion-input 
          #code
          type="text" 
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
        ></ion-input>
      </ion-item>
    </ion-list>
      
    <ion-button
      (click)="onConfirm()">Confirm</ion-button>
    <ion-button
      (click)="onResend()">Resend</ion-button>

  </div>

  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>

</div>
`

@Component({
  selector: 'amplify-auth-confirm-sign-up-ionic',
  template: template
})
export class ConfirmSignUpComponentIonic extends ConfirmSignUpComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService)
  }


}
