import React, {
	ComponentType,
	ComponentPropsWithRef,
	FunctionComponent,
} from 'react';
import { Auth, appendToCognitoUserAgent } from '@aws-amplify/auth';
import {
	AmplifyContainer,
	AmplifyAuthenticator,
	AmplifyAuthContainer,
} from './';
import { onAuthUIStateChange, AuthState } from '@aws-amplify/ui-components';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('withAuthenticator');

export function withAuthenticator<T extends object>(
	Component: ComponentType<T>,
	authenticatorProps?: ComponentPropsWithRef<typeof AmplifyAuthenticator>
) {
	const AppWithAuthenticator: FunctionComponent<T> = (props) => {
		const [signedIn, setSignedIn] = React.useState(false);

		React.useEffect(() => {
			appendToCognitoUserAgent('withAuthenticator');

			// checkUser returns an "unsubscribe" function to stop side-effects
			return checkUser();
		}, []);

		function checkUser() {
			setUser();

			return onAuthUIStateChange((authState) => {
				if (authState === AuthState.SignedIn) {
					setSignedIn(true);
				} else if (authState === AuthState.SignedOut) {
					setSignedIn(false);
				}
			});
		}

		async function setUser() {
			try {
				const user = await Auth.currentAuthenticatedUser();
				if (user) setSignedIn(true);
			} catch (err) {
				logger.debug(err);
			}
		}

		if (!signedIn) {
			return (
				<AmplifyContainer>
					<AmplifyAuthContainer>
						<AmplifyAuthenticator {...authenticatorProps} {...props} />
					</AmplifyAuthContainer>
				</AmplifyContainer>
			);
		}

		return <Component {...props} />;
	};

	return AppWithAuthenticator;
}
