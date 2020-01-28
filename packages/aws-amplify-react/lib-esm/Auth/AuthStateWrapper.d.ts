import * as React from 'react';
export interface IAuthStateWrapperProps {
	amplifyConfig?: any;
	authState?: string;
	onStateChange?: any;
	theme?: any;
}
export interface IAuthStateWrapperState {
	authData?: any;
	authState: string;
	error?: any;
}
export default class AuthStateWrapper extends React.Component<
	IAuthStateWrapperProps,
	IAuthStateWrapperState
> {
	constructor(props: any);
	componentWillMount(): void;
	componentDidMount(): void;
	handleStateChange(state: any, data: any): void;
	handleAuthEvent(state: any, event: any): void;
	checkUser(): any;
	render(): JSX.Element;
}
