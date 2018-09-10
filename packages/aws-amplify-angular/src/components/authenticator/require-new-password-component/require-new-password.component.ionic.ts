import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic" *ngIf="_show">
  <div class="amplify-form-body">
    <div class="amplify-form-header amplify-form-header-ionic">Reset your password</div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Username</ion-label>
        <ion-input type="text"
          class="amplify-form-input"
          (keyup)="setUsername($event.target.value)"
          [value]="username"
        ></ion-input>
      </ion-item>
  
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Code</ion-label>
        <ion-input 
          #code
          type="text"
          class="amplify-form-input"
          (keyup)="setCode(code.value)"
        ></ion-input>
      </ion-item>

      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">Password</ion-label>
        <ion-input 
          #password
          type="password"
          class="amplify-form-input"
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
        ></ion-input>
      </ion-item>

    </ion-list>

    <div class="amplify-form-row">
    <ion-button
      expand="block"
      (click)="onSend()"
    >Send Code</ion-button>
    <ion-button
      expand="block"
      (click)="onSubmit()"
    >Submit</ion-button>
    </div>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>

`;

@Component({
  selector: 'amplify-auth-require-new-password-ionic',
  template: template
})
export class RequireNewPasswordComponentIonic extends RequireNewPasswordComponentCore {


  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }


}
