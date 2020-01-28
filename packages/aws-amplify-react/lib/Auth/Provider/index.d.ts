import * as React from 'react';
export { default as withGoogle, GoogleButton } from './withGoogle';
export { default as withFacebook, FacebookButton } from './withFacebook';
export { default as withAmazon, AmazonButton } from './withAmazon';
export { default as withOAuth, OAuthButton } from './withOAuth';
export { default as withAuth0, Auth0Button } from './withAuth0';
export declare function withFederated(
	Comp: any
): {
	new (props: Readonly<{}>): {
		render(): JSX.Element;
		context: any;
		setState<K extends never>(
			state:
				| {}
				| ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K>)
				| Pick<{}, K>,
			callback?: () => void
		): void;
		forceUpdate(callback?: () => void): void;
		readonly props: Readonly<{}> &
			Readonly<{
				children?: React.ReactNode;
			}>;
		state: Readonly<{}>;
		refs: {
			[key: string]: React.ReactInstance;
		};
		componentDidMount?(): void;
		shouldComponentUpdate?(
			nextProps: Readonly<{}>,
			nextState: Readonly<{}>,
			nextContext: any
		): boolean;
		componentWillUnmount?(): void;
		componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
		getSnapshotBeforeUpdate?(
			prevProps: Readonly<{}>,
			prevState: Readonly<{}>
		): any;
		componentDidUpdate?(
			prevProps: Readonly<{}>,
			prevState: Readonly<{}>,
			snapshot?: any
		): void;
		componentWillMount?(): void;
		UNSAFE_componentWillMount?(): void;
		componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
		UNSAFE_componentWillReceiveProps?(
			nextProps: Readonly<{}>,
			nextContext: any
		): void;
		componentWillUpdate?(
			nextProps: Readonly<{}>,
			nextState: Readonly<{}>,
			nextContext: any
		): void;
		UNSAFE_componentWillUpdate?(
			nextProps: Readonly<{}>,
			nextState: Readonly<{}>,
			nextContext: any
		): void;
	};
	new (props: {}, context?: any): {
		render(): JSX.Element;
		context: any;
		setState<K extends never>(
			state:
				| {}
				| ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K>)
				| Pick<{}, K>,
			callback?: () => void
		): void;
		forceUpdate(callback?: () => void): void;
		readonly props: Readonly<{}> &
			Readonly<{
				children?: React.ReactNode;
			}>;
		state: Readonly<{}>;
		refs: {
			[key: string]: React.ReactInstance;
		};
		componentDidMount?(): void;
		shouldComponentUpdate?(
			nextProps: Readonly<{}>,
			nextState: Readonly<{}>,
			nextContext: any
		): boolean;
		componentWillUnmount?(): void;
		componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
		getSnapshotBeforeUpdate?(
			prevProps: Readonly<{}>,
			prevState: Readonly<{}>
		): any;
		componentDidUpdate?(
			prevProps: Readonly<{}>,
			prevState: Readonly<{}>,
			snapshot?: any
		): void;
		componentWillMount?(): void;
		UNSAFE_componentWillMount?(): void;
		componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
		UNSAFE_componentWillReceiveProps?(
			nextProps: Readonly<{}>,
			nextContext: any
		): void;
		componentWillUpdate?(
			nextProps: Readonly<{}>,
			nextState: Readonly<{}>,
			nextContext: any
		): void;
		UNSAFE_componentWillUpdate?(
			nextProps: Readonly<{}>,
			nextState: Readonly<{}>,
			nextContext: any
		): void;
	};
	contextType?: React.Context<any>;
};
