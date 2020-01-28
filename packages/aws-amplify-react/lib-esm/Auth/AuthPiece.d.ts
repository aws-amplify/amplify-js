import * as React from 'react';
import { UsernameAttributes } from './common/types';
export interface IAuthPieceProps {
	authData?: any;
	authState?: string;
	hide?: any;
	onAuthEvent?: any;
	onStateChange?: (state: string, data?: any) => void;
	track?: () => void;
	theme?: any;
	usernameAttributes?: UsernameAttributes;
}
export interface IAuthPieceState {
	username?: any;
	requestPending?: boolean;
}
export default class AuthPiece<
	Props extends IAuthPieceProps,
	State extends IAuthPieceState
> extends React.Component<Props, State> {
	_validAuthStates: string[];
	_isHidden: boolean;
	inputs: any;
	phone_number: any;
	constructor(props: any);
	componentDidMount(): void;
	getUsernameFromInput(): any;
	onPhoneNumberChanged(phone_number: any): void;
	renderUsernameField(theme: any): JSX.Element;
	getUsernameLabel(): string;
	usernameFromAuthData(): string;
	errorMessage(err: any): any;
	triggerAuthEvent(event: any): void;
	changeState(state: any, data?: any): void;
	error(err: any): void;
	handleInputChange(evt: any): void;
	render(): {};
	showComponent(_theme?: any): React.ReactNode;
}
