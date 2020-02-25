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

import { Component, Input, OnInit, Inject } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { constants } from '../common';
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

	constructor(
		@Inject(AmplifyService) protected amplifyService: AmplifyService
	) {
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

		this.greeting = this.signedIn
			? this.amplifyService
					.i18n()
					.get('Hello, {{username}}')
					.replace(
						'{{username}}',
						authState.user.username || authState.user.name
					)
			: '';
	}

	googleSignOut() {
		const ga =
			(<any>window).gapi && (<any>window).gapi.auth2
				? (<any>window).gapi.auth2.getAuthInstance()
				: null;
		if (!ga) {
			return Promise.resolve();
		}
		ga.then((googleAuth: any) => {
			if (!googleAuth) {
				return Promise.resolve();
			}
			return googleAuth.signOut();
		});
	}

	facebookSignOut() {
		const fb = (<any>window).FB;
		if (!fb) {
			return Promise.resolve();
		}
		fb.getLoginStatus(response => {
			if (response.status === 'connected') {
				return new Promise((res, rej) => {
					fb.logout(response => {
						res(response);
					});
				});
			} else {
				return Promise.resolve();
			}
		});
	}

	amazonSignOut() {
		const amz = (<any>window).amazon;
		if (!amz) {
			// this.logger.debug('Amazon Login sdk undefined');
			return Promise.resolve();
		}
		//  this.logger.debug('Amazon signing out');
		amz.Login.logout();
	}

	onSignOut() {
		let payload: any = {};
		try {
			payload =
				JSON.parse(localStorage.getItem(constants.AUTH_SOURCE_KEY)) || {};
			localStorage.removeItem(constants.AUTH_SOURCE_KEY);
		} catch (e) {
			this.logger.debug(
				`Failed to parse the info from ${constants.AUTH_SOURCE_KEY} from localStorage with ${e}`
			);
		}

		switch (payload.provider) {
			case constants.GOOGLE:
				this.googleSignOut();
				break;
			case constants.FACEBOOK:
				this.facebookSignOut();
				break;
			case constants.AMAZON:
				this.amazonSignOut();
				break;
			default:
				break;
		}
		this.amplifyService.auth().signOut();
	}
}
