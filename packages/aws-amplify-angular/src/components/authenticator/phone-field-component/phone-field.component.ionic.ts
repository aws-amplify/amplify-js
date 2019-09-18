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

import { Component, Input, Inject } from '@angular/core';
import { PhoneFieldComponentCore } from './phone-field.component.core';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<ion-grid class="amplify-ionic-grid-padding-left">
    <ion-row>
        <ion-col size="6" class="amplify-ionic-grid-padding-left">
            <ion-label class="amplify-input-label push-right"
                position="stacked" 
                for="localPhoneNumberField">
                {{ this.amplifyService.i18n().get(this._label) }}
                <span *ngIf="_required">*</span>
            </ion-label>
            <ion-select 
            #countryCodeField
            name="countryCode"
            class="amplify-select-phone-country"
            [value]="_country_code"
            (ionChange)="setCountryCode($event.target.value)"
            data-test="${auth.genericAttrs.dialCodeSelect}">
            <ion-select-option *ngFor="let country of _countries"
            value={{country.value}}>
                {{country.label}}
            </ion-select-option>
            </ion-select>
        </ion-col>
        <ion-col size="6">
            <ion-label class="amplify-input-label push-right">&nbsp;</ion-label>
            <ion-input
            #localPhoneNumberField
            class="amplify-form-input-phone-ionic"
            placeholder="{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}"
            name="local_phone_number"
            type="tel"
            (ionChange)="setLocalPhoneNumber($event.target.value)"
            data-test="${auth.genericAttrs.phoneNumberInput}"
            ></ion-input>
        </ion-col>
    </ion-row>
</ion-grid>`;

@Component({
	selector: 'amplify-auth-phone-field-ionic',
	template,
})
export class PhoneFieldComponentIonic extends PhoneFieldComponentCore {
	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
