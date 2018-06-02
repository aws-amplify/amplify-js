import { Component, Input, ViewEncapsulation, Injector, ElementRef } from '@angular/core';
import { IonicModule } from 'ionic-angular'

import { AmplifyService, AuthState } from '../../../providers';
import { AuthenticatorComponentCore } from '../authenticator/authenticator.component.core';

const template = `

  <div>
    <amplify-auth-sign-in-ionic [authState]="authState"></amplify-auth-sign-in-ionic>
  </div>
  <div>
    <amplify-auth-sign-up-ionic
    *ngIf="!shouldHide('SignUp')"
    [authState]="authState"
    ></amplify-auth-sign-up-ionic>
  </div>
`

@Component({
  selector: 'amplify-authenticator-ionic',
  template: template
})
export class AuthenticatorIonicComponent extends AuthenticatorComponentCore {
  authState: AuthState = {
    state: 'signIn',
    user: null
  };

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
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
