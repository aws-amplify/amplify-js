import { NativeModules } from 'react-native';

const getRandomBase64 = NativeModules.ExpoRandom
	? NativeModules.ExpoRandom.getRandomBase64String
	: NativeModules.RNAWSCognito
	? NativeModules.RNAWSCognito.getRandomBase64
	: () => {
			throw new Error(
				'Could not find a native getRandomBase64 implementation.'
			);
	  };
export default getRandomBase64;
