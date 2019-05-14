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

import { Component, Input, OnInit, 	EventEmitter, Inject, Output } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { PhoneFieldOutput } from '../types';
import { countrylist, country }  from '../../../assets/countries';

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
            (change)="setCountryCode($event.target.value)"
            data-test="dial-code-select"
            >
            <option *ngFor="let country of _countries"
                value={{country.value}}
                selected={{isDefaultCountryCode(country)}}>
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
                type="text"
                (keyup)="setLocalPhoneNumber($event.target.value)"
                data-test="phone-number-input"
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
    _placeholder : string = '';
    _label: string = 'Phone Number';
    _required: boolean = true;
    _country_code: string = '1';
    _local_phone_number: string = '';
    _countries: country[];
    _defaultCountryCode = '1';

    constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
        this._countries = countrylist;
    }

    @Input()
    set data(data: any) {
        this._placeholder = data.placeholder || this._placeholder;
        this._label = data.label || this._label;
        this._defaultCountryCode = data._defaultCountryCode || this._defaultCountryCode;
        this._required = data.required === undefined? this._required : data.required;
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
        this._defaultCountryCode = defaultCountryCode;
    }

    @Output()
	phoneFieldChanged: EventEmitter<PhoneFieldOutput> = new EventEmitter<PhoneFieldOutput>();

    ngOnInit() {}

    ngOnDestroy() {}

    setCountryCode(country_code: string) {
        console.log('countrycode changed');
        this._country_code = country_code;
        this.phoneFieldChanged.emit({
            country_code: this._country_code,
            local_phone_number: this._local_phone_number
        });
    }

    setLocalPhoneNumber(local_phone_number: string) {
        console.log('phone number changed');
        this._local_phone_number = local_phone_number;
        this.phoneFieldChanged.emit({
            country_code: this._country_code,
            local_phone_number: this._local_phone_number
        });
    }

    getPlaceholder() {
        return this.amplifyService.i18n().get(`Enter your phone number` || this._placeholder);
    }

    isDefaultCountryCode(country) {
        if (country.value === this._defaultCountryCode) {
            // Because Canada, US and Sint Maarten share the same code
            // We will return US by default
            if (this._defaultCountryCode === '1') {
                return country.countryCode === 'US'? 'selected' : undefined;
            }
            return 'selected';
        } else {
            return undefined;
        }
    }
}
