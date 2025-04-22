import { confirmSignIn } from 'aws-amplify/auth';
import { useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';

import { handleNextSignInStep } from '../utils/handleNextSignInStep';
import { useAuthenticator } from '../hooks/useAuthenticator';

import { AuthError } from './AuthError';

interface SelectFirstFactorProps {
	availableChallenges: string[];
}

export function SelectFirstFactor({
	availableChallenges,
}: SelectFirstFactorProps) {
	const { dispatch } = useAuthenticator();

	const [challengeName, setChallengeName] = useState<string>('PIGEON');
	const [error, setError] = useState<Error | null>(null);

	const handleSubmit = async () => {
		try {
			const { nextStep } = await confirmSignIn({
				challengeResponse: challengeName,
			});
			handleNextSignInStep(nextStep, dispatch);
		} catch (err) {
			if (err instanceof Error) {
				console.log(err);
				setError(err);
			}
		}
	};

	return (
		<View>
			<Text>Select First Factor</Text>
			{availableChallenges.map(name => (
				<TouchableOpacity
					key={name}
					onPress={() => {
						setChallengeName(name);
					}}
					style={{ flexDirection: 'row' }}
				>
					{challengeName === name && <Text>✅</Text>}
					<Text>{name}</Text>
				</TouchableOpacity>
			))}
			<TouchableOpacity
				onPress={() => {
					setChallengeName('PIGEON');
				}}
				style={{ flexDirection: 'row' }}
			>
				{challengeName === 'PIGEON' && <Text>✅</Text>}
				<Text>PIGEON</Text>
			</TouchableOpacity>
			<Button title="Select First Factor" onPress={handleSubmit} />

			{error && <AuthError error={error} />}
		</View>
	);
}
