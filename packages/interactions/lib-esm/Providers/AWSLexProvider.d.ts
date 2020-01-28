import { AbstractInteractionsProvider } from './InteractionsProvider';
import { InteractionsOptions, InteractionsMessage } from '../types';
export declare class AWSLexProvider extends AbstractInteractionsProvider {
	private aws_lex;
	private _botsCompleteCallback;
	constructor(options?: InteractionsOptions);
	getProviderName(): string;
	responseCallback(err: any, data: any, res: any, rej: any, botname: any): void;
	sendMessage(
		botname: string,
		message: string | InteractionsMessage
	): Promise<object>;
	onComplete(botname: string, callback: any): void;
}
