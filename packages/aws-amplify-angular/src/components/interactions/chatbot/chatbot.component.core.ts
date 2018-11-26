import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
require('./aws-lex-audio.js')

const logger = new Logger('ChatBot');

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
					placeholder="{{currentVoiceState}}"
					[value]="inputText"
					(keyup.enter)="onSubmit(inputValue.value)"
					(change)="onInputChange($event.target.value)"
					[disabled]="inputDisabled">
				<button type="button" ng-style="{float: 'right'}" (click)="handleVoiceClick()" [disabled]="micButtonDisabled">{{micText}}</button>
				<button type="button" ng-style="{float: 'right'}" class="amplify-interactions-button" [disabled]="inputDisabled" ng-click="inputDisabled === false || onSubmit(inputValue.value)"></button>

			</div>
		</div>
	</div>
</div>
`;
declare var LexAudio: any;
const audioControl = new LexAudio.audioControl();

const STATES = {
    INITIAL: 'Type your message or click  🎤',
    LISTENING: 'Listening... click 🔴 again to cancel',
    SENDING: 'Please wait...',
    SPEAKING: 'Speaking...'
};

const MIC_BUTTON_TEXT = {
    PASSIVE: '🎤',
    RECORDING: '🔴',
    PLAYING: '🔊',
    LOADING: '...',
}

const defaultVoiceConfig = {
    silenceDetectionConfig: {
        time: 2000,
        amplitude: 0.2
    }   
}

@Component({
	selector: 'amplify-interactions-core',
	template: template
})
export class ChatbotComponentCore {
	errorMessage: string;
	amplifyService: AmplifyService;
	inputText:string = "";
	botName:string;
	chatTitle:string;
	clearComplete:boolean = false;
	messages:any = [];
	completions:any = {};
	currentVoiceState:string = STATES.INITIAL;
	inputDisabled:boolean = false;
	micText: string = MIC_BUTTON_TEXT.PASSIVE;
	voiceConfiguration:any = defaultVoiceConfig;
	continueConversation:boolean = false;
	micButtonDisabled:boolean = false;
	audioInput:any;
	lexResponse:any;
	conversationsEnabled:boolean = false;
	ref:ChangeDetectorRef;

	@Output()
	complete: EventEmitter<string> = new EventEmitter<string>();

	constructor(ref: ChangeDetectorRef, amplifyService: AmplifyService) {
		this.amplifyService = amplifyService;
		this.ref = ref;
	}
	
	@Input()
	set data(data: any){
		this.botName = data.bot;
		this.chatTitle = data.title;
		this.clearComplete = data.clearComplete;
		this.performOnComplete = this.performOnComplete.bind(this);
		this.amplifyService.interactions().onComplete(this.botName,this.performOnComplete);
		this.conversationsEnabled = data.conversationsEnabled;
		this.voiceConfiguration = data.voiceConfiguration;
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

	@Input()
	set conversationModeOn(conversationsEnabled: boolean) {
		this.conversationsEnabled = conversationsEnabled;
	}

	@Input()
	set voiceConfig(voiceConfiguration: boolean) {
		this.voiceConfiguration = voiceConfiguration;
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
				message.bot = response.message;
				message.botSentTime = new Date().toLocaleTimeString();
				this.messages.push(message);
			})
			.catch((error) => logger.error(error));
	}

	transition(newVoiceState) { 
        if (this.continueConversation !== true) {
            return;
		}
		
		this.currentVoiceState = newVoiceState

		switch (this.currentVoiceState) {
			case STATES.INITIAL:
				this.micText = MIC_BUTTON_TEXT.PASSIVE;
				this.micButtonDisabled = false;
				this.continueConversation = false;
				this.ref.detectChanges();
				break;
			case STATES.LISTENING:
				this.micText = MIC_BUTTON_TEXT.RECORDING;
				this.micButtonDisabled = false;
				this.inputDisabled = false;
				this.ref.detectChanges();
				break;
			case STATES.SENDING:
				this.advanceConversation();
				this.micText = MIC_BUTTON_TEXT.LOADING;
				this.micButtonDisabled = true;
				this.ref.detectChanges();
				break;
			case STATES.SPEAKING:
				this.micText = MIC_BUTTON_TEXT.PLAYING;
				this.micButtonDisabled = true;
				this.advanceConversation();
				this.ref.detectChanges();
				break;
		}
    }

    onSilence = () => {
        audioControl.stopRecording();
        this.advanceConversation(); 
    }

    onAudioData(data) {
        // TODO: visualize audio data
	}
	
	reset() {
		this.inputText = '';
		this.currentVoiceState = STATES.INITIAL;
		this.inputDisabled = false;
		this.micText = MIC_BUTTON_TEXT.PASSIVE;
		this.continueConversation = false;
		this.micButtonDisabled = false;
		audioControl.clear();
		this.ref.detectChanges();
	}
	
    onError(error) {
        logger.error(error)
	}
	
	async onSuccess(response) {
		let message = {
			'me':response.inputTranscript,
			'meSentTime': new Date().toLocaleTimeString(),
			'bot': '',
			'botSentTime': ''
		};
		this.inputText = "";
		message.bot = response.message;
		message.botSentTime = new Date().toLocaleTimeString();
		this.messages.push(message);
    }

    async advanceConversation() {
        audioControl.supportsAudio((supported) => {
            if (!supported) {
                this.onError('Audio is not supported.')
            }
		});
		
		switch (this.currentVoiceState) {
			case STATES.INITIAL:
				audioControl.startRecording(this.onSilence, this.onAudioData, this.voiceConfiguration.silenceDetectionConfig);
				this.transition(STATES.LISTENING);
				break;
			case STATES.LISTENING:
				audioControl.exportWAV((blob) => {
					this.audioInput = blob;
				this.transition(STATES.SENDING);
				});
				break;
			case STATES.SENDING:
				const response = await this.amplifyService.interactions().send(this.botName, this.audioInput);

				this.lexResponse = response,
				this.transition(STATES.SPEAKING)
				this.onSuccess(response)
				break;
			case STATES.SPEAKING:
				if (this.lexResponse.contentType === 'audio/mpeg') {
					audioControl.play(this.lexResponse.audioStream, () => {
						if (this.lexResponse.dialogState === 'ReadyForFulfillment' ||
							this.lexResponse.dialogState === 'Fulfilled' ||
							this.lexResponse.dialogState === 'Failed' ||
							this.conversationsEnabled === false) {
								this.inputDisabled = false;
								this.micText = MIC_BUTTON_TEXT.PASSIVE;
								this.transition(STATES.INITIAL);
								this.ref.detectChanges();
						} else {
							audioControl.startRecording(this.onSilence, this.onAudioData, this.voiceConfiguration.silenceDetectionConfig);
							this.transition(STATES.LISTENING);
						}
					});
				} else {
					this.inputDisabled = false;
					this.transition(STATES.INITIAL);
					this.ref.detectChanges();
				}
				break;
		}
	};
	
	async handleVoiceClick() {
        if (this.continueConversation === true && this.conversationsEnabled === true) {
			this.reset();
			this.ref.detectChanges();
        } else {
			this.inputDisabled = true;
			this.continueConversation = true;
			this.advanceConversation()
			this.ref.detectChanges();
        }
	}
	
}
