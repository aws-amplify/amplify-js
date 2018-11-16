import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';

const template = `
<div class="amplify-greeting" *ngIf="signedIn">
    <div class="amplify-greeting-text">{{ greeting }}</div>
    <div class="amplify-greeting-flex-spacer"></div>
    <a class="amplify-form-link amplify-greeting-sign-out"
      (click)="onSignOut()"
    >Sign out</a>
</div>
`

@Component({
  selector: 'amplify-auth-greetings-core',
  template: template
})
export class GreetingComponentCore {
  signedIn: boolean;
  greeting: string;

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.subscribe();
  }

  @Input()
  authState: AuthState;
  

  subscribe() {
    this.amplifyService.authStateChange$
      .subscribe(state => this.setAuthState(state));
  }

  setAuthState(authState: AuthState) {
    this.authState = authState;
    this.signedIn = authState.state === 'signedIn';

    this.greeting = this.signedIn
      ? "Hello, " + authState.user.username
      : "";
  }

  onSignOut() {
    this.amplifyService.auth().signOut();
  }
}
