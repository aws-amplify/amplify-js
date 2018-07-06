import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';

const templatetemp = `
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
      ></ion-input>
    </ion-item>

    <ion-item>
      <ion-label stacked>Password</ion-label>
      <ion-input 
        #password
        type="password" 
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
      ></ion-input>
    </ion-item>
  
  </ion-list>

    <div class="amplify-form-row">
    <ion-button
      (click)="onSend()"
    >Send Code</ion-button>
    <ion-button
      (click)="onSubmit()"
    >Submit</ion-button>
    </div>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>

`

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
    
        <ion-label stacked>Password</ion-label>
        <ion-input 
        #password
        type="password" 
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        ></ion-input>
      </ion-item>
    </ion-list>
    
    <div class="amplify-form-row">
      <ion-button
        (click)="onSubmit()"
      >Submit</ion-button>
    </div>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
  
</div>
`

@Component({
  selector: 'amplify-auth-require-new-password-ionic',
  template: template
})
export class RequireNewPasswordComponentIonic extends RequireNewPasswordComponentCore {


  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }


}
