import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Amplify } from 'aws-amplify';
import { module } from '@aws-amplify/rtn-passkeys';

import outputs from '../amplify_outputs.json';

import { Authenticator } from './components/Authenticator';
import { Passkeys } from './components/Passkeys';

const result = module.multiply(6, 7);

Amplify.configure(outputs);

export default function App() {
	return (
		<View style={styles.container}>
			<Authenticator>
				<Text>Result: {result}</Text>
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
