import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container">
    <div class="amplify-form-body">
    <div class="amplify-form-header">Confirm Sign in</div>

      <div class="amplify-form-row">
        <label class="amplify-input-label" for="code"> Confirmation Code *</label>
        <input #code
          (change)="setCode(code.value)"
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
          class="amplify-form-input"
          type="text"
          placeholder="Enter your Code"
        />
      </div>

      <div class="amplify-form-actions">
        <div class="amplify-form-cell-left">
          <div class="amplify-form-actions-left">
            <a class="amplify-form-link" (click)="onSignIn()">Back to Sign in</a>
          </div>
        </div>

        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            (click)="onConfirm()">Confirm</button>
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
`;

@Component({
  selector: 'amplify-auth-confirm-sign-in-core',
  template
})
export class ConfirmSignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  code: string;
  errorMessage: string;
  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'confirmSignIn';
  }

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
        this.amplifyService.setAuthState({ state: 'signedIn', user });
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
