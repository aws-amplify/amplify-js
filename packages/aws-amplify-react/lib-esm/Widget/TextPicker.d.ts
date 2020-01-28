import { Component } from 'react';
export interface ITextPickerProps {
	onLoad?: (dataUrl: any) => void;
	onPick?: (data: any) => void;
	preview?: 'hidden';
	previewText?: string;
	theme?: any;
	title?: string;
}
export interface ITextPickerState {
	previewText: string;
}
export default class TextPicker extends Component<
	ITextPickerProps,
	ITextPickerState
> {
	constructor(props: any);
	handlePick(data: any): void;
	render(): JSX.Element;
}
