import React, { Component } from 'react';
import { View, TextInput, Text, KeyboardAvoidingView, ScrollView } from 'react-native';
import Interactions from '@aws-amplify/interactions';
import { I18n } from 'aws-amplify';
import { AmplifyButton } from '../AmplifyUI';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

var Voice;
var RNFS;
var Sound;

var Buffer = require('buffer/').Buffer;

const logger = new Logger('ChatBot');

const styles = {
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#fff',
		alignItems: 'center',
		alignSelf: 'stretch',
		justifyContent: 'center',
	},
	list: {
		flex: 1,
		flexDirection: 'column',
		alignSelf: 'stretch',
		padding: 5,
	},
	itemMe: {
		textAlign: 'right',
		alignSelf: 'flex-end',
		padding: 8,
		margin: 8,
		backgroundColor: '#CCCCCC',
		borderRadius: 15,
		overflow: 'hidden',
	},
	itemBot: {
		textAlign: 'left',
		alignSelf: 'flex-start',
		padding: 8,
		margin: 8,
		color: 'white',
		backgroundColor: '#0099FF',
		borderRadius: 15,
		overflow: 'hidden',
	},
	inputContainer: {
		flexDirection: 'row',
	},
	textInput: {
		flex: 1,
	},
	buttonMic: {
		backgroundColor: '#ffc266',
	},
};

const STATES = {
	INITIAL: 'INITIAL',
	LISTENING: 'LISTENING',
	SENDING: 'SENDING',
	SPEAKING: 'SPEAKING',
};

const MIC_BUTTON_TEXT = {
	PASSIVE: '🎤',
	RECORDING: '🔴',
};

let timer = null;

interface IChatBotProps {
	botName?: string;
	clearOnComplete?: boolean;
	conversationModeOn?: boolean;
	onComplete?: Function;
	styles?: any;
	textEnabled?: boolean;
	voiceEnabled?: boolean;
	voiceLibs?: { Voice: any; Sound: any; RNFS: any };
	welcomeMessage?: string;
}

interface IChatBotState {
	conversationOngoing: boolean;
	currentConversationState?: string;
	dialog: any[];
	error?: string;
	inputText: string;
	inputEditable: boolean;
	micText: string;
	silenceDelay?: number;
	voice: boolean;
}

export class ChatBot extends Component<IChatBotProps, IChatBotState> {
	listItemsRef: React.RefObject<any>;

	constructor(props) {
		super(props);
		this.state = {
			dialog: [
				{
					message: this.props.welcomeMessage || 'Welcome to Lex',
					from: 'system',
				},
			],
			inputText: '',
			inputEditable: true,
			micText: MIC_BUTTON_TEXT.PASSIVE,
			voice: false,
			conversationOngoing: false,
		};
		this.listItems = this.listItems.bind(this);
		this.submit = this.submit.bind(this);
		this.listItemsRef = React.createRef();
		this.reset = this.reset.bind(this);

		this.startRecognizing = this.startRecognizing.bind(this);
		this.handleMicButton = this.handleMicButton.bind(this);

		if (this.props.voiceEnabled) {
			if (!this.props.voiceLibs) {
				throw new Error('Missing voiceLibs for voice interactions');
			}
			Voice = this.props.voiceLibs.Voice;
			Sound = this.props.voiceLibs.Sound;
			RNFS = this.props.voiceLibs.RNFS;

			if (
				!Voice ||
				typeof Voice.start !== 'function' ||
				typeof Voice.stop !== 'function' ||
				typeof Voice.isRecognizing !== 'function'
			) {
				throw new Error('Missing react-native-voice');
			}
			if (!Sound) {
				throw new Error('Missing react-native-sound');
			}
			if (
				!RNFS ||
				typeof RNFS.exists !== 'function' ||
				typeof RNFS.unlink !== 'function' ||
				typeof RNFS.writeFile !== 'function'
			) {
				throw new Error('Missing react-native-fs');
			}

			Voice.onSpeechStart = this.onSpeechStart.bind(this);
			Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
			Voice.onSpeechError = this.onSpeechError.bind(this);
			Voice.onSpeechResults = this.onSpeechResults.bind(this);
		}
	}

	listItems() {
		const { styles: overrideStyles } = this.props;

		return this.state.dialog.map((m, i) => {
			if (m.from === 'me') {
				return (
					<Text key={i} style={[styles.itemMe, overrideStyles.itemMe]}>
						{m.message}
					</Text>
				);
			} else if (m.from === 'system') {
				return (
					<Text key={i} style={[styles.itemBot, overrideStyles.itemBot]}>
						{m.message}
					</Text>
				);
			} else {
				return (
					<Text key={i} style={[styles.itemBot, overrideStyles.itemBot]}>
						{m.message}
					</Text>
				);
			}
		});
	}

	async submit(voiceResponse) {
		if (!this.state.inputText) {
			return;
		}

		await new Promise((resolve) =>
			this.setState(
				{
					dialog: [...this.state.dialog, { message: this.state.inputText, from: 'me' }],
				},
				resolve
			)
		);

		let response;
		if (voiceResponse === true) {
			const interactionsMessage = {
				content: this.state.inputText,
				options: {
					messageType: 'text',
				},
			};
			response = await Interactions.send(this.props.botName, interactionsMessage);
		} else {
			response = await Interactions.send(this.props.botName, this.state.inputText);
		}

		this.setState(
			{
				dialog: [
					...this.state.dialog,
					response &&
						response.message && {
							from: 'bot',
							message: response.message,
						},
				].filter(Boolean),
				inputText: '',
				inputEditable: true,
				micText: MIC_BUTTON_TEXT.PASSIVE,
			},
			() => {
				setTimeout(() => {
					this.listItemsRef.current.scrollToEnd();
				}, 50);
			}
		);

		if (this.state.voice) {
			this.setState({
				voice: false,
			});

			const path = `${RNFS.DocumentDirectoryPath}/responseAudio.mp3`;
			const data = Buffer.from(response.audioStream).toString('base64');
			await RNFS.writeFile(path, data, 'base64');
			const speech = new Sound(path, '', async (err) => {
				if (!err) {
					speech.play(async () => {
						speech.release();
						RNFS.exists(path).then((res) => {
							if (res) {
								RNFS.unlink(path);
							}
						});
						if (response.dialogState === 'ElicitSlot' && this.props.conversationModeOn) {
							await this.startRecognizing();
						}
					});
				} else {
					logger.error(err);
				}
			});
		}
	}

	getOnComplete(fn) {
		return (...args) => {
			const { clearOnComplete } = this.props;
			const message = fn(...args);

			this.setState(
				{
					dialog: [...(!clearOnComplete && this.state.dialog), message && { from: 'bot', message }].filter(Boolean),
				},
				() => {
					setTimeout(() => {
						this.listItemsRef.current.scrollToEnd();
					}, 50);
				}
			);
		};
	}

	componentDidMount() {
		const { onComplete, botName } = this.props;

		if (onComplete && botName) {
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
	}

	componentDidUpdate(prevProps) {
		const { onComplete, botName } = this.props;

		if (botName !== prevProps.botName || onComplete !== prevProps.onComplete) {
			// @ts-ignore
			Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
		}
	}

	onSpeechStart(e) {
		this.setState({
			currentConversationState: STATES.LISTENING,
		});
	}

	async onSpeechEnd(e) {
		timer = null;

		this.setState({
			currentConversationState: STATES.SENDING,
		});
		await this.submit(true);
	}

	onSpeechError(e) {
		logger.error(e);
		this.setState({
			error: JSON.stringify(e.error),
		});
	}

	onSpeechResults(e) {
		this.setState({
			inputText: e.value.join(' '),
		});
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(async () => {
			await Voice.stop();
		}, this.state.silenceDelay);
	}

	async startRecognizing() {
		this.setState({
			inputText: 'Speak into the mic...',
			inputEditable: false,
			micText: MIC_BUTTON_TEXT.RECORDING,
			voice: true,
		});

		if (this.props.conversationModeOn) {
			this.setState({
				conversationOngoing: true,
			});
		}

		try {
			await Voice.start('en-US');
		} catch (e) {
			logger.error(e);
		}
	}

	async handleMicButton() {
		if (this.state.conversationOngoing || (await Voice.isRecognizing())) {
			await this.reset();
		} else {
			await this.startRecognizing();
		}
	}

	async reset() {
		this.setState({
			inputText: '',
			inputEditable: true,
			micText: MIC_BUTTON_TEXT.PASSIVE,
			voice: false,
			conversationOngoing: false,
		});
		await Voice.stop();
	}

	render() {
		const { styles: overrideStyles } = this.props;

		return (
			<KeyboardAvoidingView style={[styles.container, overrideStyles.container]} behavior="padding" enabled>
				<ScrollView
					ref={this.listItemsRef}
					style={[styles.list, overrideStyles.list]}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					{this.listItems()}
				</ScrollView>
				<ChatBotInputs
					micText={this.state.micText}
					voiceEnabled={this.props.voiceEnabled}
					textEnabled={this.props.textEnabled}
					styles={styles}
					overrideStyles={overrideStyles}
					onChangeText={(inputText) => this.setState({ inputText })}
					inputText={this.state.inputText}
					onSubmitEditing={this.submit}
					editable={this.state.inputEditable}
					handleMicButton={this.handleMicButton}
					submit={this.submit}
				></ChatBotInputs>
			</KeyboardAvoidingView>
		);
	}
}

function ChatBotInputs(props) {
	const voiceEnabled = props.voiceEnabled;
	const textEnabled = props.textEnabled;
	const styles = props.styles;
	const overrideStyles = props.overrideStyles;
	const onChangeText = props.onChangeText;
	const inputText = props.inputText;
	const onSubmitEditing = props.onSubmitEditing;
	let editable = props.editable;
	const handleMicButton = props.handleMicButton;
	const micText = props.micText;
	const submit = props.submit;
	let placeholder;

	if (voiceEnabled && textEnabled) {
		// @ts-ignore
		placeholder = 'Type your message or tap 🎤';
	}

	if (voiceEnabled && !textEnabled) {
		// @ts-ignore
		placeholder = 'Tap the mic button';
		editable = false;
	}

	if (!voiceEnabled && textEnabled) {
		// @ts-ignore
		placeholder = 'Type your message here';
	}

	if (!voiceEnabled && !textEnabled) {
		return <Text>No Chatbot inputs enabled. Set at least one of voiceEnabled or textEnabled in the props. </Text>;
	}

	return (
		<View style={[styles.inputContainer, overrideStyles.inputContainer]}>
			<ChatBotTextInput
				styles={styles}
				overrideStyles={overrideStyles}
				// @ts-ignore
				placeholder={I18n.get(placeholder)}
				onChangeText={onChangeText}
				inputText={inputText}
				returnKeyType="send"
				onSubmitEditing={onSubmitEditing}
				blurOnSubmit={false}
				editable={editable}
			/>
			<ChatBotMicButton
				handleMicButton={handleMicButton}
				styles={styles}
				overrideStyles={overrideStyles}
				micText={micText}
				voiceEnabled={voiceEnabled}
			/>
			<ChatBotTextButton
				submit={submit}
				type="submit"
				styles={styles}
				overrideStyles={overrideStyles}
				text={I18n.get('Send')}
				textEnabled={textEnabled}
			/>
		</View>
	);
}

function ChatBotTextInput(props) {
	const styles = props.styles;
	const overrideStyles = props.overrideStyles;
	const onChangeText = props.onChangeText;
	const inputText = props.inputText;
	const onSubmitEditing = props.onSubmitEditing;
	const editable = props.editable;
	const placeholder = props.placeholder;

	return (
		<TextInput
			style={[styles.textInput, overrideStyles.textInput]}
			placeholder={I18n.get(placeholder)}
			onChangeText={onChangeText}
			value={inputText}
			returnKeyType="send"
			onSubmitEditing={onSubmitEditing}
			blurOnSubmit={false}
			editable={editable}
		></TextInput>
	);
}

function ChatBotTextButton(props) {
	const textEnabled = props.textEnabled;
	const styles = props.styles;
	const overrideStyles = props.overrideStyles;
	const submit = props.submit;

	if (!textEnabled) {
		return null;
	}

	return (
		<AmplifyButton
			onPress={submit}
			// @ts-ignore
			type="submit"
			style={[styles.button, overrideStyles.button]}
			text={I18n.get('Send')}
		/>
	);
}

function ChatBotMicButton(props) {
	const voiceEnabled = props.voiceEnabled;
	const styles = props.styles;
	const overrideStyles = props.overrideStyles;
	const handleMicButton = props.handleMicButton;
	const micText = props.micText;

	if (!voiceEnabled) {
		return null;
	}

	return (
		<AmplifyButton onPress={handleMicButton} style={[styles.buttonMic, overrideStyles.buttonMic]} text={micText} />
	);
}

// @ts-ignore
ChatBot.defaultProps = {
	botName: undefined,
	onComplete: undefined,
	clearOnComplete: false,
	styles: {},
	silenceDelay: 1000,
	conversationModeOn: false,
	voiceEnabled: false,
	textEnabled: true,
};

export default ChatBot;
