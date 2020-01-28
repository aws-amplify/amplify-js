import { Component } from 'react';
export interface IMFATypes {
	SMS: boolean;
	TOTP: boolean;
	Optional: boolean;
}
export interface ISelectMFATypeProps {
	authData: any;
	MFATypes: IMFATypes;
	theme?: any;
}
export interface ISelectMFATypeState {
	selectMessage: string | null;
	showToast?: boolean;
	TOTPSetup: boolean;
}
export default class SelectMFAType extends Component<
	ISelectMFATypeProps,
	ISelectMFATypeState
> {
	inputs: any;
	constructor(props: any);
	handleInputChange(evt: any): void;
	verify(): void;
	selectView(theme: any): JSX.Element;
	render(): JSX.Element;
}
