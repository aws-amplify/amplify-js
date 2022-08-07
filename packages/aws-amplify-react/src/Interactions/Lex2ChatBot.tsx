/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { chatBotLex2 } from '../Amplify-UI/data-test-attributes';
const logger = new Logger('ChatBot');

// @ts-ignore
const styles: { [pname: string]: React.CSSProperties } = {
	itemMe: {
		padding: 10,
		fontSize: 12,
		color: 'gray',
		marginTop: 4,
		textAlign: 'right',
		margin: 10,
	},
	itemBot: {
		fontSize: 12,
		textAlign: 'left',
		margin: 10,
	},
	list: {
		height: '300px',
		overflow: 'auto',
	},
	// @ts-ignore
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

// @ts-ignore
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
	initialMessage?: string;
}

export interface IChatBotDialog {
	message: object | string;
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
interface Lex2MessageRenderProps {
	message: any;
	enabled: boolean;
	sendMessage: (message: string) => void;
}

const Lex2MessageRender = ({
	message,
}: Lex2MessageRenderProps): React.ReactElement => {
	switch (message.contentType) {
		case 'CustomPayload':
			return <div>CustomPayload</div>;
		case 'ImageResponseCard':
			return <div>ImageResponseCard</div>;
		case 'PlainText':
			return <div>PlainText: {message.content}</div>;
		case 'SSML':
			return <div>SSML</div>;
	}
	return <div>UnknownMessageContentType</div>;
};

export class Lex2ChatBot extends React.Component<IChatBotProps, IChatBotState> {
	private listItemsRef: any;

	// @ts-ignore
	constructor(props) {
		super(props);
		if (this.props.voiceEnabled) {
			require('./aws-lex-audio');
			// @ts-ignore
			audioControl = new global.LexAudio.audioControl();
		}
		if (!this.props.textEnabled && this.props.voiceEnabled) {
			STATES.INITIAL.MESSAGE = 'Click the mic button';
			// @ts-ignore
			styles.textInput = Object.assign({}, Input, {
				display: 'inline-block',
				width: 'calc(100% - 40px - 15px)',
			});
		}
		if (this.props.textEnabled && !this.props.voiceEnabled) {
			STATES.INITIAL.MESSAGE = 'Type a message';
			// @ts-ignore
			styles.textInput = Object.assign({}, Input, {
				display: 'inline-block',
				width: 'calc(100% - 60px - 15px)',
			});
		}
		if (!this.props.voiceConfig.silenceDetectionConfig) {
			throw new Error('voiceConfig prop is missing silenceDetectionConfig');
		}

		this.state = {
			dialog: this.props.welcomeMessage
				? [
						{
							message: this.props.welcomeMessage,
							from: 'system',
						},
				  ]
				: [],
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
		this.sendMessage = this.sendMessage.bind(this);
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
					// @ts-ignore
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
		// @ts-ignore
		audioControl.stopRecording();
		if (!this.state.continueConversation) {
			return;
		}
		// @ts-ignore
		audioControl.exportWAV(blob => {
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
			// @ts-ignore
			this.props.botName,
			interactionsMessage
		);
		const decodedMessages = response.messages
			? unGzipBase64AsJson<any[]>(response.messages)
			: [];
		const decodedTranscript = response.inputTranscript
			? unGzipBase64AsJson<string>(response.inputTranscript)
			: 'Voice Message';
		const messages = decodedMessages?.map(i => ({
			from: 'bot',
			message: i,
		}));
		this.setState(
			{
				lexResponse: response,
				currentVoiceState: STATES.SPEAKING,
				micText: STATES.SPEAKING.ICON,
				micButtonDisabled: true,
				dialog: [
					...this.state.dialog,
					{ message: decodedTranscript, from: 'me' },
					...messages,
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
			// @ts-ignore
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
							// @ts-ignore
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
				// @ts-ignore
				audioControl.clear();
			}
		);
	}

	listItems() {
		const lastIndex = this.state.dialog.length - 1;
		return this.state.dialog.map((m, i) => {
			if (m.from === 'me') {
				return (
					<div
						key={i}
						style={styles.itemMe}
						data-test={`${chatBotLex2.dialog}-${i}`}
					>
						{typeof m.message === 'string' ? (
							<div>{m.message}</div>
						) : (
							<Lex2MessageRender
								message={m.message}
								enabled={i === lastIndex}
								sendMessage={this.sendMessage}
							/>
						)}
					</div>
				);
			} else if (m.from === 'system') {
				return (
					<div
						key={i}
						style={styles.itemBot}
						data-test={`${chatBotLex2.dialog}-${i}`}
					>
						{typeof m.message === 'string' ? (
							<div>{m.message}</div>
						) : (
							<Lex2MessageRender
								message={m.message}
								enabled={i === lastIndex}
								sendMessage={this.sendMessage}
							/>
						)}
					</div>
				);
			} else {
				return (
					<div
						key={i}
						style={styles.itemBot}
						data-test={`${chatBotLex2.dialog}-${i}`}
					>
						{typeof m.message === 'string' ? (
							<div>{m.message}</div>
						) : (
							<Lex2MessageRender
								message={m.message}
								enabled={i === lastIndex}
								sendMessage={this.sendMessage}
							/>
						)}
					</div>
				);
			}
		});
	}

	async sendMessage(text: string) {
		const response = await Interactions.send(
			// @ts-ignore
			this.props.botName,
			text
		);
		const messages = response?.messages?.map(i => ({
			from: 'bot',
			message: i,
		}));
		this.setState({
			// @ts-ignore
			dialog: [
				...this.state.dialog,
				// @ts-ignore
				...messages,
			],
			inputText: '',
		});
		this.listItemsRef.current.scrollTop =
			this.listItemsRef.current.scrollHeight;
	}

	// @ts-ignore
	async submit(e) {
		e?.preventDefault();

		if (!this.state.inputText) {
			return;
		}

		await new Promise(resolve =>
			this.setState(
				{
					dialog: [
						...this.state.dialog,
						{ message: this.state.inputText, from: 'me' },
					],
				},
				// @ts-ignore
				resolve
			)
		);

		if (!Interactions || typeof Interactions.send !== 'function') {
			throw new Error(
				'No Interactions module found, please ensure @aws-amplify/interactions is imported'
			);
		}

		this.sendMessage(this.state.inputText);
	}

	// @ts-ignore
	async changeInputText(event) {
		await this.setState({ inputText: event.target.value });
	}
	// @ts-ignore
	getOnComplete(fn) {
		// @ts-ignore
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
		const { onComplete, botName, initialMessage } = this.props;

		if (onComplete && botName) {
			if (!Interactions || typeof Interactions.onComplete !== 'function') {
				throw new Error(
					'No Interactions module found, please ensure @aws-amplify/interactions is imported'
				);
			}
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
		if (initialMessage) this.sendMessage(initialMessage);
	}

	// @ts-ignore
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
		const { title, theme } = this.props;

		return (
			<FormSection theme={theme}>
				{title && (
					<SectionHeader theme={theme} data-test={chatBotLex2.title}>
						<div>{I18n.get(title)}</div>
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

// @ts-ignore
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
			data-test={chatBotLex2.messageInput}
		/>
	);
}

// @ts-ignore
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

// @ts-ignore
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
			data-test={chatBotLex2.sendMessageButton}
		>
			{I18n.get('Send')}
		</button>
	);
}

// @ts-ignore
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
Lex2ChatBot.defaultProps = {
	title: '',
	botName: '',
	onComplete: undefined,
	clearOnComplete: false,
	voiceConfig: defaultVoiceConfig,
	conversationModeOn: false,
	voiceEnabled: false,
	textEnabled: true,
};

export default Lex2ChatBot;
