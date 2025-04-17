import { useContext } from 'react';
import { AuthenticatorContext } from '../context/AuthenticatorContext';

export const useAuthenticator = () => {
	const authenticatorContext = useContext(AuthenticatorContext);
	if (!authenticatorContext) {
		throw new Error(
			'useAuthenticator hook must be used inside Authenticator context provider.'
		);
	}
	return authenticatorContext;
};
