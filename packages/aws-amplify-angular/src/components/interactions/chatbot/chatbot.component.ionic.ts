import { Component, ViewChild } from '@angular/core';
import { ChatbotComponentCore } from './chatbot.component.core'
import { AmplifyService } from '../../../providers';

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
		        placeholder="Message"
		        [value]="inputText"
		        (keyup.enter)="onSubmit(inputValue.value)"
		        (ionChange)="onInputChange($event.target.value)"></ion-input>
		    <ion-button expand="block" (click)="onSubmit(inputValue.value)">Send</ion-button>
		</div>
	</div>
</div>
`;

@Component({
  selector: 'amplify-interactions-ionic',
  template
})
export class ChatbotComponentIonic extends ChatbotComponentCore {
  
  constructor(amplifyService: AmplifyService) {
    super(amplifyService);    
  }

}
