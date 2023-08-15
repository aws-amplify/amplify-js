import { cryptoSecureRandomInt as cryptoSecureRandomIntRN } from '@aws-amplify/react-native';
export function cryptoSecureRandomInt(): number {
	return cryptoSecureRandomIntRN();
}
