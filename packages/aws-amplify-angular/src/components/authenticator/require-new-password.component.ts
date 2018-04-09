import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.form.container" *ngIf="_show">
  <div [ngStyle]="theme.form.body">
    <div [ngStyle]="theme.form.row">
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        [ngStyle]="theme.form.input"
        type="password"
        placeholder="Password"
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
      (click)="onSubmit()"
    >Submit</button>
  </div>
  <div [ngStyle]="theme.form.footer">
    <div [ngStyle]="theme.form.errorMessage" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-require-new-password',
  template: template
})
export class RequireNewPasswordComponent {
  _authState: AuthState;
  _show: boolean;

  password: string;

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
    this._show = authState.state === 'reauireNewPassword';
  }

  setPassword(password: string) {
    this.password = password;
  }

  onSubmit() {
    const { user } = this._authState;
    const { requiredAttributes } = user.challengeParam;
    this.amplifyService.auth()
      .completeNewPassword(
        user,
        this.password,
        requiredAttributes
      )
      .then(() => {
        console.log('new password submit success');
        this.amplifyService.setAuthState({ state: 'signIn', user: user });
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
