// tslint:disable
/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
	Component,
	Input,
	OnInit,
	EventEmitter,
	Inject,
	Output,
} from '@angular/core';
import { labelMap } from '../common';
import {
	UsernameAttributes,
	UsernameFieldOutput,
	PhoneFieldOutput,
} from '../types';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-amplify-form-row amplify-signin-username">
    <div *ngIf="this._usernameAttributes === 'email'">
        <label class="amplify-input-label" for="emailField"> {{ this.amplifyService.i18n().get('Email') }} *</label>
        <input
            #emailField
            class="amplify-form-input"
            type="email"
            placeholder="{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}"
            (keyup)="setEmail($event.target.value)"
            data-test="${auth.genericAttrs.emailInput}"
        />
    </div>
    <div *ngIf="this._usernameAttributes === 'phone_number'">
        <amplify-auth-phone-field-core
            (phoneFieldChanged)="onPhoneFieldChanged($event)"
        ></amplify-auth-phone-field-core>
    </div>
    <div *ngIf="this._usernameAttributes !== 'email' && this._usernameAttributes !== 'phone_number'">
        <label class="amplify-input-label" for="usernameField"> {{ this.amplifyService.i18n().get(getUsernameLabel()) }} *</label>
        <input
            #usernameField
            class="amplify-form-input"
            type="text"
            value="{{this.username}}"
            placeholder="{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}"
            (keyup)="setUsername($event.target.value)"
            data-test="${auth.genericAttrs.usernameInput}"
        />
    </div>
</div>
`;

@Component({
	selector: 'amplify-auth-username-field-core',
	template,
})
export class UsernameFieldComponentCore implements OnInit {
	_usernameAttributes: string = UsernameAttributes.USERNAME;
	_placeholder: string = '';
	username: string;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.onPhoneFieldChanged = this.onPhoneFieldChanged.bind(this);
	}

	@Input()
	set data(data: any) {
		this._usernameAttributes = data.usernameAttributes;
		this._placeholder = data.placeholder;
	}

	@Input()
	set usernameAttributes(usernameAttributes: string) {
		this._usernameAttributes = usernameAttributes;
	}

	@Input()
	set placeholder(placeholder: string) {
		this._placeholder = placeholder;
	}

	@Output()
	usernameFieldChanged: EventEmitter<UsernameFieldOutput> = new EventEmitter<
		UsernameFieldOutput
	>();

	ngOnInit() {
		if (
			window &&
			window.location &&
			window.location.search &&
			this._usernameAttributes !== 'email' &&
			this._usernameAttributes !== 'phone_number'
		) {
			const searchParams = new URLSearchParams(window.location.search);
			const username = searchParams ? searchParams.get('username') : undefined;
			this.setUsername(username);
			this.username = username;
		}
	}

	ngOnDestroy() {}

	setUsername(username: string) {
		this.usernameFieldChanged.emit({
			username,
		});
	}

	setEmail(email: string) {
		this.usernameFieldChanged.emit({
			email,
		});
	}

	getUsernameLabel() {
		return (
			labelMap[this._usernameAttributes as string] || this._usernameAttributes
		);
	}

	getPlaceholder() {
		return this.amplifyService
			.i18n()
			.get(`${this.getUsernameLabel()}` || this._placeholder);
	}

	onPhoneFieldChanged(event: PhoneFieldOutput) {
		this.usernameFieldChanged.emit({
			...event,
		});
	}
}
