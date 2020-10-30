import { NativeModules } from 'react-native';
const getRandomBase64 = NativeModules.RNGetRandomValues
	? NativeModules.RNGetRandomValues.getRandomBase64
	: () => {
			throw Error('Validate that amazon-cognito-identity-js has been linked');
	  };

export default getRandomBase64;
