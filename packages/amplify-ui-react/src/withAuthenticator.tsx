import React, { ComponentType, ComponentPropsWithRef } from 'react';

import { AmplifyAuthenticator } from './';

export function withAuthenticator(
	Component: ComponentType,
	props?: ComponentPropsWithRef<typeof AmplifyAuthenticator>
) {
	return (
		<AmplifyAuthenticator {...props}>
			<Component />
		</AmplifyAuthenticator>
	);
}
