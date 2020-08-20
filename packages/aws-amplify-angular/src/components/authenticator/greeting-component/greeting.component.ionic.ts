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

import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { GreetingComponentCore } from './greeting.component.core';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-greeting" *ngIf="signedIn">
    <div class="amplify-greeting-text">{{ greeting }}</div>
    <div class="amplify-greeting-flex-spacer"></div>
    <ion-button
        class="amplify-greeting-sign-out"
        size="small"
        *ngIf="signedIn"
        (click)="onSignOut()"
        data-test="${auth.greeting.signOutButton}"
      >{{ this.amplifyService.i18n().get('Sign Out') }}</ion-button>
</div>
`;

@Component({
	selector: 'amplify-auth-greetings-ionic',
	template,
})
export class GreetingComponentIonic extends GreetingComponentCore {
	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
