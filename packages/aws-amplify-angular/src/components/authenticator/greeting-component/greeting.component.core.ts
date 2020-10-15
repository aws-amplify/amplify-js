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

import { UsernameAttributes } from '../types';
import { Component, Input, OnInit, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-greeting" *ngIf="signedIn">
    <div class="amplify-greeting-text">{{ greeting }}</div>
    <div class="amplify-greeting-flex-spacer"></div>
    <a class="amplify-form-link amplify-greeting-sign-out"
      (click)="onSignOut()"
      data-test="${auth.greeting.signOutButton}"
    >{{ this.amplifyService.i18n().get('Sign Out') }}</a>
</div>
`;

@Component({
	selector: 'amplify-auth-greetings-core',
	template,
})
export class GreetingComponentCore implements OnInit {
	signedIn: boolean;
	greeting: string;
	_usernameAttributes: string = 'username';
	protected logger: any;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('GreetingComponent');
		this.subscribe();
	}

	@Input()
	authState: AuthState;

	@Input()
	set usernameAttributes(usernameAttributes: string) {
		this._usernameAttributes = usernameAttributes;
	}

	ngOnInit() {
		if (!this.amplifyService.auth()) {
			throw new Error('Auth module not registered on AmplifyService provider');
		}
	}

	subscribe() {
		this.amplifyService.authStateChange$.subscribe(state =>
			this.setAuthState(state)
		);
	}

	setAuthState(authState: AuthState) {
		this.authState = authState;
		this.signedIn = authState.state === 'signedIn';

		let username = '';
		if (authState.user) {
			if (this._usernameAttributes === UsernameAttributes.EMAIL) {
				username = authState.user.attributes
					? authState.user.attributes.email
					: authState.user.username;
			} else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
				username = authState.user.attributes
					? authState.user.attributes.phone_number
					: authState.user.username;
			} else {
				username = authState.user.username;
			}
		}

		this.greeting = this.signedIn
			? this.amplifyService
					.i18n()
					.get('Hello, {{username}}')
					.replace('{{username}}', username)
			: '';
	}

	onSignOut() {
		this.amplifyService.auth().signOut();
	}
}
