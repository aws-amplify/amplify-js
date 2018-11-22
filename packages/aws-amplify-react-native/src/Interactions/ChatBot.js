import React, { Component } from "react";
import { View, TextInput, Text, KeyboardAvoidingView, ScrollView } from "react-native";
import Interactions from '@aws-amplify/interactions';
import { I18n } from "aws-amplify";
import { AmplifyButton } from "../AmplifyUI";

import Voice from 'react-native-voice';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

var Buffer = require('buffer/').Buffer

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
        backgroundColor: "#ffc266"
    }
};

const STATES = {
    INITIAL: 'INITIAL',
    LISTENING: 'LISTENING',
    SENDING: 'SENDING',
    SPEAKING: 'SPEAKING'
};

const MIC_BUTTON_TEXT = {
    PASSIVE: '🎤',
    RECORDING: '🔴'
}

let timer = null;

export class ChatBot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialog: [{
                message: this.props.welcomeMessage || 'Welcome to Lex',
                from: 'system'
            }],
            inputText: '',
            inputEditable: true,
            silenceDelay: this.props.silenceDelay || 1000,
            micText: MIC_BUTTON_TEXT.PASSIVE,
            voice: false,
            conversationOngoing: false,
            conversations: this.props.conversations || false
        };
        this.listItems = this.listItems.bind(this);
        this.submit = this.submit.bind(this);
        this.listItemsRef = React.createRef();
        this.reset = this.reset.bind(this);

        this.startRecognizing = this.startRecognizing.bind(this);
        this.handleMicButton = this.handleMicButton.bind(this);

        Voice.onSpeechStart = this.onSpeechStart.bind(this);
        Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
        Voice.onSpeechError = this.onSpeechError.bind(this);
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
    }

    listItems() {
        const { styles: overrideStyles } = this.props;

        return this.state.dialog.map((m, i) => {
            if (m.from === 'me') { return <Text key={i} style={[styles.itemMe, overrideStyles.itemMe]}>{m.message}</Text> }
            else if (m.from === 'system') { return <Text key={i} style={[styles.itemBot, overrideStyles.itemBot]}>{m.message}</Text> }
            else { return <Text key={i} style={[styles.itemBot, overrideStyles.itemBot]}>{m.message}</Text> }
        });
    };

    async submit() {
        if (!this.state.inputText) {
            return;
        }

        await new Promise(resolve => this.setState({
            dialog: [
                ...this.state.dialog,
                { message: this.state.inputText, from: 'me' },
            ]
        }, resolve));

        const response = await Interactions.send(this.props.botName, this.state.inputText);

        this.setState({
            dialog: [
                ...this.state.dialog,
                response && response.message && { from: 'bot', message: response.message }
            ].filter(Boolean),
            inputText: '',
            inputEditable: true,
            micText: MIC_BUTTON_TEXT.PASSIVE,
        }, () => {
            setTimeout(() => {
                this.listItemsRef.current.scrollToEnd();
            }, 50);
        });        

        if (this.state.voice === true) {
            this.setState({
                voice: false
            }) 

            const path = `${RNFS.DocumentDirectoryPath}/test.mp3`;
            const data = Buffer.from(response.audioStream).toString('base64');
            await RNFS.writeFile(path, data, 'base64');
            const speech = new Sound(path, '', async(err) => {
              if (!err) {
                speech.play(async () => { 
                    speech.release();
                    if (response.dialogState === 'ReadyForFulfillment' ||
                        response.dialogState === 'Fulfilled' ||
                        response.dialogState === 'Failed') {
                            //back to "initial"
                    } else {
                        if (this.state.conversations === true) {
                            await this.startRecognizing();
                        }
                    }

                });
              } else {
                console.log('Play sound error', err);
              }
            });
        }
    }

    getOnComplete(fn) {
        return (...args) => {
            const { clearOnComplete } = this.props;
            const message = fn(...args);

            this.setState({
                dialog: [
                    ...(!clearOnComplete && this.state.dialog),
                    message && { from: 'bot', message }
                ].filter(Boolean),
            }, () => {
                setTimeout(() => {
                    this.listItemsRef.current.scrollToEnd();
                }, 50);
            });
        }
    }

    componentDidMount() {
        const { onComplete, botName } = this.props;

        if (onComplete && botName) {
            Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
        }
    }

    componentDidUpdate(prevProps) {
        const { onComplete, botName } = this.props;

        if ((botName !== prevProps.botName) || (onComplete !== prevProps.onComplete)) {
            Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
        }
    }

    onSpeechStart(e) {
        this.setState({
          currentConversationState: STATES.LISTENING
        });
    };

    async onSpeechEnd(e) {
        timer = null;
        this.setState({
            inputDisabled: true
        });

        this.setState({
            currentConversationState: STATES.SENDING
        });
        await this.submit(true);

    };

    onSpeechError(e) {
        console.log('onSpeechError: ', e);
        this.setState({
            error: JSON.stringify(e.error),
        });
    };

    onSpeechResults(e) {
        this.setState({
            inputText: e.value.join(" ")
        });
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout( async () => {
            await Voice.stop();
        }, this.state.silenceDelay)

        this.setState({timer});
    };

    async startRecognizing() {
        this.setState({
            inputText: 'Speak into the mic...',
            inputEditable: false,
            micText: MIC_BUTTON_TEXT.RECORDING,
            voice: true,
        });

        if (this.state.conversations === true) {
            this.setState({
                conversationOngoing: true,
            })
        }

        try {
            await Voice.start('en-US');
        } catch (e) {
            console.error(e);
        }
        
    };

    async handleMicButton() {
        if (this.state.conversationOngoing === true) {
            await this.reset();
        } else {
            await this.startRecognizing();
        }
    }

    async reset() {
        this.setState({
            inputText: '',
            inputEditable: true,
            silenceDelay: this.props.silenceDelay || 1000,
            micText: MIC_BUTTON_TEXT.PASSIVE,
            voice: false,
            conversationOngoing: false,
        })
        await Voice.stop()

    }

    render() {
        const { styles: overrideStyles } = this.props;

        return (
            <KeyboardAvoidingView style={[styles.container, overrideStyles.container]} behavior="padding" enabled>
                <ScrollView
                    ref={this.listItemsRef}
                    style={[styles.list, overrideStyles.list]}
                    contentContainerStyle={{ flexGrow: 1 }}>
                    {this.listItems()}
                </ScrollView>
                <View style={[styles.inputContainer, overrideStyles.inputContainer]}>
                    <TextInput
                        style={[styles.textInput, overrideStyles.textInput]}
                        placeholder={I18n.get("Type your message here")}
                        onChangeText={inputText => this.setState({ inputText })}
                        value={this.state.inputText}
                        returnKeyType="send"
                        onSubmitEditing={this.submit}
                        blurOnSubmit={false}
                        editable={this.state.inputEditable}
                        selectTextOnFocus={this.state.inputDisabled}
                    >
                    </TextInput>
                    <AmplifyButton
                        onPress={this.handleMicButton}
                        style={[styles.buttonMic, overrideStyles.buttonMic]}
                        text={this.state.micText} />
                    <AmplifyButton
                        onPress={this.submit}
                        type="submit"
                        style={[styles.button, overrideStyles.button]}
                        text={I18n.get("Send")} />
                </View>
            </KeyboardAvoidingView>
        );
    }
}
ChatBot.defaultProps = {
    botName: undefined,
    onComplete: undefined,
    clearOnComplete: false,
    styles: {},
};

export default ChatBot;
