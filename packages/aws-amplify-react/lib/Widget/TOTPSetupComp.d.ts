import { Component } from 'react';
export interface ITOTPSetupCompProps {
	authData?: any;
	onTOTPEvent?: (event: any, data: any, user: any) => void;
	theme?: any;
}
export interface ITOTPSetupCompState {
	code: string | null;
	setupMessage: string | null;
}
export default class TOTPSetupComp extends Component<
	ITOTPSetupCompProps,
	ITOTPSetupCompState
> {
	inputs: any;
	constructor(props: any);
	componentDidMount(): void;
	triggerTOTPEvent(event: any, data: any, user: any): void;
	handleInputChange(evt: any): void;
	setup(): void;
	verifyTotpToken(): Promise<void>;
	showSecretCode(code: any, theme: any): JSX.Element;
	render(): JSX.Element;
}
