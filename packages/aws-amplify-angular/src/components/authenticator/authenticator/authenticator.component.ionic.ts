import { Component, Input, ViewEncapsulation, Injector, ElementRef } from '@angular/core';

import { AmplifyService, AuthState } from '../../../providers';
import { AuthenticatorComponentCore } from './authenticator.component.core';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic ">

<amplify-auth-sign-in-ionic
  *ngIf="!shouldHide('SignIn')"
  [authState]="authState"
></amplify-auth-sign-in-ionic>

<amplify-auth-sign-up-ionic
  *ngIf="!shouldHide('SignUp')"
  [authState]="authState"
></amplify-auth-sign-up-ionic>

<amplify-auth-confirm-sign-up-ionic
  *ngIf="!shouldHide('ConfirmSignUp')"
  [authState]="authState"
></amplify-auth-confirm-sign-up-ionic>

<amplify-auth-confirm-sign-in-ionic
*ngIf="!shouldHide('ConfirmSignIn')"
[authState]="authState"
></amplify-auth-confirm-sign-in-ionic>

<amplify-auth-forgot-password-ionic
*ngIf="!shouldHide('ForgotPassword')"
[authState]="authState"
></amplify-auth-forgot-password-ionic>

<amplify-auth-greetings-ionic
*ngIf="!shouldHide('Greetings') && authState.state === 'signedIn'"
[authState]="authState"
></amplify-auth-greetings-ionic>

 <amplify-auth-require-new-password-ionic
*ngIf="!shouldHide('RequireNewPassword')"
[authState]="authState"
></amplify-auth-require-new-password-ionic>
</div>
`;

@Component({
  selector: 'amplify-authenticator-ionic',
  template: template
})
export class AuthenticatorIonicComponent extends AuthenticatorComponentCore {

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }
}
