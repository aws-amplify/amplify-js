import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import { multiply } from '@aws-amplify/rtn-passkeys';

const result = multiply(6, 7);

export default function App() {
	return (
		<View style={styles.container}>
			<Text>Result: {result}</Text>
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
