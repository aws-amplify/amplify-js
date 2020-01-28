import * as React from 'react';
export default function withAuth0(
	Comp: any,
	options?: any
): {
	new (props: any): {
		_auth0: any;
		componentDidMount(): void;
		createScript(): void;
		initialize(): void;
		signIn(): Promise<void>;
		signOut(opts?: {}): Promise<void>;
		render(): React.ReactNode;
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
export declare const Auth0Button: {
	new (props: any): {
		_auth0: any;
		componentDidMount(): void;
		createScript(): void;
		initialize(): void;
		signIn(): Promise<void>;
		signOut(opts?: {}): Promise<void>;
		render(): React.ReactNode;
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
