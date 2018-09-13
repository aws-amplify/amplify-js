import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';

const template = `
<div class="amplify-interactions">
	<div class="amplify-interactions-container">
		<div class="amplify-form-container">
			<div class="amplify-form-row">
				<div class="amplify-interactions-conversation">
					<div *ngFor="let message of messages">
						<div class="amplify-interactions-input">{{message.me}}</div>
						<div class="amplify-interactions-input-timestamp">{{message.meSentTime}}</div>
						<div class="amplify-interactions-response">{{message.bot}}</div>
						<div class="amplify-interactions-response-timestamp">{{message.botSentTime}}</div>
					</div>
				</div>
			</div>
			<div class="amplify-interactions-actions">
				<input #inputValue
					type='text'
					class="amplify-form-input"
					placeholder="Write a message"
					[value]="inputText"
					(keyup.enter)="onSubmit(inputValue.value)"
					(change)="onInputChange($event.target.value)">

				<button class="amplify-interactions-button" (click)="onSubmit(inputValue.value)"></button>
			</div>
		</div>
	</div>
</div>
`;

@Component({
	selector: 'amplify-interactions-core',
	template: template
})
export class ChatbotComponentCore implements OnInit {
	errorMessage: string;
	amplifyService: AmplifyService;
	inputText:string = "";
	botName:string;
	chatTitle:string;
	clearComplete:boolean = false;
	messages:any = [];
  completions:any = {};

	@Output()
	complete: EventEmitter<string> = new EventEmitter<string>();

	constructor(amplifyService: AmplifyService) {
		this.amplifyService = amplifyService;
	}
	
	@Input()
	set data(data: any){
		this.botName = data.bot;
		this.chatTitle = data.title;
		this.clearComplete = data.clearComplete;
		this.performOnComplete = this.performOnComplete.bind(this);
		this.amplifyService.interactions().onComplete(this.botName,this.performOnComplete);
	}


	@Input()
	set bot(botName: string) {
		this.botName = botName;
		this.performOnComplete = this.performOnComplete.bind(this);
		this.amplifyService.interactions().onComplete(botName,this.performOnComplete);
	}

	@Input()
	set title(title: string) {
		this.chatTitle = title;
	}

	@Input()
	set clearOnComplete(clearComplete: boolean) {
		this.clearComplete = clearComplete;
	}

  ngOnInit(){
    console.log(this)
  }

	performOnComplete(evt) {
		this.complete.emit(evt);
		if (this.clearComplete) {
			this.messages = [];
		}
	}

	onInputChange(value:string) {
		this.inputText = value;
  }
  


	onSubmit(e) {
		if (!this.inputText) {
			return;
		}
		let message = {
			'me':this.inputText,
			'meSentTime': new Date().toLocaleTimeString(),
			'bot': '',
			'botSentTime': ''
		};
		this.amplifyService.interactions().send(this.botName, this.inputText)
			.then((response:any) => {
				this.inputText = "";
				console.log('Interactions Response: ', response);
				message.bot = response.message;
				message.botSentTime = new Date().toLocaleTimeString();
				this.messages.push(message);
			})
			.catch((error) => console.log('Interactions Error: ', error));
	}

}
