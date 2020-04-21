import React, {
	ComponentType,
	ComponentPropsWithRef,
	FunctionComponent,
} from 'react';

import { AmplifyAuthenticator } from './';

export function withAuthenticator(
	Component: ComponentType,
	authenticatorProps?: ComponentPropsWithRef<typeof AmplifyAuthenticator>
) {
	const ComponentWithAuthenticator: FunctionComponent = props => (
		<AmplifyAuthenticator {...authenticatorProps} {...props}>
			<Component />
		</AmplifyAuthenticator>
	);

	return ComponentWithAuthenticator;
}
