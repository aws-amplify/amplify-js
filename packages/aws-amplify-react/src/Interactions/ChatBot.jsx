import React, { Component } from "react";
import { Container, FormSection, SectionHeader, SectionBody, SectionFooter } from "../AmplifyUI";
import { Input, Button } from "../AmplifyTheme";

import { I18n } from '@aws-amplify/core';
import Interactions from '@aws-amplify/interactions';
import regeneratorRuntime from 'regenerator-runtime/runtime';

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
        width: '90px',
        float: 'right',
    })
};

export class ChatBot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialog: [{
                message: this.props.welcomeMessage || 'Welcome to Lex',
                from: 'system'
            }],
            inputText: ''
        };
        this.changeInputText = this.changeInputText.bind(this);
        this.listItems = this.listItems.bind(this);
        this.submit = this.submit.bind(this);

        this.listItemsRef = React.createRef();
    }

    listItems() {
        return this.state.dialog.map((m, i) => {
            if (m.from === 'me') { return <div key={i} style={styles.itemMe}>{m.message}</div> }
            else if (m.from === 'system') { return <div key={i} style={styles.itemBot}>{m.message}</div> }
            else { return <div key={i} style={styles.itemBot}>{m.message}</div> }
        });
    };

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
        }
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
                            placeholder={I18n.get("Type your message here")}
                            onChange={this.changeInputText}
                            value={this.state.inputText}>
                        </input>
                        <button type="submit" style={styles.button} >{I18n.get('Send')}</button>
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
