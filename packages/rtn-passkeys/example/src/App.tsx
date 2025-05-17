/* eslint-disable no-console */
import {
	associateWebAuthnCredential,
	deleteUser,
	signIn,
	signOut,
	signUp,
} from 'aws-amplify/auth';
import React, { useState } from 'react';
import {
	Button,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Amplify } from 'aws-amplify';

import config from '../amplify_outputs.json';

Amplify.configure(config);

const testUser = {
	username: 'user@example.com',
	password: 'Test123#',
};

function App(): React.JSX.Element {
	const [signedUp, setSignedUp] = useState(false);
	const [signedIn, setSignedIn] = useState(false);
	const [webAuthNAssociated, setWebAuthNAssociated] = useState(false);
	const [readySignInWithPassKeys, setReadySignInWithPassKeys] = useState(false);
	const [signedInWithPasskeys, setSignedInWithPasskeys] = useState(false);
	const [testComplete, setTestComplete] = useState(false);

	const resetState = () => {
		setSignedUp(false);
		setSignedIn(false);
		setWebAuthNAssociated(false);
		setReadySignInWithPassKeys(false);
		setSignedInWithPasskeys(false);
		setTestComplete(false);
	};

	const handleSignUp = async () => {
		try {
			await signUp(testUser);

			setSignedUp(true);
		} catch (error) {
			console.error('Error signing up:', error);
		}
	};

	const handleSignin = async () => {
		try {
			await signIn(testUser);

			setSignedIn(true);
		} catch (error) {
			if ((error as any).name === 'UserAlreadyAuthenticatedException') {
				await signOut();
			}
			console.error('Error signing up:', error);
		}
	};

	const handleSignOut = async () => {
		await signOut();

		setReadySignInWithPassKeys(true);
	};

	const handleAssociateWebAuthNCredentials = async () => {
		try {
			await associateWebAuthnCredential();
			setWebAuthNAssociated(true);
		} catch (error) {
			console.error('Error associating WebAuthN credentials:');
			console.error(error);
			console.error((error as any).name);
			console.error((error as any).underlyingError);
		}
	};

	const handleSignInWithPasskeys = async () => {
		try {
			await signIn({
				username: testUser.username,
				options: {
					authFlowType: 'USER_AUTH',
					preferredChallenge: 'WEB_AUTHN',
				},
			});
			setSignedInWithPasskeys(true);
		} catch (error) {
			console.error('Error signing in with webauthN: ', error);
		}
	};

	const handleDeleteUser = async () => {
		try {
			await deleteUser();
			setTestComplete(true);
		} catch (error) {
			console.error('Error deleting user:', error);
		}
	};

	const renderInCompleteTests = () => (
		<>
			<View style={styles.contentContainer}>
				<Text>Step 1: sign up a user (with auto confirm)</Text>
				<Button title={`sign up ${testUser.username}`} onPress={handleSignUp} />
			</View>
			{signedUp && (
				<View style={styles.contentContainer}>
					<Text>Step 2: sign in the user</Text>
					<Button
						title={`sign in ${testUser.username}`}
						onPress={handleSignin}
					/>
				</View>
			)}
			{signedIn && (
				<View style={styles.contentContainer}>
					<Text>Step 3: associate webauthn credential</Text>
					<Button
						title="associate webauthn credential"
						onPress={handleAssociateWebAuthNCredentials}
					/>
					{webAuthNAssociated && (
						<Text testID="web-authn-association-status">
							Successfully associated.
						</Text>
					)}
				</View>
			)}
			{webAuthNAssociated && (
				<>
					<View style={styles.container} />
					<View>
						<Button title="sign out" onPress={handleSignOut} />
					</View>
				</>
			)}
			{readySignInWithPassKeys && (
				<View style={styles.contentContainer}>
					<Text>Step 4: sign in with passkeys</Text>
					<Button
						title="sign in with passkeys"
						onPress={handleSignInWithPasskeys}
					/>
					{signedInWithPasskeys && (
						<Text>successfully signed in with passkeys.</Text>
					)}
				</View>
			)}
			{signedInWithPasskeys && (
				<View style={styles.contentContainer}>
					<View style={{ height: 10 }} />
					<Text>Step 5: delete user</Text>
					<Button
						testID="delete-user"
						title="Delete user"
						onPress={handleDeleteUser}
					/>
				</View>
			)}
		</>
	);

	return (
		<SafeAreaView style={styles.container}>
			{testComplete && (
				<View style={{ ...styles.container, ...styles.contentContainer }}>
					<Text style={styles.bold}>Test completed! 🎉</Text>
					<View>
						<Button
							title="Reset"
							onPress={async () => {
								resetState();
							}}
						/>
					</View>
				</View>
			)}
			{!testComplete && (
				<>
					<ScrollView style={styles.container}>
						{renderInCompleteTests()}
					</ScrollView>
					<View>
						<Button
							title="Delete user"
							onPress={async () => {
								await deleteUser();
								resetState();
							}}
						/>
					</View>
				</>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	bold: {
		fontSize: 30,
		fontWeight: 'bold',
	},
});

export default App;
