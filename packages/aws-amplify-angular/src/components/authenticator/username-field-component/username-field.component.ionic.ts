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
import { UsernameFieldComponentCore } from './username-field.component.core';
import { AmplifyService } from '../../../providers/amplify.service';
import { auth } from '../../../assets/data-test-attributes';

const template = `

    <ion-item lines="none" *ngIf="this._usernameAttributes === 'email'">
        <ion-label class="amplify-input-label amplify-input-label-ionic" for="emailField" position="stacked">{{ this.amplifyService.i18n().get('Email *') }}</ion-label>
        <ion-input type="text"
            #emailField
            class="amplify-form-input"
            type="email"
            placeholder="{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}"
            (input)="setEmail($event.target.value)"
            data-test="${auth.genericAttrs.emailInput}"
        ></ion-input>
    </ion-item> 
    <ion-item lines="none" *ngIf="this._usernameAttributes === 'phone_number'">
       <amplify-auth-phone-field-ionic
            (phoneFieldChanged)="onPhoneFieldChanged($event)"
        ></amplify-auth-phone-field-ionic>
    </ion-item>
    <ion-item lines="none" *ngIf="this._usernameAttributes !== 'email' && this._usernameAttributes !== 'phone_number'">
        <ion-label class="amplify-input-label amplify-input-label-ionic" for="usernameField" position="stacked">{{ this.amplifyService.i18n().get(getUsernameLabel()) }} *</ion-label>
        <ion-input type="text"
            #usernameField
            class="amplify-form-input"
            type="text"
            placeholder="{{ this.amplifyService.i18n().get(this.getPlaceholder()) }}"
            (input)="setUsername($event.target.value)"
            data-test="${auth.genericAttrs.usernameInput}"
        ></ion-input>
    </ion-item>

`;

@Component({
	selector: 'amplify-auth-username-field-ionic',
	template,
})
export class UsernameFieldComponentIonic extends UsernameFieldComponentCore {
	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
