import { Component } from 'react';
export interface IPhotoPickerProps {
	headerHint?: string;
	headerText?: string;
	onLoad?: (dataUrl: any) => void;
	onPick?: (data: any) => void;
	preview?: 'hidden';
	previewSrc?: string;
	title?: string;
	theme?: any;
}
export interface IPhotoPickerState {
	previewSrc?: string;
}
export default class PhotoPicker extends Component<
	IPhotoPickerProps,
	IPhotoPickerState
> {
	constructor(props: any);
	handlePick(data: any): void;
	render(): JSX.Element;
}
