import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { GreetingComponentCore } from './greeting.component.core';

const template = `
<div class="amplify-greeting">
    <span class="amplify-greeting-text">{{ greeting }}</span>
    <ion-button
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
