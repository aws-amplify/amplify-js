import { NativeModules } from 'react-native';

// In the Expo managed workflow the getRandomBase64 method is provided by ExpoRandom.getRandomBase64String
if (!NativeModules.ExpoRandom) {
	throw new Error(
		'Expo managed workflow support for amazon-cognito-identity-js is only available in SDK 39 and higher.'
	);
}

export default NativeModules.ExpoRandom.getRandomBase64String;
