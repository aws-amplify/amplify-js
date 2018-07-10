import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';

const template = `
<div class="amplify-form-container" *ngIf="_show">
  <div class="amplify-form-body">

    <div class="amplify-form-row">
      <div class="amplify-form-cell-left">
        <a class="amplify-form-link"
          (click)="onSignIn()"
        >Back to Sign In</a>
      </div>
    </div>

    <div class="amplify-form-row">
      <input #code
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        class="amplify-form-input"
        type="text"
        placeholder="Code"
      />
    </div>
    <button class="amplify-form-button"
      (click)="onConfirm()"
    >Confirm</button>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-confirm-sign-in-core',
  template: template
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
