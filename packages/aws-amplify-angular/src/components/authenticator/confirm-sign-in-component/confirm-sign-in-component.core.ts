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
  <div class="amplify-form-container" data-test="${auth.confirmSignIn.section}">
    <div class="amplify-form-body" data-test="${auth.confirmSignIn.bodySection}">
    <div class="amplify-form-header" data-test="${auth.confirmSignIn.headerSection}">{{ this.amplifyService.i18n().get('Confirm Sign in') }}</div>
      <div class="amplify-form-row" *ngIf="!shouldHide('SignIn')">
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
          data-test="${auth.confirmSignIn.codeInput}"
        />
      </div>
      <div class="amplify-form-actions">
        <div class="amplify-form-cell-left">
          <div class="amplify-form-actions-left">
            <a 
              class="amplify-form-link"
              (click)="onSignIn()"
              data-test="${auth.confirmSignIn.backToSignInLink}"
              >
                {{ this.amplifyService.i18n().get('Back to Sign in') }}
            </a>
          </div>
        </div>
        <div class="amplify-form-cell-right">
          <button
            class="amplify-form-button"
            data-test="${auth.confirmSignIn.confirmButton}"
            (click)="onConfirm()"
            >
              {{ this.amplifyService.i18n().get('Confirm') }}</button>
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
	selector: 'amplify-auth-confirm-sign-in-core',
	template,
})
export class ConfirmSignInComponentCore implements OnInit {
	_authState: AuthState;
	_show: boolean;
	code: string;
	errorMessage: string;
	protected logger: any;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('ConfiSignInComponent');
	}

	@Input()
	set data(data: any) {
		this.hide = data.hide ? data.hide : this.hide;
		this._authState = data.authState;
		this._show = data.authState.state === 'confirmSignIn';
	}

	@Input()
	set authState(authState: AuthState) {
		this._authState = authState;
		this._show = authState.state === 'confirmSignIn';
	}

	@Input() hide: string[] = [];

	ngOnInit() {
		if (!this.amplifyService.auth()) {
			throw new Error('Auth module not registered on AmplifyService provider');
		}
	}

	shouldHide(comp) {
		return this.hide.filter(item => item === comp).length > 0;
	}

	setCode(code: string) {
		this.code = code;
	}

	onConfirm() {
		const { user } = this._authState;
		const { challengeName } = user;
		const mfaType =
			challengeName === 'SOFTWARE_TOKEN_MFA' ? challengeName : null;
		this.amplifyService
			.auth()
			.confirmSignIn(user, this.code, mfaType)
			.then(() => {
				this.onAlertClose();
				this.amplifyService.setAuthState({ state: 'signedIn', user });
			})
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
}
