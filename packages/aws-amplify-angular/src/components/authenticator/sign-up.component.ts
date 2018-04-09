import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.form.container" *ngIf="_show">
  <div [ngStyle]="theme.form.body">
    <div [ngStyle]="theme.form.row">
      <input #username
        (keyup)="setUsername(username.value)"
        [ngStyle]="theme.form.input"
        type="text"
        placeholder="Username"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSignUp()"
        [ngStyle]="theme.form.input"
        type="password"
        placeholder="Password"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <input #email
        (keyup)="setEmail(email.value)"
        [ngStyle]="theme.form.input"
        type="text"
        placeholder="Email"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <input #phone_number
        (keyup)="setPhoneNumber(phone_number.value)"
        [ngStyle]="theme.form.input"
        type="text"
        placeholder="Phone Number"
      />
    </div>
    <div [ngStyle]="theme.form.row">
      <div [ngStyle]="theme.form.leftCell">
        <a [ngStyle]="theme.form.link"
          (click)="onSignIn()"
        >Back to Sign In</a>
      </div>
      <div [ngStyle]="theme.form.rightCell">
        <a [ngStyle]="theme.form.link"
          (click)="onConfirmSignUp()"
        >Confirm a Code</a>
      </div>
    </div>
    <button [ngStyle]="theme.form.button"
      (click)="onSignUp()"
    >Sign Up</button>
  </div>
  <div [ngStyle]="theme.form.footer">
    <div [ngStyle]="theme.form.errorMessage" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-sign-up',
  template: template
})
export class SignUpComponent {
  _authState: AuthState;
  _show: boolean;

  username: string;
  password: string;
  email: string;
  phone_number: string;

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
    this._show = authState.state === 'signUp';
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }

  setEmail(email: string) {
    this.email = email;
  }

  setPhoneNumber(phone_number: string) {
    this.phone_number = phone_number;
  }

  onSignUp() {
    this.amplifyService.auth()
      .signUp(
        this.username,
        this.password,
        this.email,
        this.phone_number
      )
      .then(user => console.log(user))
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.amplifyService.setAuthState({ state: 'signIn', user: null });
  }

  onConfirmSignUp() {
    this.amplifyService.setAuthState({ state: 'confirmSignUp', user: null });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
