import { Component } from 'react';
export interface IPickerProps {
	accept?: string;
	onPick?: (data: any) => void;
	title?: string;
	theme?: any;
}
export default class Picker extends Component<IPickerProps, {}> {
	handleInput(e: any): void;
	render(): JSX.Element;
}
