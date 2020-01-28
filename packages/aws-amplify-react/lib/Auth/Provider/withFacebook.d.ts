import * as React from 'react';
export default function withFacebook(
	Comp: any
): {
	new (props: any): {
		signIn(): void;
		federatedSignIn(response: any): void;
		signOut(): Promise<void>;
		componentDidMount(): void;
		fbAsyncInit(): void;
		initFB(): void;
		createScript(): void;
		render(): JSX.Element;
		context: any;
		setState<K extends string | number | symbol>(
			state: any,
			callback?: () => void
		): void;
		forceUpdate(callback?: () => void): void;
		readonly props: Readonly<any> &
			Readonly<{
				children?: React.ReactNode;
			}>;
		state: Readonly<any>;
		refs: {
			[key: string]: React.ReactInstance;
		};
		shouldComponentUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<any>,
			nextContext: any
		): boolean;
		componentWillUnmount?(): void;
		componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
		getSnapshotBeforeUpdate?(
			prevProps: Readonly<any>,
			prevState: Readonly<any>
		): any;
		componentDidUpdate?(
			prevProps: Readonly<any>,
			prevState: Readonly<any>,
			snapshot?: any
		): void;
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
			nextState: Readonly<any>,
			nextContext: any
		): void;
		UNSAFE_componentWillUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<any>,
			nextContext: any
		): void;
	};
	contextType?: React.Context<any>;
};
export declare const FacebookButton: {
	new (props: any): {
		signIn(): void;
		federatedSignIn(response: any): void;
		signOut(): Promise<void>;
		componentDidMount(): void;
		fbAsyncInit(): void;
		initFB(): void;
		createScript(): void;
		render(): JSX.Element;
		context: any;
		setState<K extends string | number | symbol>(
			state: any,
			callback?: () => void
		): void;
		forceUpdate(callback?: () => void): void;
		readonly props: Readonly<any> &
			Readonly<{
				children?: React.ReactNode;
			}>;
		state: Readonly<any>;
		refs: {
			[key: string]: React.ReactInstance;
		};
		shouldComponentUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<any>,
			nextContext: any
		): boolean;
		componentWillUnmount?(): void;
		componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
		getSnapshotBeforeUpdate?(
			prevProps: Readonly<any>,
			prevState: Readonly<any>
		): any;
		componentDidUpdate?(
			prevProps: Readonly<any>,
			prevState: Readonly<any>,
			snapshot?: any
		): void;
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
			nextState: Readonly<any>,
			nextContext: any
		): void;
		UNSAFE_componentWillUpdate?(
			nextProps: Readonly<any>,
			nextState: Readonly<any>,
			nextContext: any
		): void;
	};
	contextType?: React.Context<any>;
};
