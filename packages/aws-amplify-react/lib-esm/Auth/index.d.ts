import * as React from 'react';
export { default as Authenticator } from './Authenticator';
export { default as AuthPiece } from './AuthPiece';
export { default as SignIn } from './SignIn';
export { default as ConfirmSignIn } from './ConfirmSignIn';
export { default as SignOut } from './SignOut';
export { default as RequireNewPassword } from './RequireNewPassword';
export { default as SignUp } from './SignUp';
export { default as ConfirmSignUp } from './ConfirmSignUp';
export { default as VerifyContact } from './VerifyContact';
export { default as ForgotPassword } from './ForgotPassword';
export { default as Greetings } from './Greetings';
export {
	default as FederatedSignIn,
	FederatedButtons,
} from './FederatedSignIn';
export { default as TOTPSetup } from './TOTPSetup';
export { default as Loading } from './Loading';
export * from './Provider';
export declare function withAuthenticator(
	Comp: any,
	includeGreetings?: boolean,
	authenticatorComponents?: any[],
	federated?: any,
	theme?: any,
	signUpConfig?: {}
): {
	new (props: any): {
		authConfig: any;
		handleAuthStateChange(state: any, data: any): void;
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
		componentDidMount?(): void;
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
export declare class AuthenticatorWrapper extends React.Component {
	constructor(props: any);
	handleAuthState(state: any, data: any): void;
	renderChildren(): any;
	render(): JSX.Element;
}
