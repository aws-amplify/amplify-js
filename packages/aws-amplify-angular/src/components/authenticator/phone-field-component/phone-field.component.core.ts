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
import { AmplifyService } from '../../../providers/amplify.service';
import { PhoneFieldOutput } from '../types';
import { countrylist, country } from '../../../assets/countries';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div>
    <label class="amplify-input-label" for="localPhoneNumberField">
        {{ this.amplifyService.i18n().get(this._label) }}
        <span *ngIf="_required">*</span>
    </label>
    <div class="amplify-input-group">
        <div class="amplify-input-group-item">
            <select 
            #countryCodeField
            name="countryCode"
            class="amplify-select-phone-country"
            [(ngModel)]="_country_code"
            (change)="setCountryCode($event.target.value)"
            data-test="${auth.genericAttrs.dialCodeSelect}"
            >
            <option *ngFor="let country of _countries"
                value={{country.value}}>
                {{country.label}}
            </option>
            </select>
        </div>
        <div class="amplify-input-group-item">
            <input
                #localPhoneNumberField
                class="amplify-form-input"
                placeholder="{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}"
                name="local_phone_number"
                type="tel"
                (keyup)="setLocalPhoneNumber($event.target.value)"
                data-test="${auth.genericAttrs.phoneNumberInput}"
            />
        </div>
    </div>
</div>
`;

@Component({
	selector: 'amplify-auth-phone-field-core',
	template,
})
export class PhoneFieldComponentCore implements OnInit {
	_placeholder: string = '';
	_label: string = 'Phone Number';
	_required: boolean = true;
	_country_code: string = '1';
	_local_phone_number: string = '';
	_countries: country[];

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this._countries = countrylist;
	}

	@Input()
	set data(data: any) {
		this._placeholder = data.placeholder || this._placeholder;
		this._label = data.label || this._label;
		this._country_code = data.defaultCountryCode || this._country_code;
		this._required =
			data.required === undefined ? this._required : data.required;
	}

	@Input()
	set placeholder(placeholder: string) {
		this._placeholder = placeholder;
	}

	@Input()
	set label(label: string) {
		this._label = label;
	}

	@Input()
	set required(required: boolean) {
		this._required = required;
	}

	@Input()
	set defaultCountryCode(defaultCountryCode: string) {
		this._country_code = defaultCountryCode;
	}

	@Output()
	phoneFieldChanged: EventEmitter<PhoneFieldOutput> = new EventEmitter<
		PhoneFieldOutput
	>();

	ngOnInit() {}

	ngOnDestroy() {}

	setCountryCode(country_code: string) {
		this._country_code = country_code;
		this.phoneFieldChanged.emit({
			country_code: this._country_code,
			local_phone_number: this._local_phone_number,
		});
	}

	setLocalPhoneNumber(local_phone_number: string) {
		this._local_phone_number = local_phone_number;
		this.phoneFieldChanged.emit({
			country_code: this._country_code,
			local_phone_number: this._local_phone_number,
		});
	}

	getPlaceholder() {
		return this.amplifyService
			.i18n()
			.get(`Enter your phone number` || this._placeholder);
	}
}
