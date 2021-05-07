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
import defaultSignUpFieldAssets, {
	signUpWithEmailFields,
	signUpWithPhoneNumberFields,
} from '../../../assets/default-sign-up-fields';
import { UsernameAttributes, PhoneFieldOutput } from '../types';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { labelMap, composePhoneNumber } from '../common';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container" data-test="${auth.signUp.section}">
    <div class="amplify-form-body" data-test="${auth.signUp.bodySection}">
      <div
        class="amplify-form-header"
        data-test="${auth.signUp.headerSection}"
        >{{ this.amplifyService.i18n().get(this.header) }}</div>
      <div class="amplify-form-row" *ngFor="let field of signUpFields">
        <div *ngIf="field.key !== 'phone_number'">
          <label class="amplify-input-label">
            {{ this.amplifyService.i18n().get(field.label) }}
            <span *ngIf="field.required">*</span>
          </label>
          <input #{{field.key}}
            class="amplify-form-input"
            [ngClass]="{'amplify-input-invalid ': field.invalid}"
            type={{field.type}}
            [placeholder]="this.amplifyService.i18n().get(field.label)"
            [(ngModel)]="user[field.key]"
            name="field.key"
            data-test="${auth.signUp.nonPhoneNumberInput}"
            />
            <div *ngIf="field.key === 'password'" class="amplify-form-extra-details">
              {{passwordPolicy}}
            </div>
        </div>
        <div *ngIf="field.key === 'phone_number'">
          <amplify-auth-phone-field-core
            [label]="field.label"
            [required]="field.required"
            [placeholder]="field.placeholder"
            [defaultCountryCode]="country_code"
            (phoneFieldChanged)="onPhoneFieldChanged($event)"
          ></amplify-auth-phone-field-core>
        </div>
      </div>
      <div class="amplify-form-actions">
        <div class="amplify-form-cell-left" *ngIf="!shouldHide('SignIn')">
          <div class="amplify-form-signup">
            {{ this.amplifyService.i18n().get('Have an account?') }}
            <a class="amplify-form-link" (click)="onSignIn()" data-test="${auth.signUp.signInLink}">
              {{ this.amplifyService.i18n().get('Sign in') }}
            </a>
          </div>
        </div>
        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
          (click)="onSignUp()"
          data-test="${auth.signUp.createAccountButton}"
          >{{ this.amplifyService.i18n().get('Create Account') }}</button>
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

export class SignUpField {
	label: string;
	key: string;
	required?: boolean;
	type?: string;
	displayOrder?: number;
	invalid?: boolean;
	custom?: boolean;
	signUpWith?: boolean;
}

@Component({
	selector: 'amplify-auth-sign-up-core',
	template,
})
export class SignUpComponentCore implements OnInit {
	_authState: AuthState;
	_show: boolean;
	_signUpConfig: any;
	_usernameAttributes: string = 'username';
	user: any = {};
	local_phone_number: string = '';
	country_code: string = '1';
	header: string = 'Create a new account';
	defaultSignUpFields: SignUpField[] = defaultSignUpFieldAssets;
	signUpFields: SignUpField[] = this.defaultSignUpFields;
	errorMessage: string;
	hiddenFields: any = [];
	passwordPolicy: string;
	defaultCountryCode: string;
	protected logger: any;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('SignUpComponent');
	}

	@Input()
	set data(data: any) {
		this._authState = data.authState;
		this._show = data.authState.state === 'signUp';
		this._usernameAttributes = data.usernameAttributes;
		if (data.signUpConfig) {
			this._signUpConfig = data.signUpConfig;
			if (this._signUpConfig.defaultCountryCode) {
				this.country_code = this._signUpConfig.defaultCountryCode;
			}
			if (this._signUpConfig.signUpFields) {
				this.signUpFields = this._signUpConfig.signUpFields;
			}
			if (this._signUpConfig.header) {
				this.header = this._signUpConfig.header;
			}
			if (this._signUpConfig.hiddenDefaults) {
				this.hiddenFields = this._signUpConfig.hiddenDefaults;
			}

			if (this._usernameAttributes === UsernameAttributes.EMAIL) {
				this.signUpFields = signUpWithEmailFields;
				this.defaultSignUpFields = signUpWithEmailFields;
			} else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
				this.signUpFields = signUpWithPhoneNumberFields;
				this.defaultSignUpFields = signUpWithPhoneNumberFields;
			}

			if (this._signUpConfig.passwordPolicy) {
				this.passwordPolicy = this._signUpConfig.passwordPolicy;
			}
		}
	}

	@Input() hide: string[] = [];

	@Input()
	set usernameAttributes(usernameAttributes: string) {
		this._usernameAttributes = usernameAttributes;
		if (this._usernameAttributes === UsernameAttributes.EMAIL) {
			this.signUpFields = signUpWithEmailFields;
			this.defaultSignUpFields = signUpWithEmailFields;
		} else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
			this.signUpFields = signUpWithPhoneNumberFields;
			this.defaultSignUpFields = signUpWithPhoneNumberFields;
		}
	}

	@Input()
	set authState(authState: AuthState) {
		this._authState = authState;
		this._show = authState.state === 'signUp';
	}

	@Input()
	set signUpConfig(signUpConfig: any) {
		if (signUpConfig) {
			this._signUpConfig = signUpConfig;
			if (this._signUpConfig.defaultCountryCode) {
				this.country_code = this._signUpConfig.defaultCountryCode;
			}
			if (this._signUpConfig.signUpFields) {
				this.signUpFields = this._signUpConfig.signUpFields;
			}
			if (this._signUpConfig.header) {
				this.header = this._signUpConfig.header;
			}
			if (this._signUpConfig.hiddenDefaults) {
				this.hiddenFields = this._signUpConfig.hiddenDefaults;
			}
			if (this._signUpConfig.passwordPolicy) {
				this.passwordPolicy = this._signUpConfig.passwordPolicy;
			}
		}
	}

	ngOnInit() {
		if (!this.amplifyService.auth()) {
			this.logger.warn('Auth module not registered on AmplifyService provider');
		}
		this.sortFields();
	}

	shouldHide(comp) {
		return this.hide.filter(item => item === comp).length > 0;
	}

	onSignUp() {
		// validate required inputs
		const validation = this.validate();
		if (validation && validation.length > 0) {
			return this._setError(
				`The following fields need to be filled out: ${validation.join(', ')}`
			);
		}

		// create user attribute property
		this.user.attributes = {};

		// format phone number if it is a signUpField
		const phoneNumberRequested = this.signUpFields.find(el => {
			return el.key === 'phone_number';
		});
		if (phoneNumberRequested) {
			this.user.phone_number = composePhoneNumber(
				this.country_code,
				this.local_phone_number
			);
		}

		// create user key and value arrays
		const userKeys = Object.keys(this.user);
		const userValues = userKeys.map(key => this.user[key]);

		// format data for Cognito user pool
		userKeys.forEach((key, index) => {
			if (key !== 'username' && key !== 'password' && key !== 'attributes') {
				// needsPrefix determines if a custom attribute is indicated
				// and prepends 'custom:' to the key before sending to Cognito if needed
				const newKey = `${this.needPrefix(key) ? 'custom:' : ''}${key}`;
				this.user.attributes[newKey] = userValues[index];
			}
		});

		let labelCheck = false;
		this.signUpFields.forEach(field => {
			if (field.label === this.getUsernameLabel()) {
				this.amplifyService.logger(
					`Changing the username to the value of ${field.label}`,
					'DEBUG'
				);
				this.user.username =
					this.user.attributes[field.key] || this.user.username;
				labelCheck = true;
			}
		});
		if (!labelCheck && !this.user.username) {
			// if the customer customized the username field in the sign up form
			// He needs to either set the key of that field to 'username'
			// Or make the label of the field the same as the 'usernameAttributes'
			throw new Error(
				`Couldn't find the label: ${this.getUsernameLabel()}, in sign up fields according to usernameAttributes!`
			);
		}

		this.amplifyService
			.auth()
			.signUp(this.user)
			.then(user => {
				const username = this.user.username;
				this.user = {};
				this.onAlertClose();
				this.amplifyService.setAuthState({
					state: 'confirmSignUp',
					user: { username: username },
				});
			})
			.catch(err => this._setError(err));
	}

	onSignIn() {
		this.onAlertClose();
		this.amplifyService.setAuthState({ state: 'signIn', user: null });
	}

	needPrefix(key) {
		const field = this.signUpFields.find(e => e.key === key);
		if (key.indexOf('custom:') !== 0) {
			return field.custom;
		} else if (key.indexOf('custom:') === 0 && field.custom === false) {
			this.logger.warn(
				'Custom prefix prepended to key but custom field flag is set to false'
			);
		}
		return null;
	}

	onConfirmSignUp() {
		this.onAlertClose();
		this.amplifyService.setAuthState({
			state: 'confirmSignUp',
			user: { username: this.user.username },
		});
	}

	sortFields() {
		if (this.hiddenFields.length > 0) {
			this.defaultSignUpFields = this.defaultSignUpFields.filter(d => {
				return !this.hiddenFields.includes(d.key);
			});
		}

		if (
			this._signUpConfig &&
			this._signUpConfig.signUpFields &&
			this._signUpConfig.signUpFields.length > 0
		) {
			if (!this._signUpConfig.hideAllDefaults) {
				// see if fields passed to component should override defaults
				this.defaultSignUpFields.forEach((f, i) => {
					const matchKey = this.signUpFields.findIndex(d => {
						return d.key === f.key;
					});
					if (matchKey === -1) {
						this.signUpFields.push(f);
					}
				});
			}

			/*
        sort fields based on following rules:
        1. Fields with displayOrder are sorted before those without displayOrder
        2. Fields with conflicting displayOrder are sorted alphabetically by key
        3. Fields without displayOrder are sorted alphabetically by key
      */
			this.signUpFields.sort((a, b) => {
				if (a.displayOrder && b.displayOrder) {
					if (a.displayOrder < b.displayOrder) {
						return -1;
					} else if (a.displayOrder > b.displayOrder) {
						return 1;
					} else {
						if (a.key < b.key) {
							return -1;
						} else {
							return 1;
						}
					}
				} else if (!a.displayOrder && b.displayOrder) {
					return 1;
				} else if (a.displayOrder && !b.displayOrder) {
					return -1;
				} else if (!a.displayOrder && !b.displayOrder) {
					if (a.key < b.key) {
						return -1;
					} else {
						return 1;
					}
				}
			});
			this.signUpFields = this.removeHiddenFields();
		}
	}

	onAlertClose() {
		this._setError(null);
	}

	removeHiddenFields() {
		return this.signUpFields.filter(f => {
			return !f.displayOrder || f.displayOrder !== -1;
		});
	}

	validate() {
		const invalids = [];
		this.signUpFields.map(el => {
			if (el.key !== 'phone_number') {
				if (el.required && !this.user[el.key]) {
					el.invalid = true;
					invalids.push(this.amplifyService.i18n().get(el.label));
				} else {
					el.invalid = false;
				}
			} else {
				if (el.required && (!this.country_code || !this.local_phone_number)) {
					el.invalid = true;
					invalids.push(this.amplifyService.i18n().get(el.label));
				} else {
					el.invalid = false;
				}
			}
		});
		return invalids;
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

	onPhoneFieldChanged(event: PhoneFieldOutput) {
		this.country_code = event.country_code;
		this.local_phone_number = event.local_phone_number;
	}
}
