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

import { Component, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { ChatbotComponentCore } from './chatbot.component.core';
import { AmplifyService } from '../../../providers/amplify.service';

const template = `
<div class="amplify-interactions-container">
	<div class="amplify-form-container">
		<ion-grid>
			<ion-row *ngIf="chatTitle"> 
				<ion-col>
					<ion-row>
						<ion-col align-self-start>
							<div>
								<ion-chip color="primary">
									<ion-label>{{chatTitle}}</ion-label>
								</ion-chip>
							</div>
						</ion-col>
						<ion-col align-self-end>
							&nbsp;
						</ion-col>
					</ion-row>
				</ion-col>
			</ion-row>
			<ion-row *ngFor="let message of messages">
				<ion-col>
					<ion-row>
						<ion-col align-self-start>
							<div>
								&nbsp;
							</div>
						</ion-col>
						<ion-col align-self-end>
							<ion-chip style="float:right">
								<ion-label>{{message.me}}</ion-label>
							</ion-chip>
						</ion-col>
					</ion-row>
					<ion-row>
						<ion-col align-self-start>
							<ion-chip color="primary">
								<ion-label>{{message.bot}}</ion-label>
							</ion-chip>
						</ion-col>
						<ion-col align-self-end>
							<div>
								&nbsp;
							</div>
						</ion-col>
					</ion-row>
				</ion-col>
			</ion-row>
		</ion-grid>
		<div class="amplify-form-row">
		    <ion-input #inputValue
				type='text'
		        class="amplify-form-input amplify-form-input-interactions-ionic"
		        placeholder="{{currentVoiceState}}"
		        [value]="inputText"
		        (keyup.enter)="onSubmit(inputValue.value)"
				(ionChange)="onInputChange($event.target.value)"
				[disabled]="inputDisabled"
				*ngIf="textEnabled"></ion-input>
			<ion-input #inputValue
				type='text'
				class="amplify-form-input amplify-form-input-interactions-ionic"
				placeholder="{{currentVoiceState}}"
				[disabled]="!textEnabled"
				*ngIf="!textEnabled"></ion-input>
			<ion-button 
				expand="block"
				*ngIf="voiceEnabled"
				ng-style="{float: 'right'}"
				(click)="micButtonHandler()"
				[disabled]="micButtonDisabled"
			>
				{{micText}}
			</ion-button>
			<ion-button
				expand="block"
				*ngIf="textEnabled"
				ng-style="{float: 'right'}"
				(click)="inputDisabled === false || onSubmit(inputValue.value)"
			>
				Send
			</ion-button>
		</div>
	</div>
</div>
`;

@Component({
	selector: 'amplify-interactions-ionic',
	template,
})
export class ChatbotComponentIonic extends ChatbotComponentCore {
	inputValue;

	constructor(
		ref: ChangeDetectorRef,
		@Inject(AmplifyService)
		public amplifyService: AmplifyService
	) {
		super(ref, amplifyService);
	}
}
