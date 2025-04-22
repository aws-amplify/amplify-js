import { GraphQLSubscription } from 'aws-amplify/api';
import { useState, useEffect } from 'react';
import { MfaInfo } from '../types';
import { client } from '../utils/graphqlClient';

interface MfaInfoSubscription {
	onCreateMfaInfo: MfaInfo;
}

const subscriptionQuery = `
  subscription OnCreateMfaInfo {
    onCreateMfaInfo {
      username
      code
	  expirationTime
    }
  }
`;

export function useMfaCode() {
	const [mfaCode, setMfaCode] = useState<string>('');

	useEffect(() => {
		const result = client.graphql<GraphQLSubscription<MfaInfoSubscription>>({
			query: subscriptionQuery,
		});

		const subscription = result.subscribe({
			next: ({ data }) => {
				const code = data.onCreateMfaInfo.code;
				if (code) {
					setMfaCode(code);
				}
			},
			error: (error: unknown) => console.warn(error),
		});
		return () => subscription.unsubscribe();
	}, []);

	return [mfaCode, setMfaCode] as const;
}
