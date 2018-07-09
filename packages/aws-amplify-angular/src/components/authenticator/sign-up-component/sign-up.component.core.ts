import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';

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

    <div class="amplify-form-row">
      <input #username
        (keyup)="setUsername(username.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Username"
      />
    </div>
    <div class="amplify-form-row">
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSignUp()"
        class="amplify-form-input"
        type="password"
        placeholder="Password"
      />
    </div>
    <div class="amplify-form-row">
      <input #email
        (keyup)="setEmail(email.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Email"
      />
    </div>
    <div class="amplify-form-row">
      <input #phone_number
        (keyup)="setPhoneNumber(phone_number.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Phone Number"
      />
    </div>
    <div class="amplify-form-row">
      <div class="amplify-form-cell-right">
        <a class="amplify-form-link"
          (click)="onConfirmSignUp()"
        >Confirm a Code</a>
      </div>
    </div>
    <button class="amplify-form-button"
      (click)="onSignUp()"
    >Sign Up</button>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-sign-up-core',
  template: template
})
export class SignUpComponentCore {
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
      .then(user => this.amplifyService.setAuthState({ state: 'confirmSignUp', user: null }))
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
