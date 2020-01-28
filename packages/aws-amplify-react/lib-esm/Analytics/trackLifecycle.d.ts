import * as React from 'react';
export declare function trackLifecycle(
	Comp: any,
	trackerName: any,
	events?: string[]
): {
	new (props: any): {
		trackerName: string;
		trackEvents: string[];
		track(event: any): void;
		componentWillMount(): void;
		componentDidMount(): void;
		componentWillUnmount(): void;
		componentDidCatch(): void;
		componentWillReceiveProps(): void;
		shouldComponentUpdate(): boolean;
		componentWillUpdate(): void;
		componentDidUpdate(): void;
		setState(): void;
		forceUpdate(): void;
		render(): JSX.Element;
		context: any;
		readonly props: Readonly<any> &
			Readonly<{
				children?: React.ReactNode;
			}>;
		state: Readonly<{}>;
		refs: {
			[key: string]: React.ReactInstance;
		};
		getSnapshotBeforeUpdate?(
			prevProps: Readonly<any>,
			prevState: Readonly<{}>
		): any;
		UNSAFE_componentWillMount?(): void;
		UNSAFE_componentWillReceiveProps?(
			nextProps: Readonly<any>,
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
