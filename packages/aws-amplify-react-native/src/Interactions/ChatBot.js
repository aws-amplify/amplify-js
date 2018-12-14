import React, { Component } from "react";
import { View, TextInput, Text, KeyboardAvoidingView, ScrollView } from "react-native";
import { Interactions } from 'aws-amplify';
import { I18n } from "aws-amplify";
import { AmplifyButton } from "../AmplifyUI";

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
    }
};

export class ChatBot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialog: [{
                message: this.props.welcomeMessage || 'Welcome to Lex',
                from: 'system'
            }],
            inputText: '',
        };
        this.listItems = this.listItems.bind(this);
        this.submit = this.submit.bind(this);

        this.listItemsRef = React.createRef();
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
            inputText: ''
        }, () => {
            setTimeout(() => {
                this.listItemsRef.current.scrollToEnd();
            }, 50);
        });

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
                        onSubmitEditing={this.submit.bind(this)}
                        blurOnSubmit={false}
                    >
                    </TextInput>
                    <AmplifyButton
                        onPress={this.submit.bind(this)}
                        type="submit"
                        style={[styles.button, overrideStyles.button]}
                        title={I18n.get("Send")} />
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
