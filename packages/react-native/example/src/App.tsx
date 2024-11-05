// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { computeModPow, computeS } from '@aws-amplify/react-native';

const computeModPowPayload = {
	base: '1259834344',
	exponent: '5234934343123334',
	divisor: '8390',
};

const computeSPayload = {
	g: '2343',
	x: '2324545',
	k: '3431',
	a: '33234',
	b: '96849',
	u: '44059',
};

export default function App() {
	const [computeModPowResult, setComputeModPowResult] = React.useState<
		string | undefined
	>();
	const [computeSResult, setComputeSResult] = React.useState<
		string | undefined
	>();

	React.useEffect(() => {
		async function calc() {
			const modPowResult = await computeModPow(computeModPowPayload);
			setComputeModPowResult(modPowResult);
			const sResult = await computeS(computeSPayload);
			setComputeSResult(sResult);
		}
		calc();
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>computeModPow</Text>
			<Text style={styles.code}>
				payload: {JSON.stringify(computeModPowPayload, null, 2)}
			</Text>
			<Text style={styles.code}>Result:{computeModPowResult}</Text>
			<Text style={styles.title}>computeS</Text>
			<Text style={styles.code}>
				payload: {JSON.stringify(computeSPayload, null, 2)}
			</Text>
			<Text style={styles.code}>Result: {computeSResult}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	box: {
		width: 60,
		height: 60,
		marginVertical: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginVertical: 16,
	},
	code: {
		fontFamily: Platform.select({
			ios: 'Menlo',
			android: 'monospace',
		}),
	},
});
