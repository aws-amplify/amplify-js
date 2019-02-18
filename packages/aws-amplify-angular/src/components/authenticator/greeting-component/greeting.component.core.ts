// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// tslint:enable

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
