import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.form.container" *ngIf="_show">
  <div [ngStyle]="theme.form.body">
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
  </div>
  <div [ngStyle]="theme.form.footer">
    <div [ngStyle]="theme.form.errorMessage" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-confirm-sign-in',
  template: template
})
export class ConfirmSignInComponent {
  _authState: AuthState;
  _show: boolean;

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
    this._show = authState.state === 'confirmSignIn';
  }

  setCode(code: string) {
    this.code = code;
  }

  onConfirm() {
    const { user } = this._authState;
    const { challengeName } = user;
    const mfaType = challengeName === 'SOFTWARE_TOKEN_MFA' ? challengeName : null;
    this.amplifyService.auth()
      .confirmSignIn(
        user,
        this.code,
        mfaType
      )
      .then(() => {
        console.log('confirm success')
        this.amplifyService.setAuthState({ state: 'signedIn', user: user });
      })
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
