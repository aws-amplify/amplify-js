import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';


const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container">
    <div class="amplify-form-body">
    <div class="amplify-form-header">Reset your password</div>
    <div class="amplify-form-text" *ngIf="!code_sent">You will receive a verification code</div>
    <div class="amplify-form-text" *ngIf="code_sent">Enter the code you received and set a new password</div>

      <div class="amplify-form-row" *ngIf="!code_sent">
        <input
          (keyup)="setUsername($event.target.value)"
          class="amplify-form-input"
          type="text"
          placeholder="Username"
          [value]="username"
        />
      </div>
      <div class="amplify-form-row" *ngIf="code_sent">
        <input #code
          (keyup)="setCode(code.value)"
          class="amplify-form-input"
          type="text"
          placeholder="Enter code"
        />
      </div>
      <div class="amplify-form-row" *ngIf="code_sent">
        <input #password
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
          class="amplify-form-input"
          type="password"
          placeholder="Password"
        />
      </div>

      <div class="amplify-form-actions">

        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            *ngIf="!code_sent"
            (click)="onSend()">Submit</button>
        
          <button class="amplify-form-button"
            *ngIf="code_sent"
            (click)="onSubmit()">Verify</button>
        </div>

        <div class="amplify-form-cell-left">
          <div class="amplify-form-actions-left">
            <a *ngIf="code_sent" class="amplify-form-link" (click)="onSend()">Resend Code</a>
            <a *ngIf="!code_sent" class="amplify-form-link" (click)="onSignIn()">Back to Sign in</a>
          </div>
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
  selector: 'amplify-auth-forgot-password-core',
  template
})
export class ForgotPasswordComponentCore {
  _authState: AuthState;
  _show: boolean;

  username: string;
  code: string;
  password: string;

  errorMessage: string;

  code_sent = false;

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'forgotPassword';

    this.username = data.authState.user? data.authState.user.username || '' : '';
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'forgotPassword';

    this.username = authState.user? authState.user.username || '' : '';
  }

  setUsername(username: string) {
    this.username = username;
  }

  setCode(code: string) {
    this.code = code;
  }

  setPassword(password: string) {
    this.password = password;
  }

  onSend() {
    if (!this.username) {
      this.errorMessage = "Username cannot be empty";
      return;
    }
    this.amplifyService.auth().forgotPassword(this.username)
      .then(() => {
        this.code_sent = true;
      })
      .catch((err) => {
        this._setError(err)
        this.code_sent = false;
      });
  }

  onSubmit() {
    this.amplifyService.auth()
      .forgotPasswordSubmit(
        this.username,
        this.code,
        this.password
      )
      .then(() => {
        const user = { username: this.username };
        this.amplifyService.setAuthState({ state: 'signIn', user });
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
