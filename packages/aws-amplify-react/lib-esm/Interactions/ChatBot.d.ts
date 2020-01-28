import { Component } from 'react';
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
export declare class ChatBot extends Component<IChatBotProps, IChatBotState> {
	private listItemsRef;
	constructor(props: any);
	micButtonHandler(): Promise<void>;
	onSilenceHandler(): void;
	lexResponseHandler(): Promise<void>;
	doneSpeakingHandler(): void;
	reset(): void;
	listItems(): JSX.Element[];
	submit(e: any): Promise<void>;
	changeInputText(event: any): Promise<void>;
	getOnComplete(fn: any): (...args: any[]) => void;
	componentDidMount(): void;
	componentDidUpdate(prevProps: any): void;
	render(): JSX.Element;
}
export default ChatBot;
