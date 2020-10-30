import { NativeModules } from 'react-native';

// In the Expo managed workflow the getRandomBase64 method is provided by ExpoRandom.getRandomBase64String
const getRandomBase64String = NativeModules.ExpoRandom
	? NativeModules.ExpoRandom.getRandomBase64String
	: () => {
			throw new Error(
				'Expo managed workflow support for amazon-cognito-identity-js is only available in SDK 39 and higher.'
			);
	  };

export default getRandomBase64String;
