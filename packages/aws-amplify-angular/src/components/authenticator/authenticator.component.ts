import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AmplifyService, AuthState } from '../../providers';

const template = `

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
