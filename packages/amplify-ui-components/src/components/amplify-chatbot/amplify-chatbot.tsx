import {
	Component,
	Host,
	h,
	Prop,
	State,
	Listen,
	Event,
	EventEmitter,
	Element,
} from '@stencil/core';
import { I18n } from '@aws-amplify/core';
import { Interactions } from '@aws-amplify/interactions';
import { JSXBase } from '@stencil/core/internal';
import { AudioRecorder, visualize } from '../../common/audio-control';
import { ChatResult } from '../../common/types/interactions-types';
import { NO_INTERACTIONS_MODULE_FOUND } from '../../common/constants';
import { Translations } from '../../common/Translations';
import {
	InteractionsResponse,
	InteractionsMessage,
} from '@aws-amplify/interactions';

// enum for possible bot states
enum ChatState {
	Initial,
	Listening,
	SendingText,
	SendingVoice,
	Error,
}

// Message types
enum MessageFrom {
	Bot = 'bot',
	User = 'user',
}
interface Message {
	content: string;
	from: MessageFrom;
}

// Error types
enum ChatErrorType {
	Recoverable,
	Unrecoverable,
}
interface ChatError {
	message: string;
	errorType: ChatErrorType;
}

/**
 * @slot header - Title content placed at the top
 */
@Component({
	tag: 'amplify-chatbot',
	styleUrl: 'amplify-chatbot.scss',
	shadow: true,
})
export class AmplifyChatbot {
	/** Name of the bot */
	@Prop() botName: string;
	/** Clear messages when conversation finishes */
	@Prop() clearOnComplete: boolean = false;
	/** Continue listening to users after they send the message */
	@Prop() conversationModeOn: boolean = false;
	/** Greeting message displayed to users */
	@Prop() welcomeMessage: string;
	/** Text placed in the top header */
	@Prop() botTitle: string = Translations.CHATBOT_TITLE;
	/** Whether voice chat is enabled */
	@Prop() voiceEnabled: boolean = false;
	/** Whether text chat is enabled */
	@Prop() textEnabled: boolean = true;
	/** Amount of silence (in ms) to wait for */
	@Prop() silenceTime: number = 1500;
	/** Noise threshold between -1 and 1. Anything below is considered a silence. */
	@Prop() silenceThreshold: number = 0.2;

	/** Messages in current session */
	@State() messages: Message[] = [];
	/** Text input box value  */
	@State() text: string = '';
	/** Current app state */
	@State() chatState: ChatState = ChatState.Initial;
	/** Toast error */
	@State() error: ChatError;

	@Element() element: HTMLAmplifyChatbotElement;

	private audioRecorder: AudioRecorder;

	// Occurs when user presses enter in input box
	@Listen('formSubmit')
	submitHandler(_event: CustomEvent) {
		this.sendTextMessage();
	}

	/** Event emitted when conversation is completed */
	@Event() chatCompleted: EventEmitter<ChatResult>;

	/**
	 * Lifecycle functions
	 */
	componentWillLoad() {
		if (!Interactions || typeof Interactions.onComplete !== 'function') {
			throw new Error(NO_INTERACTIONS_MODULE_FOUND);
		}
		this.validateProps();
	}

	componentDidRender() {
		// scroll to the bottom if necessary
		const body = this.element.shadowRoot.querySelector('.body');
		body.scrollTop = body.scrollHeight;
	}

	private validateProps() {
		if (!this.voiceEnabled && !this.textEnabled) {
			this.setError(
				Translations.CHAT_DISABLED_ERROR,
				ChatErrorType.Unrecoverable
			);
			return;
		} else if (!this.botName) {
			this.setError(
				Translations.NO_BOT_NAME_ERROR,
				ChatErrorType.Unrecoverable
			);
			return;
		}

		if (this.welcomeMessage)
			this.appendToChat(this.welcomeMessage, MessageFrom.Bot);
		// Initialize AudioRecorder if voice is enabled
		if (this.voiceEnabled) {
			this.audioRecorder = new AudioRecorder({
				time: this.silenceTime,
				amplitude: this.silenceThreshold,
			});
			this.audioRecorder.init().catch(err => {
				this.setError(err, ChatErrorType.Recoverable);
			});
		}

		// Callback function to be called after chat is completed
		const onComplete = (err: string, data: object) => {
			this.chatCompleted.emit({
				data,
				err,
			});
			if (this.clearOnComplete) {
				this.reset();
			} else {
				this.chatState = ChatState.Initial;
			}
		};

		try {
			Interactions.onComplete(this.botName, onComplete);
		} catch (err) {
			this.setError(err, ChatErrorType.Unrecoverable);
		}
	}

	/**
	 * Handlers
	 */
	private handleSubmit(event) {
		event.preventDefault();
		this.sendTextMessage();
	}

	private handleMicButton() {
		if (this.chatState !== ChatState.Initial) return;
		this.audioRecorder.stop();
		this.chatState = ChatState.Listening;
		this.audioRecorder.startRecording(
			() => this.handleSilence(),
			(data, length) => this.visualizer(data, length)
		);
	}

	private handleSilence() {
		this.chatState = ChatState.SendingVoice;
		this.audioRecorder.stopRecording();
		this.audioRecorder.exportWAV().then(blob => {
			this.sendVoiceMessage(blob);
		});
	}

	private handleTextChange(event: Event) {
		const target = event.target as HTMLInputElement;
		this.text = target.value;
	}

	private handleCancelButton() {
		this.audioRecorder.clear();
		this.chatState = ChatState.Initial;
	}

	private handleToastClose(errorType: ChatErrorType) {
		this.error = undefined; // clear error
		// if error is recoverable, reset the app state to initial
		if (errorType === ChatErrorType.Recoverable) {
			this.chatState = ChatState.Initial;
		}
	}

	/**
	 * Visualization
	 */
	private visualizer(dataArray: Uint8Array, bufferLength: number) {
		const canvas = this.element.shadowRoot.querySelector('canvas');
		visualize(dataArray, bufferLength, canvas);
	}

	/**
	 * Interactions helpers
	 */
	private async sendTextMessage() {
		if (this.text.length === 0 || this.chatState !== ChatState.Initial) return;
		const text = this.text;
		this.text = '';
		this.appendToChat(text, MessageFrom.User);
		this.chatState = ChatState.SendingText;

		let response: InteractionsResponse;
		try {
			response = await Interactions.send(this.botName, text);
		} catch (err) {
			this.setError(err, ChatErrorType.Recoverable);
			return;
		}
		if (response.message) {
			this.appendToChat(response.message, MessageFrom.Bot);
		}
		this.chatState = ChatState.Initial;
	}

	private async sendVoiceMessage(audioInput: Blob) {
		const interactionsMessage: InteractionsMessage = {
			content: audioInput,
			options: {
				messageType: 'voice',
			},
		};

		let response: InteractionsResponse;
		try {
			response = await Interactions.send(this.botName, interactionsMessage);
		} catch (err) {
			this.setError(err, ChatErrorType.Recoverable);
			return;
		}

		this.chatState = ChatState.Initial;
		const dialogState = response.dialogState;
		if (response.inputTranscript)
			this.appendToChat(response.inputTranscript, MessageFrom.User);
		this.appendToChat(response.message, MessageFrom.Bot);

		await this.audioRecorder
			.play(response.audioStream)
			.then(() => {
				// if conversationMode is on, chat is incomplete, and mic button isn't pressed yet, resume listening.
				if (
					this.conversationModeOn &&
					dialogState !== 'Fulfilled' &&
					dialogState !== 'Failed' &&
					this.chatState === ChatState.Initial
				) {
					this.handleMicButton();
				}
			})
			.catch(err => this.setError(err, ChatErrorType.Recoverable));
	}

	private appendToChat(content: string, from: MessageFrom) {
		this.messages = [
			...this.messages,
			{
				content,
				from,
			},
		];
	}

	/**
	 * State control methods
	 */
	private setError(error: string | Error, errorType: ChatErrorType) {
		const message = typeof error === 'string' ? error : error.message;
		this.chatState = ChatState.Error;
		this.error = { message, errorType };
	}

	private reset() {
		this.chatState = ChatState.Initial;
		this.text = '';
		this.error = undefined;
		this.messages = [];
		if (this.welcomeMessage)
			this.appendToChat(this.welcomeMessage, MessageFrom.Bot);
		this.audioRecorder && this.audioRecorder.clear();
	}

	/**
	 * Rendering methods
	 */
	private messageJSX = (messages: Message[]) => {
		const messageList = messages.map(message => (
			<div class={`bubble ${message.from}`}>{message.content}</div>
		));
		if (
			this.chatState === ChatState.SendingText ||
			this.chatState === ChatState.SendingVoice
		) {
			// if waiting for voice message, show animation on user side because app is waiting for transcript. Else put it on bot side.
			const client =
				this.chatState === ChatState.SendingText
					? MessageFrom.Bot
					: MessageFrom.User;

			messageList.push(
				<div class={`bubble ${client}`}>
					<div class={`dot-flashing ${client}`}>
						<span class="dot left" />
						<span class="dot middle" />
						<span class="dot right" />
					</div>
				</div>
			);
		}
		return messageList;
	};

	private listeningFooterJSX(): JSXBase.IntrinsicElements[] {
		const visualization = <canvas height="50" />;
		const cancelButton = (
			<amplify-button
				data-test="chatbot-cancel-button"
				handleButtonClick={() => this.handleCancelButton()}
				class="icon-button"
				variant="icon"
				icon="ban"
			/>
		);
		return [visualization, cancelButton];
	}

	private footerJSX(): JSXBase.IntrinsicElements[] {
		if (this.chatState === ChatState.Listening)
			return this.listeningFooterJSX();

		const inputPlaceholder = this.textEnabled
			? Translations.TEXT_INPUT_PLACEHOLDER
			: Translations.VOICE_INPUT_PLACEHOLDER;
		const textInput = (
			<amplify-input
				placeholder={I18n.get(inputPlaceholder)}
				description="text"
				handleInputChange={evt => this.handleTextChange(evt)}
				value={this.text}
				disabled={this.chatState === ChatState.Error || !this.textEnabled}
			/>
		);
		const micButton = this.voiceEnabled && (
			<amplify-button
				data-test="chatbot-mic-button"
				handleButtonClick={() => this.handleMicButton()}
				class="icon-button"
				variant="icon"
				icon="microphone"
				disabled={
					this.chatState === ChatState.Error ||
					this.chatState !== ChatState.Initial
				}
			/>
		);
		const sendButton = this.textEnabled && (
			<amplify-button
				data-test="chatbot-send-button"
				class="icon-button"
				variant="icon"
				icon="send"
				handleButtonClick={() => this.sendTextMessage()}
				disabled={
					this.chatState === ChatState.Error ||
					this.chatState !== ChatState.Initial
				}
			/>
		);
		return [textInput, micButton, sendButton];
	}

	private errorToast() {
		if (!this.error) return;
		const { message, errorType } = this.error;
		return (
			<amplify-toast
				message={I18n.get(message)}
				handleClose={() => this.handleToastClose(errorType)}
			/>
		);
	}

	render() {
		return (
			<Host>
				<div class="amplify-chatbot">
					<slot name="header">
						<div class="header" data-test="chatbot-header">
							{I18n.get(this.botTitle)}
						</div>
					</slot>
					<div class="body" data-test="chatbot-body">
						{this.messageJSX(this.messages)}
					</div>
					<form onSubmit={e => this.handleSubmit(e)}>
						<div class="footer" data-test="chatbot-footer">
							{this.footerJSX()}
						</div>
					</form>
					{this.errorToast()}
				</div>
			</Host>
		);
	}
}
