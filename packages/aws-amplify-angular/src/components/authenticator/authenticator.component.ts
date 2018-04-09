import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div>
  <amplify-auth-sign-in
    *ngIf="!shouldHide('SignIn')"
    [theme]="theme"
    [authState]="authState"
  ></amplify-auth-sign-in>
  <amplify-auth-require-new-password
    *ngIf="!shouldHide('RequireNewPassword')"
    [theme]="theme"
    [authState]="authState"
  ></amplify-auth-require-new-password>
  <amplify-auth-confirm-sign-in
    *ngIf="!shouldHide('ConfirmSignIn')"
    [theme]="theme"
    [authState]="authState"
  ></amplify-auth-confirm-sign-in>
  <amplify-auth-sign-up
    *ngIf="!shouldHide('SignUp')"
    [theme]="theme"
    [authState]="authState"
  ></amplify-auth-sign-up>
  <amplify-auth-confirm-sign-up
    *ngIf="!shouldHide('ConfirmSignUp')"
    [theme]="theme"
    [authState]="authState"
  ></amplify-auth-confirm-sign-up>
  <amplify-auth-forgot-password
    *ngIf="!shouldHide('ForgotPassword')"
    [theme]="theme"
    [authState]="authState"
  ></amplify-auth-forgot-password>
  <amplify-auth-greetings
    *ngIf="!shouldHide('Greetings')"
    [theme]="theme"
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
  theme: any = AmplifyTheme;

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
