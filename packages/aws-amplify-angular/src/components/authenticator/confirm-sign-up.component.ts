import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.form.container" *ngIf="_show">
  <div [ngStyle]="theme.form.body">
    <div [ngStyle]="theme.form.row">
      <input
        (keyup)="setUsername($event.target.value)"
        [ngStyle]="theme.form.input"
        type="text"
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <input #code
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        [ngStyle]="theme.form.input"
        type="text"
        placeholder="Code"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <div [ngStyle]="theme.form.leftCell">
        <a [ngStyle]="theme.form.link"
          (click)="onSignIn()"
        >Back to Sign In</a>
      </div>
      <div [ngStyle]="theme.form.rightCell">
      </div>
    </div>
    <button [ngStyle]="theme.form.button"
      (click)="onConfirm()"
    >Confirm</button>
    <button [ngStyle]="theme.form.button"
      (click)="onResend()"
    >Resend</button>
  </div>
  <div [ngStyle]="theme.form.footer">
    <div [ngStyle]="theme.form.errorMessage" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-confirm-sign-up',
  template: template
})
export class ConfirmSignUpComponent {
  _authState: AuthState;
  _show: boolean;

  username: string;
  code: string;

  errorMessage: string;

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  theme: any = AmplifyTheme;

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'confirmSignUp';

    this.username = authState.user? authState.user.username || '' : '';
  }

  setUsername(username: string) {
    this.username = username;
  }

  setCode(code: string) {
    this.code = code;
  }

  onConfirm() {
    this.amplifyService.auth()
      .confirmSignUp(
        this.username,
        this.code
      )
      .then(() => console.log('confirm success'))
      .catch(err => this._setError(err));
  }

  onResend() {
    this.amplifyService.auth().resendSignUp(this.username)
      .then(() => console.log('code resent'))
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.amplifyService.setAuthState({ state: 'signIn', user: null });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
