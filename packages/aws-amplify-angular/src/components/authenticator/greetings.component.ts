import { Component, Input } from '@angular/core';

import { AmplifyService, AuthState } from '../../providers';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.footer">
  <span [ngStyle]="theme.greeting">{{ greeting }}</span>
  <button [ngStyle]="theme.button"
    *ngIf="signedIn"
    (click)="onSignOut()"
  >Sign Out</button>
</div>
`

@Component({
  selector: 'amplify-auth-greetings',
  template: template
})
export class GreetingsComponent {
  signedIn: boolean;
  greeting: string;

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.subscribe();
  }

  @Input()
  theme: any = AmplifyTheme;

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
      ? "Hello " + authState.user.username
      : 'Please Sign In';
  }

  onSignOut() {
    this.amplifyService.auth().signOut()
      .then(() => console.log('signed out'))
      .catch(err => console.log(err));
  }
}
