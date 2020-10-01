import * as React from 'react';
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';

const logger = new Logger('AuthStateWrapper');

export interface IAuthStateWrapperProps {
	amplifyConfig?: any;
	authState?: string;
	onStateChange?: any;
	theme?: any;
}

export interface IAuthStateWrapperState {
	authData?: any;
	authState: string;
	error?: any;
}

export class AuthStateWrapper extends React.Component<
	IAuthStateWrapperProps,
	IAuthStateWrapperState
> {	
	constructor(props) {
		super(props);

		this.handleStateChange = this.handleStateChange.bind(this);
		this.handleAuthEvent = this.handleAuthEvent.bind(this);
		this.checkUser = this.checkUser.bind(this);

		this.state = { authState: props.authState || 'signIn' };
	}

	componentWillMount() {
		const config = this.props.amplifyConfig;
		if (config) {
			Amplify.configure(config);
		}
	}

	componentDidMount() {
		this.checkUser();
	}

	handleStateChange(state, data) {
		logger.debug('authStateWrapper state change ' + state, data);
		if (state === this.state.authState) {
			return;
		}

		if (state === 'signedOut') {
			state = 'signIn';
		}
		this.setState({ authState: state, authData: data, error: null });
		if (this.props.onStateChange) {
			this.props.onStateChange(state, data);
		}
	}

	handleAuthEvent(state, event) {
		if (event.type === 'error') {
			this.setState({ error: event.data });
		}
	}

	checkUser() {
		// @ts-ignore
		if (!Auth || typeof Auth.currentUser !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		// @ts-ignore
		return Auth.currentUser()
			.then(user => {
				const state = user ? 'signedIn' : 'signIn';
				this.handleStateChange(state, user);
			})
			.catch(err => logger.error(err));
	}

	render() {
		const { authState, authData } = this.state;
		const theme = this.props.theme || AmplifyTheme;
		const render_children = React.Children.map(this.props.children, child => {
			if (!child) {
				return null;
			}
			// @ts-ignore
			return React.cloneElement(child, {
				authState,
				authData,
				theme,
				onStateChange: this.handleStateChange,
				onAuthEvent: this.handleAuthEvent,
			});
		});

		return (
			<div className="amplify-state-wrapper" style={theme.stateWrapper}>
				{render_children}
				{this.state.error && (
					<div className="amplify-error-section" style={theme.errorSection}>
						{this.state.error}
					</div>
				)}
			</div>
		);
	}
}

/**
 * @deprecated use named import
 */
export default AuthStateWrapper;
