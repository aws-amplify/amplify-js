import { NativeModules } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let ExpoRandom;
if (requireNativeModule) {
	// we're dealing with sdk 45 and above for expo
	ExpoRandom = requireNativeModule('ExpoRandom');
}

const getRandomBase64 = ExpoRandom
	? ExpoRandom.getRandomBase64String
	: NativeModules.ExpoRandom
	? NativeModules.ExpoRandom.getRandomBase64String
	: NativeModules.RNAWSCognito
	? NativeModules.RNAWSCognito.getRandomBase64
	: () => {
			throw new Error(
				'Could not find a native getRandomBase64 implementation. Validate that amazon-cognito-identity-js is linked.'
			);
	  };
export default getRandomBase64;
