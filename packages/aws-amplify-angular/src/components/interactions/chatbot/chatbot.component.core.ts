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

import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	ChangeDetectorRef,
	Inject,
} from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { chatBot } from '../../../assets/data-test-attributes';
require('./aws-lex-audio.js');

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
					data-test="${chatBot.messageInput}"
					type='text'
					class="amplify-form-input"
					placeholder="{{currentVoiceState}}"
					[value]="inputText"
					(keyup.enter)="onSubmit(inputValue.value)"
					(change)="onInputChange($event.target.value)"
					[disabled]="inputDisabled"
					*ngIf="textEnabled">
				<input #inputValue
					type='text'
					class="amplify-form-input"
					placeholder="{{currentVoiceState}}"
					[disabled]="!textEnabled"
					*ngIf="!textEnabled">

				<button
					type="button"
					*ngIf="voiceEnabled"
					ng-style="{float: 'right'}"
					(click)="micButtonHandler()"
					[disabled]="micButtonDisabled"
				>
					{{micText}}
				</button>
				<button
					type="button"
					*ngIf="textEnabled"
					ng-style="{float: 'right'}"
					class="amplify-interactions-button"
					[disabled]="inputDisabled"
					ng-click="!inputDisabled || onSubmit(inputValue.value)"
				></button>
			</div>
		</div>
	</div>
</div>
`;
declare var LexAudio: any;

const STATES = {
	INITIAL: { MESSAGE: 'Type your message or click  🎤', ICON: '🎤' },
	LISTENING: { MESSAGE: 'Listening... click 🔴 again to cancel', ICON: '🔴' },
	SENDING: { MESSAGE: 'Please wait...', ICON: '🔊' },
	SPEAKING: { MESSAGE: 'Speaking...', ICON: '...' },
};

const defaultVoiceConfig = {
	silenceDetectionConfig: {
		time: 2000,
		amplitude: 0.2,
	},
};

@Component({
	selector: 'amplify-interactions-core',
	template,
})
export class ChatbotComponentCore implements OnInit {
	errorMessage: string;
	inputText: string = '';
	botName: string;
	chatTitle: string;
	clearComplete: boolean = false;
	messages: any = [];
	completions: any = {};
	currentVoiceState: string = STATES.INITIAL.MESSAGE;
	inputDisabled: boolean = false;
	micText: string = STATES.INITIAL.ICON;
	voiceConfig: any = defaultVoiceConfig;
	continueConversation: boolean = false;
	micButtonDisabled: boolean = false;
	audioInput: any;
	lexResponse: any;
	conversationModeOn: boolean = false;
	ref: ChangeDetectorRef;
	voiceEnabled: boolean = false;
	textEnabled: boolean = true;
	audioControl: any;
	protected logger;

	@Output()
	complete: EventEmitter<string> = new EventEmitter<string>();

	constructor(
		ref: ChangeDetectorRef,
		@Inject(AmplifyService) public amplifyService: AmplifyService
	) {
		this.ref = ref;
		this.continueConversation = false;
		this.logger = this.amplifyService.logger('ChatbotComponent');
	}

	@Input()
	set data(data: any) {
		this.botName = data.bot;
		this.chatTitle = data.title;
		this.clearComplete = data.clearComplete;
		this.conversationModeOn =
			data.conversationModeOn === undefined ? false : data.conversationModeOn;
		this.voiceEnabled =
			data.voiceEnabled === undefined ? false : data.voiceEnabled;
		this.textEnabled = data.textEnabled === undefined ? true : data.textEnabled;
		this.voiceConfig = data.voiceConfig || this.voiceConfig;
		this.performOnComplete = this.performOnComplete.bind(this);
		this.amplifyService
			.interactions()
			.onComplete(this.botName, this.performOnComplete);

		if (!this.textEnabled && this.voiceEnabled) {
			this.currentVoiceState = 'Click the mic button';
			STATES.INITIAL.MESSAGE = 'Click the mic button';
		}

		if (!this.voiceEnabled && this.textEnabled) {
			this.currentVoiceState = 'Type a message';
			STATES.INITIAL.MESSAGE = 'Type a message';
		}

		if (this.voiceEnabled) {
			this.audioControl = new LexAudio.audioControl();
		}
	}

	@Input()
	set bot(botName: string) {
		this.botName = botName;
		this.performOnComplete = this.performOnComplete.bind(this);
		this.amplifyService
			.interactions()
			.onComplete(botName, this.performOnComplete);
	}

	@Input()
	set title(title: string) {
		this.chatTitle = title;
	}

	@Input()
	set clearOnComplete(clearComplete: boolean) {
		this.clearComplete = clearComplete;
	}

	ngOnInit() {
		if (!this.amplifyService.interactions()) {
			throw new Error(
				'Interactions module not registered on AmplifyService provider'
			);
		}
	}

	performOnComplete(evt) {
		this.complete.emit(evt);
		if (this.clearComplete) {
			this.messages = [];
		}
	}

	onInputChange(value: string) {
		this.inputText = value;
	}

	onSubmit(e) {
		if (!this.inputText) {
			return;
		}
		const message = {
			me: this.inputText,
			meSentTime: new Date().toLocaleTimeString(),
			bot: '',
			botSentTime: '',
		};
		this.amplifyService
			.interactions()
			.send(this.botName, this.inputText)
			.then((response: any) => {
				this.inputText = '';
				message.bot = response.message;
				message.botSentTime = new Date().toLocaleTimeString();
				this.messages.push(message);
			})
			.catch((error) => this.logger.error(error));
	}

	onSilenceHandler = () => {
		if (!this.continueConversation) {
			return;
		}
		this.audioControl.exportWAV((blob) => {
			this.currentVoiceState = STATES.SENDING.MESSAGE;
			this.audioInput = blob;
			this.micText = STATES.SENDING.ICON;
			this.micButtonDisabled = true;
			this.lexResponseHandler();
		});
		this.ref.detectChanges();
	};

	reset() {
		this.audioControl.clear();
		this.inputText = '';
		this.currentVoiceState = STATES.INITIAL.MESSAGE;
		this.inputDisabled = false;
		this.micText = STATES.INITIAL.ICON;
		this.continueConversation = false;
		this.micButtonDisabled = false;
		this.ref.detectChanges();
	}

	onError(error) {
		this.logger.error(error);
	}

	async lexResponseHandler() {
		if (!this.continueConversation) {
			return;
		}

		const interactionsMessage = {
			content: this.audioInput,
			options: {
				messageType: 'voice',
			},
		};

		const response = await this.amplifyService
			.interactions()
			.send(this.botName, interactionsMessage);

		this.lexResponse = response;
		this.currentVoiceState = STATES.SPEAKING.MESSAGE;
		this.micText = STATES.SPEAKING.ICON;
		this.micButtonDisabled = true;

		const message = {
			me: this.lexResponse.inputTranscript,
			meSentTime: new Date().toLocaleTimeString(),
			bot: '',
			botSentTime: '',
		};

		this.inputText = '';
		message.bot = this.lexResponse.message;
		message.botSentTime = new Date().toLocaleTimeString();
		this.messages.push(message);
		this.doneSpeakingHandler();
		this.ref.detectChanges();
	}

	doneSpeakingHandler() {
		if (!this.continueConversation) {
			return;
		}
		if (this.lexResponse.contentType === 'audio/mpeg') {
			this.audioControl.play(this.lexResponse.audioStream, () => {
				if (
					this.lexResponse.dialogState === 'ReadyForFulfillment' ||
					this.lexResponse.dialogState === 'Fulfilled' ||
					this.lexResponse.dialogState === 'Failed' ||
					!this.conversationModeOn
				) {
					this.inputDisabled = false;
					this.currentVoiceState = STATES.INITIAL.MESSAGE;
					this.micText = STATES.INITIAL.ICON;
					this.micButtonDisabled = false;
					this.continueConversation = false;
					this.ref.detectChanges();
				} else {
					this.currentVoiceState = STATES.LISTENING.MESSAGE;
					this.micText = STATES.LISTENING.ICON;
					this.micButtonDisabled = false;
					this.audioControl.startRecording(
						this.onSilenceHandler,
						null,
						this.voiceConfig.silenceDetectionConfig
					);
					this.ref.detectChanges();
				}
			});
		} else {
			this.inputDisabled = false;
			this.currentVoiceState = STATES.INITIAL.MESSAGE;
			this.micText = STATES.INITIAL.ICON;
			this.micButtonDisabled = false;
			this.continueConversation = false;
			this.ref.detectChanges();
		}
	}

	async micButtonHandler() {
		if (this.continueConversation) {
			this.reset();
			this.ref.detectChanges();
		} else {
			this.inputDisabled = true;
			this.continueConversation = true;
			this.currentVoiceState = STATES.LISTENING.MESSAGE;
			this.micText = STATES.LISTENING.ICON;
			this.micButtonDisabled = false;
			this.audioControl.startRecording(
				this.onSilenceHandler,
				null,
				this.voiceConfig.silenceDetectionConfig
			);
			this.ref.detectChanges();
		}
	}
}
