import * as React from 'react';
import {
	FormSection,
	SectionHeader,
	SectionBody,
	SectionFooter,
} from '../AmplifyUI';
import { Input, Button } from '../AmplifyTheme';

import { I18n } from '@aws-amplify/core';
import { Interactions } from '@aws-amplify/interactions';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { chatBot } from '../Amplify-UI/data-test-attributes';
const logger = new Logger('ChatBot');

// @ts-ignore
const styles: { [pname: string]: React.CSSProperties } = {
	itemMe: {
		padding: 10,
		fontSize: 12,
		color: 'gray',
		marginTop: 4,
		textAlign: 'right',
	},
	itemBot: {
		fontSize: 12,
		textAlign: 'left',
	},
	list: {
		height: '300px',
		overflow: 'auto',
	},
	textInput: Object.assign({}, Input, {
		display: 'inline-block',
		width: 'calc(100% - 90px - 15px)',
	}),
	// @ts-ignore
	button: Object.assign({}, Button, {
		width: '60px',
		float: 'right',
	}),
	// @ts-ignore
	mic: Object.assign({}, Button, {
		width: '40px',
		float: 'right',
	}),
};

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

let audioControl;

export interface IChatBotProps {
	botName?: string;
	clearOnComplete?: boolean;
	conversationModeOn?: boolean;
	onComplete: any;
	textEnabled?: boolean;
	theme?: any;
	title?: string;
	voiceConfig?: any;
	voiceEnabled?: boolean;
	welcomeMessage?: string;
}

export interface IChatBotDialog {
	message: string;
	from: string;
}

export interface IChatBotState {
	audioInput?: any;
	continueConversation: boolean;
	currentVoiceState: any;
	dialog: IChatBotDialog[];
	inputDisabled: boolean;
	inputText: string;
	lexResponse?: any;
	micButtonDisabled: boolean;
	micText: string;
}

export class ChatBot extends React.Component<IChatBotProps, IChatBotState> {
	private listItemsRef: any;

	constructor(props) {
		super(props);
		if (this.props.voiceEnabled) {
			require('./aws-lex-audio');
			// @ts-ignore
			audioControl = new global.LexAudio.audioControl();
		}
		if (!this.props.textEnabled && this.props.voiceEnabled) {
			STATES.INITIAL.MESSAGE = 'Click the mic button';
			styles.textInput = Object.assign({}, Input, {
				display: 'inline-block',
				width: 'calc(100% - 40px - 15px)',
			});
		}
		if (this.props.textEnabled && !this.props.voiceEnabled) {
			STATES.INITIAL.MESSAGE = 'Type a message';
			styles.textInput = Object.assign({}, Input, {
				display: 'inline-block',
				width: 'calc(100% - 60px - 15px)',
			});
		}
		if (!this.props.voiceConfig.silenceDetectionConfig) {
			throw new Error('voiceConfig prop is missing silenceDetectionConfig');
		}

		this.state = {
			dialog: [
				{
					message: this.props.welcomeMessage || 'Welcome to Lex',
					from: 'system',
				},
			],
			inputText: '',
			currentVoiceState: STATES.INITIAL,
			inputDisabled: false,
			micText: STATES.INITIAL.ICON,
			continueConversation: false,
			micButtonDisabled: false,
		};
		this.micButtonHandler = this.micButtonHandler.bind(this);
		this.changeInputText = this.changeInputText.bind(this);
		this.listItems = this.listItems.bind(this);
		this.submit = this.submit.bind(this);
		// @ts-ignore
		this.listItemsRef = React.createRef();
		this.onSilenceHandler = this.onSilenceHandler.bind(this);
		this.doneSpeakingHandler = this.doneSpeakingHandler.bind(this);
		this.lexResponseHandler = this.lexResponseHandler.bind(this);
	}

	async micButtonHandler() {
		if (this.state.continueConversation) {
			this.reset();
		} else {
			this.setState(
				{
					inputDisabled: true,
					continueConversation: true,
					currentVoiceState: STATES.LISTENING,
					micText: STATES.LISTENING.ICON,
					micButtonDisabled: false,
				},
				() => {
					audioControl.startRecording(
						this.onSilenceHandler,
						null,
						this.props.voiceConfig.silenceDetectionConfig
					);
				}
			);
		}
	}

	onSilenceHandler() {
		audioControl.stopRecording();
		if (!this.state.continueConversation) {
			return;
		}
		audioControl.exportWAV((blob) => {
			this.setState(
				{
					currentVoiceState: STATES.SENDING,
					audioInput: blob,
					micText: STATES.SENDING.ICON,
					micButtonDisabled: true,
				},
				() => {
					this.lexResponseHandler();
				}
			);
		});
	}

	async lexResponseHandler() {
		if (!Interactions || typeof Interactions.send !== 'function') {
			throw new Error(
				'No Interactions module found, please ensure @aws-amplify/interactions is imported'
			);
		}
		if (!this.state.continueConversation) {
			return;
		}

		const interactionsMessage = {
			content: this.state.audioInput,
			options: {
				messageType: 'voice',
			},
		};
		const response = await Interactions.send(
			this.props.botName,
			interactionsMessage
		);
		this.setState(
			{
				lexResponse: response,
				currentVoiceState: STATES.SPEAKING,
				micText: STATES.SPEAKING.ICON,
				micButtonDisabled: true,
				dialog: [
					...this.state.dialog,
					// @ts-ignore
					{ message: response.inputTranscript, from: 'me' },
					// @ts-ignore
					response && { from: 'bot', message: response.message },
				],
				inputText: '',
			},
			() => {
				this.doneSpeakingHandler();
			}
		);
		this.listItemsRef.current.scrollTop =
			this.listItemsRef.current.scrollHeight;
	}

	doneSpeakingHandler() {
		if (!this.state.continueConversation) {
			return;
		}
		if (this.state.lexResponse.contentType === 'audio/mpeg') {
			audioControl.play(this.state.lexResponse.audioStream, () => {
				if (
					this.state.lexResponse.dialogState === 'ReadyForFulfillment' ||
					this.state.lexResponse.dialogState === 'Fulfilled' ||
					this.state.lexResponse.dialogState === 'Failed' ||
					!this.props.conversationModeOn
				) {
					this.setState({
						inputDisabled: false,
						currentVoiceState: STATES.INITIAL,
						micText: STATES.INITIAL.ICON,
						micButtonDisabled: false,
						continueConversation: false,
					});
				} else {
					this.setState(
						{
							currentVoiceState: STATES.LISTENING,
							micText: STATES.LISTENING.ICON,
							micButtonDisabled: false,
						},
						() => {
							audioControl.startRecording(
								this.onSilenceHandler,
								null,
								this.props.voiceConfig.silenceDetectionConfig
							);
						}
					);
				}
			});
		} else {
			this.setState({
				inputDisabled: false,
				currentVoiceState: STATES.INITIAL,
				micText: STATES.INITIAL.ICON,
				micButtonDisabled: false,
				continueConversation: false,
			});
		}
	}

	reset() {
		this.setState(
			{
				inputText: '',
				currentVoiceState: STATES.INITIAL,
				inputDisabled: false,
				micText: STATES.INITIAL.ICON,
				continueConversation: false,
				micButtonDisabled: false,
			},
			() => {
				audioControl.clear();
			}
		);
	}

	listItems() {
		return this.state.dialog.map((m, i) => {
			if (m.from === 'me') {
				return (
					<div
						key={i}
						style={styles.itemMe}
						data-test={`${chatBot.dialog}-${i}`}
					>
						{m.message}
					</div>
				);
			} else if (m.from === 'system') {
				return (
					<div
						key={i}
						style={styles.itemBot}
						data-test={`${chatBot.dialog}-${i}`}
					>
						{m.message}
					</div>
				);
			} else {
				return (
					<div
						key={i}
						style={styles.itemBot}
						data-test={`${chatBot.dialog}-${i}`}
					>
						{m.message}
					</div>
				);
			}
		});
	}

	async submit(e) {
		e.preventDefault();

		if (!this.state.inputText) {
			return;
		}

		await new Promise((resolve) =>
			this.setState(
				{
					dialog: [
						...this.state.dialog,
						{ message: this.state.inputText, from: 'me' },
					],
				},
				resolve
			)
		);

		if (!Interactions || typeof Interactions.send !== 'function') {
			throw new Error(
				'No Interactions module found, please ensure @aws-amplify/interactions is imported'
			);
		}

		const response = await Interactions.send(
			this.props.botName,
			this.state.inputText
		);

		this.setState({
			// @ts-ignore
			dialog: [
				...this.state.dialog,
				// @ts-ignore
				response && { from: 'bot', message: response.message },
			],
			inputText: '',
		});
		this.listItemsRef.current.scrollTop =
			this.listItemsRef.current.scrollHeight;
	}

	async changeInputText(event) {
		await this.setState({ inputText: event.target.value });
	}

	getOnComplete(fn) {
		return (...args) => {
			const { clearOnComplete } = this.props;
			const message = fn(...args);

			this.setState(
				{
					dialog: [
						...(clearOnComplete ? [] : this.state.dialog),
						message && { from: 'bot', message },
					].filter(Boolean),
				},
				() => {
					this.listItemsRef.current.scrollTop =
						this.listItemsRef.current.scrollHeight;
				}
			);
		};
	}

	componentDidMount() {
		const { onComplete, botName } = this.props;

		if (onComplete && botName) {
			if (!Interactions || typeof Interactions.onComplete !== 'function') {
				throw new Error(
					'No Interactions module found, please ensure @aws-amplify/interactions is imported'
				);
			}
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
	}

	componentDidUpdate(prevProps) {
		const { onComplete, botName } = this.props;

		if (botName && this.props.onComplete !== prevProps.onComplete) {
			if (!Interactions || typeof Interactions.onComplete !== 'function') {
				throw new Error(
					'No Interactions module found, please ensure @aws-amplify/interactions is imported'
				);
			}
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
	}

	render() {
		const { title, theme, onComplete } = this.props;

		return (
			<FormSection theme={theme}>
				{title && (
					<SectionHeader theme={theme} data-test={chatBot.title}>
						{I18n.get(title)}
					</SectionHeader>
				)}
				<SectionBody theme={theme}>
					<div ref={this.listItemsRef} style={styles.list}>
						{this.listItems()}
					</div>
				</SectionBody>
				<SectionFooter theme={theme}>
					<ChatBotInputs
						micText={this.state.micText}
						voiceEnabled={this.props.voiceEnabled}
						textEnabled={this.props.textEnabled}
						styles={styles}
						onChange={this.changeInputText}
						inputText={this.state.inputText}
						onSubmit={this.submit}
						inputDisabled={this.state.inputDisabled}
						micButtonDisabled={this.state.micButtonDisabled}
						handleMicButton={this.micButtonHandler}
						currentVoiceState={this.state.currentVoiceState}
					/>
				</SectionFooter>
			</FormSection>
		);
	}
}

function ChatBotTextInput(props) {
	const styles = props.styles;
	const onChange = props.onChange;
	const inputText = props.inputText;
	const inputDisabled = props.inputDisabled;
	const currentVoiceState = props.currentVoiceState;

	return (
		<input
			style={styles.textInput}
			type="text"
			placeholder={I18n.get(currentVoiceState.MESSAGE)}
			onChange={onChange}
			value={inputText}
			disabled={inputDisabled}
			data-test={chatBot.messageInput}
		/>
	);
}

function ChatBotMicButton(props) {
	const voiceEnabled = props.voiceEnabled;
	const styles = props.styles;
	const micButtonDisabled = props.micButtonDisabled;
	const handleMicButton = props.handleMicButton;
	const micText = props.micText;

	if (!voiceEnabled) {
		return null;
	}

	return (
		<button
			style={styles.mic}
			disabled={micButtonDisabled}
			onClick={handleMicButton}
		>
			{micText}
		</button>
	);
}

function ChatBotTextButton(props) {
	const textEnabled = props.textEnabled;
	const styles = props.styles;
	const inputDisabled = props.inputDisabled;

	if (!textEnabled) {
		return null;
	}

	return (
		<button
			type="submit"
			style={styles.button}
			disabled={inputDisabled}
			data-test={chatBot.sendMessageButton}
		>
			{I18n.get('Send')}
		</button>
	);
}

function ChatBotInputs(props) {
	const voiceEnabled = props.voiceEnabled;
	const textEnabled = props.textEnabled;
	const styles = props.styles;
	const onChange = props.onChange;
	let inputDisabled = props.inputDisabled;
	const micButtonDisabled = props.micButtonDisabled;
	const inputText = props.inputText;
	const onSubmit = props.onSubmit;
	const handleMicButton = props.handleMicButton;
	const micText = props.micText;
	const currentVoiceState = props.currentVoiceState;

	if (voiceEnabled && !textEnabled) {
		inputDisabled = true;
	}

	if (!voiceEnabled && !textEnabled) {
		return (
			<div>
				No Chatbot inputs enabled. Set at least one of voiceEnabled or
				textEnabled in the props.{' '}
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit}>
			<ChatBotTextInput
				onSubmit={onSubmit}
				styles={styles}
				type="text"
				currentVoiceState={currentVoiceState}
				onChange={onChange}
				inputText={inputText}
				inputDisabled={inputDisabled}
			/>
			<ChatBotTextButton
				onSubmit={onSubmit}
				type="submit"
				styles={styles}
				inputDisabled={inputDisabled}
				textEnabled={textEnabled}
			/>
			<ChatBotMicButton
				styles={styles}
				micButtonDisabled={micButtonDisabled}
				handleMicButton={handleMicButton}
				micText={micText}
				voiceEnabled={voiceEnabled}
			/>
		</form>
	);
}

// @ts-ignore
ChatBot.defaultProps = {
	title: '',
	botName: '',
	onComplete: undefined,
	clearOnComplete: false,
	voiceConfig: defaultVoiceConfig,
	conversationModeOn: false,
	voiceEnabled: false,
	textEnabled: true,
};

/**
 * @deprecated use named import
 */
export default ChatBot;
