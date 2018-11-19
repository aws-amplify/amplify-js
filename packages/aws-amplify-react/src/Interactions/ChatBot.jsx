import * as React from 'react';
import { Component } from 'react';
import { Container, FormSection, SectionHeader, SectionBody, SectionFooter } from "../AmplifyUI";
import { Input, Button } from "../AmplifyTheme";

import { I18n } from '@aws-amplify/core';
import Interactions from '@aws-amplify/interactions';
import regeneratorRuntime from 'regenerator-runtime/runtime';

require('./aws-lex-audio.js')

const styles = {
    itemMe: {
        padding: 10,
        fontSize: 12,
        color: 'gray',
        marginTop: 4,
        textAlign: 'right'
    },
    itemBot: {
        fontSize: 12,
        textAlign: 'left'
    },
    list: {
        height: '300px',
        overflow: 'auto',
    },
    textInput: Object.assign({}, Input, {
        display: 'inline-block',
        width: 'calc(100% - 90px - 15px)',
    }),
    button: Object.assign({}, Button, {
        width: '60px',
        float: 'right',
    }),
    mic: Object.assign({}, Button, {
        width: '40px',
        float: 'right',
    })
};

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

const audioControl = new global.LexAudio.audioControl()

export class ChatBot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialog: [{
                message: this.props.welcomeMessage || 'Welcome to Lex',
                from: 'system'
            }],
            inputText: '',
            currentVoiceState: STATES.INITIAL,
            inputDisabled: false,
            micText: MIC_BUTTON_TEXT.PASSIVE,
            continueConversation: false,
            micButtonDisabled: false,
            voiceConfig: this.props.config || defaultVoiceConfig
        
        }
        this.handleVoiceClick = this.handleVoiceClick.bind(this)
        this.advanceConversation = this.advanceConversation.bind(this)
        this.changeInputText = this.changeInputText.bind(this);
        this.listItems = this.listItems.bind(this);
        this.submit = this.submit.bind(this);
        this.listItemsRef = React.createRef();
        this.onSilence = this.onSilence.bind(this)
        this.onError = this.onError.bind(this)
    }

    transition(newVoiceState) { 
        if (this.state.continueConversation !== true) {
            return;
        }

        this.setState({
            currentVoiceState: newVoiceState
        })

        if (this.state.currentVoiceState === STATES.INITIAL) {
            this.setState({
                micText: MIC_BUTTON_TEXT.PASSIVE,
                micButtonDisabled: false,
                continueConversation: false
            })

        } else if (this.state.currentVoiceState === STATES.LISTENING) {
            this.setState({
                micText: MIC_BUTTON_TEXT.RECORDING,
                micButtonDisabled: false,
            })

        } else if (this.state.currentVoiceState === STATES.SENDING) {
            this.advanceConversation();
            this.setState({
                micText: MIC_BUTTON_TEXT.LOADING,
                micButtonDisabled: true,
            })
        } else {
            this.setState({
                micText: MIC_BUTTON_TEXT.PLAYING,
                micButtonDisabled: true,
            })
            this.advanceConversation();
        }
    }

    onSilence() {
        audioControl.stopRecording();
        this.advanceConversation(); 
    }

    onAudioData(data) {
        // TODO: visualize audio data
    }

    async onSuccess(response) {
        await this.setState({
            dialog: [...this.state.dialog, { message: response.inputTranscript, from: 'me' }]
        }) 
        await this.setState({
            dialog: [...this.state.dialog, response && { from: 'bot', message: response.message }],
            inputText: ''
        });

        this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
    }

    onError(error) {
        console.log(error)
    }

    reset() {
        this.setState({
            inputText: '',
            currentVoiceState: STATES.INITIAL,
            inputDisabled: false,
            micText: MIC_BUTTON_TEXT.PASSIVE,
            continueConversation: false,
            micButtonDisabled: false,
        });
        audioControl.clear();
    }

    async advanceConversation() {
        audioControl.supportsAudio((supported) => {
            if (!supported) {
                onError('Audio is not supported.')
            }
        });

        if (this.state.currentVoiceState === STATES.INITIAL) {
            audioControl.startRecording(this.onSilence, this.onAudioData, this.state.voiceConfig.silenceDetectionConfig);
            this.transition(STATES.LISTENING);
        } else if (this.state.currentVoiceState === STATES.LISTENING) {
            audioControl.exportWAV((blob) => {
                this.setState({
                    audioInput: blob,
                })
            this.transition(STATES.SENDING);
            });
        } else if (this.state.currentVoiceState === STATES.SENDING) {
            if (!Interactions || typeof Interactions.send !== 'function') {
                throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
            }
    
            const response = await Interactions.send(this.props.botName, this.state.audioInput);

            this.setState({
                lexResponse: response,
            })
            this.transition(STATES.SPEAKING)
            this.onSuccess(response)
        } else { 
            if (this.state.lexResponse.contentType === 'audio/mpeg') {
                audioControl.play(this.state.lexResponse.audioStream, () => {
                    if (this.state.lexResponse.dialogState === 'ReadyForFulfillment' ||
                        this.state.lexResponse.dialogState === 'Fulfilled' ||
                        this.state.lexResponse.dialogState === 'Failed' ||
                        this.props.conversations === false) {
                            this.setState({
                                inputDisabled: false,
                                micText: MIC_BUTTON_TEXT.PASSIVE,
                            })
                        this.transition(STATES.INITIAL);
                    } else {
                        audioControl.startRecording(this.onSilence, this.onAudioData, this.state.voiceConfig.silenceDetectionConfig);
                        this.transition(STATES.LISTENING);
                    }
                });
            } else {
                this.setState({
                    inputDisabled: false
                })
                this.transition(STATES.INITIAL);
            }
            
        }
    };

    listItems() {
        return this.state.dialog.map((m, i) => {
            if (m.from === 'me') { return <div key={i} style={styles.itemMe}>{m.message}</div>; }
            else if (m.from === 'system') { return <div key={i} style={styles.itemBot}>{m.message}</div>; }
            else { return <div key={i} style={styles.itemBot}>{m.message}</div>; }
        });
    }

    async handleVoiceClick() {
        if (this.state.continueConversation === true && this.props.conversations === true) {
            this.reset();
        } else {
            await this.setState({
                inputDisabled: true,
                continueConversation: true
            })
            this.advanceConversation()
        }
    }

    async submit(e) {
        e.preventDefault();

        if (!this.state.inputText) {
            return;
        }

        await new Promise(resolve => this.setState({
            dialog: [
                ...this.state.dialog,
                { message: this.state.inputText, from: 'me' },
            ]
        }, resolve));

        if (!Interactions || typeof Interactions.send !== 'function') {
            throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
        }

        const response = await Interactions.send(this.props.botName, this.state.inputText);

        await this.setState({
            dialog: [...this.state.dialog, response && { from: 'bot', message: response.message }],
            inputText: ''
        });
        this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
    }

    async changeInputText(event) {
        await this.setState({ inputText: event.target.value });
    }

    getOnComplete(fn) {
        return  (...args) => {
            const { clearOnComplete } = this.props;
            const message = fn(...args);

            this.setState({
                dialog: [
                    ...(!clearOnComplete && this.state.dialog),
                    message && { from: 'bot', message }
                ].filter(Boolean),
            }, () => {
                this.listItemsRef.current.scrollTop = this.listItemsRef.current.scrollHeight;
            });
        };
    }

    componentDidMount() {
        const {onComplete, botName} = this.props;

        if(onComplete && botName) {
            if (!Interactions || typeof Interactions.onComplete !== 'function') {
                throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
            }
            Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
        }
    }

    componentDidUpdate(prevProps) {
        const {onComplete, botName} = this.props;

        if (botName && this.props.onComplete !== prevProps.onComplete) {
            if (!Interactions || typeof Interactions.onComplete !== 'function') {
                throw new Error('No Interactions module found, please ensure @aws-amplify/interactions is imported');
            }
            Interactions.onComplete(botName, this.getOnComplete(onComplete, this));
        }
    }

    render() {
        const { title, theme, onComplete } = this.props;

        return (
            <FormSection theme={theme}>
                {title && <SectionHeader theme={theme}>{I18n.get(title)}</SectionHeader>}
                <SectionBody theme={theme}>
                    <div ref={this.listItemsRef} style={styles.list}>{this.listItems()}</div>
                   </SectionBody>
                <SectionFooter theme={theme}>
                    <form onSubmit={this.submit}>
                        <input
                            style={styles.textInput}
                            type='text'
                            placeholder={I18n.get(this.state.currentVoiceState)}
                            onChange={this.changeInputText}
                            value={this.state.inputText}
                            disabled={this.state.inputDisabled}>
                        </input>
                        <button type="submit" style={styles.button} disabled={this.state.inputDisabled}>{I18n.get('Send')}</button>
                        <button style={styles.mic} disabled={this.state.micButtonDisabled} onClick={this.handleVoiceClick}>{this.state.micText}</button>
                    </form>
                </SectionFooter>
            </FormSection>
        );
    }
}

ChatBot.defaultProps = {
    title: '',
    botName: '',
    onComplete: undefined,
    clearOnComplete: false,
};

export default ChatBot;
