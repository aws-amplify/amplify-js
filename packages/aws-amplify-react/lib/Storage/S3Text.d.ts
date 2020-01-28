import { Component } from 'react';
export interface IS3TextProps {
	body?: any;
	contentType?: any;
	fileToKey?:
		| string
		| ((param: { name: string; size: number; type: string }) => string);
	hidden?: any;
	identityId?: any;
	level?: string;
	onClick?: any;
	onError?: any;
	onLoad?: any;
	path?: any;
	picker?: any;
	selected?: any;
	style?: any;
	theme?: any;
	text?: string;
	textKey?: string;
	track?: any;
	translate?:
		| string
		| ((params: { type: string; key: string; content: string }) => string);
}
export interface IS3TextState {
	text: string;
	textKey: string;
}
export default class S3Text extends Component<IS3TextProps, IS3TextState> {
	_isMounted: boolean;
	constructor(props: any);
	getText(key: any, level: any, track: any, identityId: any): void;
	load(): void;
	handleOnLoad(text: any): void;
	handleOnError(err: any): void;
	handlePick(data: any): void;
	handleClick(evt: any): void;
	componentDidMount(): void;
	componentWillUnmount(): void;
	componentDidUpdate(prevProps: any): void;
	textEl(text: any, theme: any): JSX.Element;
	render(): JSX.Element;
}
