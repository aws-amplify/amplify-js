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

    <div class="amplify-form-row">
      <input
        (keyup)="setUsername($event.target.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class="amplify-form-row">
      <input #code
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        class="amplify-form-input"
        type="text"
        placeholder="Code"
      />
    </div>
      
    <button ion-button
      (click)="onConfirm()">Confirm</button>
    <button ion-button
      (click)="onResend()">Resend</button>

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
