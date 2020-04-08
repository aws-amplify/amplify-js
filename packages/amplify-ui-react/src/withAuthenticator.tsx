import React, { ComponentType, ComponentPropsWithRef } from 'react';

import { AmplifyAuthenticator } from './';

export function withAuthenticator(
	Component: ComponentType,
	authenticatorProps?: ComponentPropsWithRef<typeof AmplifyAuthenticator>
) {
	return function ComponentWithAuthenticator(props) {
		return (
			<AmplifyAuthenticator {...authenticatorProps} {...props}>
				<Component />
			</AmplifyAuthenticator>
		);
	};
}
