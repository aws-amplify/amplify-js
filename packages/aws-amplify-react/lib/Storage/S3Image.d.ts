import { Component } from 'react';
export interface IS3ImageProps {
	body?: any;
	className?: string;
	contentType?: any;
	fileToKey?: any;
	hidden?: any;
	identityId?: any;
	imgKey?: any;
	level?: any;
	onClick?: any;
	onError?: any;
	onLoad?: any;
	path?: any;
	picker?: any;
	selected?: any;
	src?: any;
	style?: any;
	theme?: any;
	track?: any;
	translate?:
		| string
		| ((params: { type: string; key: string; content: string }) => string);
}
export interface IS3ImageState {
	src: any;
}
export default class S3Image extends Component<IS3ImageProps, IS3ImageState> {
	_isMounted: boolean;
	constructor(props: any);
	getImageSource(key: any, level: any, track: any, identityId: any): void;
	load(): void;
	handleOnLoad(evt: any): void;
	handleOnError(evt: any): void;
	handlePick(data: any): void;
	handleClick(evt: any): void;
	componentDidMount(): void;
	componentWillUnmount(): void;
	componentDidUpdate(prevProps: any): void;
	imageEl(src: any, theme: any): JSX.Element;
	render(): JSX.Element;
}
