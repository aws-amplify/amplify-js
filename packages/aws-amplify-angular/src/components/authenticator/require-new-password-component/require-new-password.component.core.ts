import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';

const template = `
<div class="amplify-container" *ngIf="_show">
<div class="amplify-form-container">
  <div class="amplify-form-body">
  <div class="amplify-form-header">You are required to update your password</div>
    <div class="amplify-form-row">
      <label class="amplify-input-label" for="password"> Password *</label>
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        class="amplify-form-input"
        type="password"
        placeholder="Password"
      />
    </div>
    <div class="amplify-form-actions">
      <div class="amplify-form-cell-left">
        <a class="amplify-form-link"
          (click)="onSignIn()"
        >Back to Sign In</a>
      </div>
      <div class="amplify-form-cell-right">
        <button class="amplify-form-button"
          (click)="onSubmit()"
        >Submit</button>
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
  selector: 'amplify-auth-require-new-password-core',
  template: template
})
export class RequireNewPasswordComponentCore {
  _authState: AuthState;
  _show: boolean;
  password: string;
  errorMessage: string;
  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'requireNewPassword';
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
        this.amplifyService.setAuthState({ state: 'signIn', user: user });
      })
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.amplifyService.setAuthState({ state: 'signIn', user: null });
  }

  onAlertClose() {
    this._setError(null);
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
