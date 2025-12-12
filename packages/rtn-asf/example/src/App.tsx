// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */
import React, { useState } from 'react';
import {
	Button,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import NativeAmplifyRtnAsf from '@aws-amplify/rtn-asf';

function App(): React.JSX.Element {
	const [userPoolId, setUserPoolId] = useState('us-east-1_testPool');
	const [clientId, setClientId] = useState('testClientId');
	const [result, setResult] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGetContextData = () => {
		try {
			setError(null);
			const contextData = NativeAmplifyRtnAsf?.getContextData(
				userPoolId,
				clientId,
			);
			setResult(contextData ?? 'null (no data returned)');
			console.log('Context data:', contextData);
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			setError(errorMessage);
			console.error('Error getting context data:', e);
		}
	};

	const handleTestEmptyUserPoolId = () => {
		try {
			setError(null);
			const contextData = NativeAmplifyRtnAsf?.getContextData('', clientId);
			setResult(contextData ?? 'null (expected for empty userPoolId)');
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			setError(errorMessage);
		}
	};

	const handleTestEmptyClientId = () => {
		try {
			setError(null);
			const contextData = NativeAmplifyRtnAsf?.getContextData(userPoolId, '');
			setResult(contextData ?? 'null (expected for empty clientId)');
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			setError(errorMessage);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<Text style={styles.title}>ASF Context Data Test</Text>

				<View style={styles.inputContainer}>
					<Text style={styles.label}>User Pool ID:</Text>
					<TextInput
						style={styles.input}
						value={userPoolId}
						onChangeText={setUserPoolId}
						placeholder="Enter User Pool ID"
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text style={styles.label}>Client ID:</Text>
					<TextInput
						style={styles.input}
						value={clientId}
						onChangeText={setClientId}
						placeholder="Enter Client ID"
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button title="Get Context Data" onPress={handleGetContextData} />
				</View>

				<View style={styles.buttonContainer}>
					<Button
						title="Test Empty UserPoolId"
						onPress={handleTestEmptyUserPoolId}
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						title="Test Empty ClientId"
						onPress={handleTestEmptyClientId}
					/>
				</View>

				{result && (
					<View style={styles.resultContainer}>
						<Text style={styles.resultLabel}>Result:</Text>
						<Text style={styles.resultText} selectable>
							{result.length > 100 ? `${result.substring(0, 100)}...` : result}
						</Text>
					</View>
				)}

				{error && (
					<View style={styles.errorContainer}>
						<Text style={styles.errorLabel}>Error:</Text>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				<View style={styles.infoContainer}>
					<Text style={styles.infoText}>
						Module available: {NativeAmplifyRtnAsf ? 'Yes' : 'No'}
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	scrollView: {
		flex: 1,
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
	},
	inputContainer: {
		marginBottom: 15,
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
		fontWeight: '600',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 10,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	buttonContainer: {
		marginVertical: 10,
	},
	resultContainer: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#e8f5e9',
		borderRadius: 8,
	},
	resultLabel: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 5,
	},
	resultText: {
		fontSize: 14,
		fontFamily: 'monospace',
	},
	errorContainer: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#ffebee',
		borderRadius: 8,
	},
	errorLabel: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 5,
		color: '#c62828',
	},
	errorText: {
		fontSize: 14,
		color: '#c62828',
	},
	infoContainer: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#e3f2fd',
		borderRadius: 8,
	},
	infoText: {
		fontSize: 14,
	},
});

export default App;
