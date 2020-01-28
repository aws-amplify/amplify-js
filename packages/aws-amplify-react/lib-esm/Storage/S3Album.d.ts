import { Component } from 'react';
export interface IS3AlbumProps {
	contentType?: any;
	fileToKey?: any;
	filter?: any;
	identityId: any;
	level?: any;
	onClickItem?: any;
	onError?: any;
	onLoad?: any;
	onPick?: any;
	onSelect?: any;
	track?: any;
	path: any;
	picker: any;
	pickerTitle?: string;
	select?: any;
	sort?: any;
	theme?: any;
	translateItem?: any;
	ts?: any;
}
export interface IS3AlbumState {
	items: any;
	theme?: any;
	ts: any;
}
export default class S3Album extends Component<IS3AlbumProps, IS3AlbumState> {
	_isMounted: boolean;
	constructor(props: any);
	getKey(file: any): string;
	handlePick(data: any): void;
	handleClick(item: any): void;
	componentDidMount(): void;
	componentWillUnmount(): void;
	componentDidUpdate(prevProps: any, prevState: any): void;
	list(): Promise<void | any[]>;
	contentType(item: any): string;
	marshal(list: any): void;
	filter(list: any): any;
	sort(list: any): any;
	render(): JSX.Element;
}
