import { Component, Input, ViewEncapsulation, Injector, ElementRef } from '@angular/core';
import { IonicModule } from 'ionic-angular'

import { AmplifyService, AuthState } from '../../../providers';
import { AuthenticatorComponentCore } from '../authenticator/authenticator.component.core';

const template = `

  <ion-content class="amplify-authenticator-ionic">

    HELLO I AM IONIC
    <amplify-auth-sign-in
    
    [authState]="authState"
  ></amplify-auth-sign-in>
    

  </ion-content>
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
