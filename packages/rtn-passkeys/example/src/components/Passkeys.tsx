import {
	ListWebAuthnCredentialsOutput,
	associateWebAuthnCredential,
	deleteWebAuthnCredential,
	listWebAuthnCredentials,
} from 'aws-amplify/auth';
import { useCallback, useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';

import { AuthError } from './Authenticator/components/AuthError';

export function Passkeys() {
	const [error, setError] = useState<Error | null>(null);
	const [passkeys, setPasskeys] = useState<
		ListWebAuthnCredentialsOutput['credentials']
	>([]);

	const getPasskeys = useCallback(() => {
		(async () => {
			const creds: ListWebAuthnCredentialsOutput['credentials'] = [];

			let next;

			do {
				const { credentials = [], nextToken } = await listWebAuthnCredentials();
				next = nextToken;
				creds.push(...credentials);
			} while (next);

			setPasskeys(creds || []);
		})();
	}, []);

	const handleDeletePasskey = async (credentialId: string) => {
		try {
			setError(null);
			await deleteWebAuthnCredential({ credentialId });
			getPasskeys();
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			}
		}
	};

	useEffect(() => {
		getPasskeys();
	}, [getPasskeys]);

	const handleRegisterPasskey = async () => {
		try {
			await associateWebAuthnCredential();
			getPasskeys();
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err);
			}
		}
	};

	return (
		<View style={{ width: '100%', padding: 20 }}>
			<Button title="Register Passkey" onPress={handleRegisterPasskey} />
			<View>
				<Text style={{ fontWeight: 'bold', fontSize: 18 }}>Passkeys</Text>
				<View style={{ width: '100%' }}>
					{passkeys.map((passkey, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => handleDeletePasskey(passkey.credentialId!)}
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								borderWidth: 1,
								borderColor: 'black',
								padding: 10,
								marginBottom: 10,
							}}
						>
							<Text>{index + 1}</Text>
							<Text>{passkey.friendlyCredentialName}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
			<View style={{ width: '100%' }}>
				{error && <AuthError error={error} />}
			</View>
		</View>
	);
}
