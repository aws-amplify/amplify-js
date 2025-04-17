import { Text, View } from 'react-native';

interface AuthErrorProps {
	error: Error;
}
export function AuthError({ error }: AuthErrorProps) {
	return (
		<View
			style={{ borderWidth: 1, borderColor: 'red', margin: 10, padding: 10 }}
		>
			<Text>
				{error.name}: {error.message}
			</Text>
		</View>
	);
}
