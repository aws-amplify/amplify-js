import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { includes } from '../common';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container">
    <div class="amplify-form-body">
      <div class="amplify-form-header">Sign in to your account</div>
      <div class="amplify-amplify-form-row amplify-signin-username">
        <label class="amplify-input-label" for="amplifyUsername"> Username *</label>
        <input
          #amplifyUsername
          (keyup)="setUsername($event.target.value)"
          class="amplify-form-input"
          type="text"
          required
          placeholder="Username"
          [value]="username"
        />
      </div>

      <div class="amplify-form-row amplify-signin-password">
        <label class="amplify-input-label" for="password">Password *</label>
        <input #password
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
          class="amplify-form-input"
          type="password"
          required
          placeholder="Enter your password"
        />
        <span class="amplify-form-action">Forgot Password?
        <a class="amplify-form-link"
            (click)="onForgotPassword()"
          >Reset your password</a></span>    
      </div>

      <div class="amplify-form-actions">

        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            (click)="onSignIn()"
          >Sign In</button>
        </div>

        <div class="amplify-form-cell-left">
          <div class="amplify-form-signup">No account? <a class="amplify-form-link" (click)="onSignUp()">Create account</a></div>
        </div>
      </div>
    </div>
  </div>

  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ errorMessage }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
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
      .catch((err) => {
        this._setError(err);
      });
  }

  onAlertClose() {
    this._setError(null);
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
