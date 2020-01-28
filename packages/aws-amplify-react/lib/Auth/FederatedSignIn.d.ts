import * as React from 'react';
export interface IFederatedButtonsProps {
	authState: any;
	federated: any;
	onAuthEvent?: any;
	onStateChange: any;
	theme: any;
}
export declare class FederatedButtons extends React.Component<
	IFederatedButtonsProps,
	{}
> {
	google(google_client_id: any): JSX.Element;
	facebook(facebook_app_id: any): JSX.Element;
	amazon(amazon_client_id: any): JSX.Element;
	OAuth(oauth_config: any): JSX.Element;
	auth0(auth0: any): JSX.Element;
	render(): JSX.Element;
}
export default class FederatedSignIn extends React.Component<any, any> {
	render(): JSX.Element;
}
