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
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { labelMap } from '../common';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
<div class="amplify-form-container" data-test="${auth.confirmSignUp.section}">
  <div class="amplify-form-body" data-test="${auth.confirmSignUp.bodySection}">
    <div
      class="amplify-form-header"
      data-test="${auth.confirmSignUp.headerSection}"
    >
      {{ this.amplifyService.i18n().get('Confirm Sign up') }}</div>
    <div class="amplify-form-row">
      <label class="amplify-input-label" for="amplifyUsername">
        {{ this.amplifyService.i18n().get(getUsernameLabel()) }}
      </label>
      <input
        #amplifyUsername
        class="amplify-form-input"
        type="text"
        disabled
        placeholder="{{ this.amplifyService.i18n().get(getUsernameLabel()) }}"
        [value]="username"
        data-test="${auth.confirmSignUp.usernameInput}"
      />
    </div>
    <div class="amplify-form-row">
      <label class="amplify-input-label" for="code">
        {{ this.amplifyService.i18n().get('Confirmation Code *') }}
      </label>
      <input #code
        (change)="setCode(code.value)"
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        class="amplify-form-input"
        type="text"
        placeholder="{{ this.amplifyService.i18n().get('Enter your Code') }}"
        data-test="${auth.confirmSignUp.confirmationCodeInput}"
      />
      <span class="amplify-form-action">{{ this.amplifyService.i18n().get('Lost your code?') }}
        <a class="amplify-form-link"
            (click)="onResend()"
            data-test="${auth.confirmSignUp.resendCodeLink}"
          >{{ this.amplifyService.i18n().get('Resend Code') }}</a></span>
    </div>
    <div class="amplify-form-actions">
      <div class="amplify-form-cell-left">
        <div class="amplify-form-actions-left">
          <a
            class="amplify-form-link"
            (click)="onSignIn()"
            data-test="${auth.confirmSignUp.backToSignInLink}"
            >
            {{ this.amplifyService.i18n().get('Back to Sign in') }}
          </a>
        </div>
      </div>
      <div class="amplify-form-cell-right">
        <button
          class="amplify-form-button"
          (click)="onConfirm()"
          data-test="${auth.confirmSignUp.confirmButton}"
          >{{ this.amplifyService.i18n().get('Confirm') }}</button>
      </div>
    </div>
  </div>
</div>
<div class="amplify-alert" *ngIf="errorMessage">
  <div class="amplify-alert-body">
    <span class="amplify-alert-icon">&#9888;</span>
    <div class="amplify-alert-message">{{ this.amplifyService.i18n().get(errorMessage) }}</div>
    <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
  </div>
</div>
</div>
`;

@Component({
	selector: 'amplify-auth-confirm-sign-up-core',
	template,
})
export class ConfirmSignUpComponentCore implements OnInit {
	_authState: AuthState;
	_show: boolean;
	_usernameAttributes: string = 'username';
	username: string;
	code: string;
	errorMessage: string;
	protected logger: any;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('ConfirmSignUpComponent');
	}

	@Input()
	set data(data: any) {
		this.hide = data.hide ? data.hide : this.hide;
		this._authState = data.authState;
		this._show = data.authState.state === 'confirmSignUp';
		this.username = data.authState.user
			? data.authState.user.username || ''
			: '';
	}

	@Input() hide: string[] = [];

	@Input()
	set authState(authState: AuthState) {
		this._authState = authState;
		this._show = authState.state === 'confirmSignUp';

		this.username = authState.user ? authState.user.username || '' : '';
	}

	@Input()
	set usernameAttributes(usernameAttributes: string) {
		this._usernameAttributes = usernameAttributes;
	}

	ngOnInit() {
		if (!this.amplifyService.auth()) {
			throw new Error('Auth module not registered on AmplifyService provider');
		}
	}
	shouldHide(comp) {
		return this.hide.filter(item => item === comp).length > 0;
	}

	setUsername(username: string) {
		this.username = username;
	}

	setCode(code: string) {
		this.code = code;
	}

	onConfirm() {
		this.amplifyService
			.auth()
			.confirmSignUp(this.username, this.code)
			.then(() => this.logger.info('confirm success'))
			.catch(err => this._setError(err));
	}

	onResend() {
		this.amplifyService
			.auth()
			.resendSignUp(this.username)
			.then(() => this.logger.info('code resent'))
			.catch(err => this._setError(err));
	}

	onSignIn() {
		this.onAlertClose();
		this.amplifyService.setAuthState({ state: 'signIn', user: null });
	}

	onAlertClose() {
		this._setError(null);
	}

	_setError(err) {
		if (!err) {
			this.errorMessage = null;
			return;
		}

		this.errorMessage = err.message || err;
	}

	getUsernameLabel() {
		return (
			labelMap[this._usernameAttributes as string] || this._usernameAttributes
		);
	}
}
