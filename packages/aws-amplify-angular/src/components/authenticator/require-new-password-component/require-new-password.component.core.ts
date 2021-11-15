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
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
<div class="amplify-form-container" data-test="${auth.requireNewPassword.section}">
  <div class="amplify-form-body" data-test="${auth.requireNewPassword.bodySection}">
  <div class="amplify-form-header" data-test="${auth.requireNewPassword.headerSection}">
    {{ this.amplifyService.i18n().get('You are required to update your password') }}
  </div>
  <div class="amplify-form-row">
    <label class="amplify-input-label" for="password">
      {{ this.amplifyService.i18n().get('Password *') }}
    </label>
    <input #password
      (keyup)="setPassword(password.value)"
      (keyup.enter)="onSubmit()"
      class="amplify-form-input"
      type="password"
      placeholder="{{ this.amplifyService.i18n().get('Password') }}"
      data-test="${auth.requireNewPassword.newPasswordInput}"
    />
    </div>
    <div class="amplify-form-actions">
      <div class="amplify-form-cell-left">
        <a class="amplify-form-link"
          (click)="onSignIn()"
          data-test="${auth.requireNewPassword.backToSignInLink}"
        >{{ this.amplifyService.i18n().get('Back to Sign In') }}</a>
      </div>
      <div class="amplify-form-cell-right">
        <button class="amplify-form-button"
          (click)="onSubmit()"
          data-test="${auth.requireNewPassword.submitButton}"
        >{{ this.amplifyService.i18n().get('Submit') }}</button>
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
	selector: 'amplify-auth-require-new-password-core',
	template,
})
export class RequireNewPasswordComponentCore implements OnInit {
	_authState: AuthState;
	_show: boolean;
	password: string;
	errorMessage: string;
	protected logger: any;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('RequireNewPasswordComponent');
	}

	@Input()
	set authState(authState: AuthState) {
		this._authState = authState;
		this._show = authState.state === 'requireNewPassword';
	}

	@Input() hide: string[] = [];

	@Input()
	set data(data: any) {
		this._authState = data.authState;
		this._show = data.authState.state === 'requireNewPassword';
		this.hide = data.hide ? data.hide : this.hide;
	}

	ngOnInit() {
		if (!this.amplifyService.auth()) {
			throw new Error('Auth module not registered on AmplifyService provider');
		}
	}

	shouldHide(comp) {
		return this.hide.filter((item) => item === comp).length > 0;
	}

	setPassword(password: string) {
		this.password = password;
	}

	onSubmit() {
		const { user } = this._authState;
		const { requiredAttributes } = user.challengeParam;
		this.amplifyService
			.auth()
			.completeNewPassword(user, this.password, requiredAttributes)
			.then(() => {
				this.onAlertClose();
				this.amplifyService.setAuthState({ state: 'signIn', user });
			})
			.catch((err) => this._setError(err));
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
}
