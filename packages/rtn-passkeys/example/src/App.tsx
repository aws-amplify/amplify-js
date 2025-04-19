import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Amplify } from 'aws-amplify';

import outputs from '../amplify_outputs.json';

import { Authenticator } from './components/Authenticator';
import { Passkeys } from './components/Passkeys';

Amplify.configure(outputs);

export default function App() {
	return (
		<View style={styles.container}>
			<Authenticator>
				<Passkeys />
			</Authenticator>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
