import * as React from 'react';
export declare function trackUpdate(
	Comp: any,
	trackerName: any
): {
	new (props: any): {
		trackerName: string;
		componentDidUpdate(prevProps: any, prevState: any): void;
		render(): JSX.Element;
		context: any;
		setState<K extends never>(
			state:
				| {}
				| ((prevState: Readonly<{}>, props: Readonly<any>) => {} | Pick<{}, K>)
				| Pick<{}, K>,
			callback?: () => void
		): void;
		forceUpdate(callback?: () => void): void;
		readonly props: Readonly<any> &
			Readonly<{
				children?: React.ReactNode;
			}>;
		state: Readonly<{}>;
		refs: {
			[key: string]: React.ReactInstance;
		};
		componentDidMount?(): void;
		shouldComponentUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<{}>,
			nextContext: any
		): boolean;
		componentWillUnmount?(): void;
		componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
		getSnapshotBeforeUpdate?(
			prevProps: Readonly<any>,
			prevState: Readonly<{}>
		): any;
		componentWillMount?(): void;
		UNSAFE_componentWillMount?(): void;
		componentWillReceiveProps?(
			nextProps: Readonly<any>,
			nextContext: any
		): void;
		UNSAFE_componentWillReceiveProps?(
			nextProps: Readonly<any>,
			nextContext: any
		): void;
		componentWillUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<{}>,
			nextContext: any
		): void;
		UNSAFE_componentWillUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<{}>,
			nextContext: any
		): void;
	};
	contextType?: React.Context<any>;
};
