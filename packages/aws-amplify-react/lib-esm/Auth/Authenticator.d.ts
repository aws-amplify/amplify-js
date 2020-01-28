import * as React from 'react';
import { UsernameAttributes } from './common/types';
export declare const EmptyContainer: ({
	children,
}: {
	children: any;
}) => JSX.Element;
export interface IAuthenticatorProps {
	amplifyConfig?: any;
	authData?: any;
	authState?: string;
	container?: any;
	errorMessage?: (message: string) => string;
	federated?: any;
	hide?: any[];
	hideDefault?: boolean;
	onStateChange?: (authState: string, data?: any) => void;
	signUpConfig?: any;
	theme?: any;
	usernameAttributes?: UsernameAttributes;
}
export interface IAuthenticatorState {
	authData?: any;
	authState: string;
	error?: string;
	showToast?: boolean;
}
export default class Authenticator extends React.Component<
	IAuthenticatorProps,
	IAuthenticatorState
> {
	_initialAuthState: string;
	_isMounted: boolean;
	constructor(props: any);
	componentDidMount(): void;
	componentWillUnmount(): void;
	checkUser(): Promise<void>;
	onHubCapsule(capsule: any): void;
	handleStateChange(state: any, data?: any): void;
	handleAuthEvent(state: any, event: any, showToast?: boolean): void;
	render(): JSX.Element;
}
