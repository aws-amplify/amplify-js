import React, {
	ComponentType,
	ComponentPropsWithRef,
	FunctionComponent,
} from 'react';

import { AmplifyAuthenticator } from './';
import { onAuthUIStateChange, AuthState } from '@aws-amplify/ui-components';

export function withAuthenticator(
	Component: ComponentType,
	authenticatorProps?: ComponentPropsWithRef<typeof AmplifyAuthenticator>
) {
	const AppWithAuthenticator: FunctionComponent = props => {
		const [signedIn, setSignedIn] = React.useState(false);

		React.useEffect(() => {
			return onAuthUIStateChange(authState => {
				if (authState === AuthState.SignedIn) {
					setSignedIn(true);
				} else if (authState === AuthState.SignedOut) {
					setSignedIn(false);
				}
			});
		}, []);

		if (!signedIn) {
			return <AmplifyAuthenticator {...authenticatorProps} {...props} />;
		}
		return <Component />;
	};

	return AppWithAuthenticator;
}
