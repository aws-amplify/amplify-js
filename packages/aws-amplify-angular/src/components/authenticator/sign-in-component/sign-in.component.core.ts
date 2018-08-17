import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { includes } from '../common';

const template = `
<div class="amplify-form-container" *ngIf="_show">
  <div class="amplify-form-header"></div>
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
      <input
        (keyup)="setUsername($event.target.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Username"
        [value]="username"
      />
    </div>

    <div class="amplify-form-row">
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSignIn()"
        class="amplify-form-input"
        type="password"
        placeholder="Password"
      />
    </div>

    <div class="amplify-form-row">

      <div class="amplify-form-cell-right">
        <a class="amplify-form-link"
          (click)="onForgotPassword()"
        >Forgot Password</a>
      </div>

    </div>

    <button class="amplify-form-button"
      (click)="onSignIn()"
    >Sign In</button>

  </div>

  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>

</div>
`

@Component({
  selector: 'amplify-auth-sign-in-core',
  template: template
})
export class SignInComponentCore {
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
      .then(user => {
        if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
          this.amplifyService.setAuthState({ state: 'confirmSignIn', user: user });
        } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          this.amplifyService.setAuthState({ state: 'requireNewPassword', user: user });
        } else {
          this.amplifyService.setAuthState({ state: 'signedIn', user: user });
        }
      })
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
