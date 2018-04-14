import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AmplifyService, AuthState } from '../../providers';

const template = `

  <style type="text/css">

    .amplify-authenticator {
      width: 400px;
      padding: 1em;
    }

    .amplify-form-input {
      width: 90%;
      margin: 0.5em;
      padding: 0.5em;
    }

    .amplify-form-body {
      padding: 1.5em;
    }

    .amplify-form-row {
      display: 'flex';
    }

    .amplify-form-cell-left {
      float: left;
      margin: 8px 0 8px 8px;
    }

    .amplify-form-cell-right {
      float:right;
      margin: 8px 8px 8px 0;
    }

    .amplify-form-link {
      cursor: pointer;
    }

    .amplify-form-link:hover {
      color: darkorange;
    }

    .amplify-form-button {
      margin: 0.4em 0 0 0.5em;
      padding: 0.5em;
      border: 1px solid silver;
      background-color: #FEFEFE;
      cursor: pointer;
    }

    .amplify-greeting-sign-out {
      margin: -6px;
      float:right;
    }

    .amplify-form-button:hover {
      color: darkorange;
    }

    .amplify-footer {
      clear: both;
    }

    .amplify-form-message-error {
      margin: 0.5em 0 0.5em 2em;
      clear: both;
      color: orangered;
    }

  </style>

  <div class="amplify-authenticator">

    <amplify-auth-sign-in
      *ngIf="!shouldHide('SignIn')"
      [authState]="authState"
    ></amplify-auth-sign-in>

    <amplify-auth-require-new-password
      *ngIf="!shouldHide('RequireNewPassword')"
      [authState]="authState"
    ></amplify-auth-require-new-password>

    <amplify-auth-confirm-sign-in
      *ngIf="!shouldHide('ConfirmSignIn')"
      [authState]="authState"
    ></amplify-auth-confirm-sign-in>

    <amplify-auth-sign-up
      *ngIf="!shouldHide('SignUp')"
      [authState]="authState"
    ></amplify-auth-sign-up>

    <amplify-auth-confirm-sign-up
      *ngIf="!shouldHide('ConfirmSignUp')"
      [authState]="authState"
    ></amplify-auth-confirm-sign-up>

    <amplify-auth-forgot-password
      *ngIf="!shouldHide('ForgotPassword')"
      [authState]="authState"
    ></amplify-auth-forgot-password>

    <amplify-auth-greetings
      *ngIf="!shouldHide('Greetings')"
      [authState]="authState"
    ></amplify-auth-greetings>

  </div>
`

@Component({
  selector: 'amplify-authenticator',
  encapsulation: ViewEncapsulation.None,
  template: template
})
export class AuthenticatorComponent {
  authState: AuthState = {
    state: 'signIn',
    user: null
  };

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.subscribe();
  }

  @Input()
  hide: string[] = [];

  subscribe() {
    this.amplifyService.authStateChange$
      .subscribe(state => {
        this.authState = state
      });
  }

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
      .length > 0;
  }
}
