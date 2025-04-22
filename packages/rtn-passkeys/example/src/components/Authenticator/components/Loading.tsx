import { Text } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect } from 'react';

import { useAuthenticator } from '../hooks/useAuthenticator';

export function Loading() {
	const { dispatch } = useAuthenticator();

	useEffect(() => {
		(async () => {
			try {
				const { tokens } = await fetchAuthSession();

				if (tokens?.accessToken) {
					dispatch({ type: 'authenticated' });
				} else {
					throw new Error('No accessToken available.');
				}
			} catch (err) {
				dispatch({ type: 'sign-in' });
			}
		})();
	}, [dispatch]);

	return <Text>Loading...</Text>;
}
