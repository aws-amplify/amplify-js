import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';
import AmplifyTheme from '../AmplifyTheme';
import { includes } from './common';

const template = `
<div [ngStyle]="theme.form.container" *ngIf="_show">
  <div [ngStyle]="theme.form.header">
  </div>
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
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSignIn()"
        [ngStyle]="theme.form.input"
        type="password"
        placeholder="Password"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <div [ngStyle]="theme.form.leftCell">
        <a [ngStyle]="theme.form.link"
          (click)="onForgotPassword()"
        >Forgot Password</a>
      </div>
      <div [ngStyle]="theme.form.rightCell">
        <a [ngStyle]="theme.form.link"
          (click)="onSignUp()"
        >Sign Up</a>
      </div>
    </div>
    <button [ngStyle]="theme.form.button"
      (click)="onSignIn()"
    >Sign In</button>
  </div>
  <div [ngStyle]="theme.form.footer">
    <div [ngStyle]="theme.form.errorMessage" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-sign-in',
  template: template
})
export class SignInComponent {
  _authState: AuthState;
  _show: boolean;

  username: string;
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
    this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);

    this.username = authState.user? authState.user.username || '' : '';
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }

  onSignIn() {
    this.amplifyService.auth().signIn(this.username, this.password)
      .then(user => console.log(user))
      .catch(err => this._setError(err));
  }

  onForgotPassword() {
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'forgotPassword', user: user });
  }

  onSignUp() {
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'signUp', user: user });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
