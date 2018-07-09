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
      <input
        (keyup)="setUsername($event.target.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class="amplify-form-row">
      <input #code
        (keyup)="setCode(code.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Code"
      />
    </div>
    <div class="amplify-form-row">
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        class="amplify-form-input"
        type="password"
        placeholder="Password"
      />
    </div>
    <div class="amplify-form-row">
    <button class="amplify-form-button"
      (click)="onSend()"
    >Send Code</button>
    <button class="amplify-form-button"
      (click)="onSubmit()"
    >Submit</button>
    </div>
  </div>
  <div class="amplify-form-footer">
    <div class="amplify-form-message-error" *ngIf="errorMessage">{{ errorMessage }}</div>
  </div>
</div>
`

@Component({
  selector: 'amplify-auth-forgot-password-core',
  template: template
})
export class ForgotPasswordComponentCore {
  _authState: AuthState;
  _show: boolean;

  username: string;
  code: string;
  password: string;

  errorMessage: string;

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
    this.amplifyService.auth().forgotPassword(this.username)
      .then(() => console.log('code sent'))
      .catch(err => this._setError(err));
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
