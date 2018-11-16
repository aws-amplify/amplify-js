import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { GreetingComponentCore } from './greeting.component.core';

const template = `
<div class="amplify-greeting" *ngIf="signedIn">
    <div class="amplify-greeting-text">{{ greeting }}</div>
    <div class="amplify-greeting-flex-spacer"></div>
    <ion-button
        class="amplify-greeting-sign-out"
        size="small"
        *ngIf="signedIn"
        (click)="onSignOut()"
      >Sign Out</ion-button>
</div>
`

@Component({
  selector: 'amplify-auth-greetings-ionic',
  template: template
})
export class GreetingComponentIonic extends GreetingComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }
}
