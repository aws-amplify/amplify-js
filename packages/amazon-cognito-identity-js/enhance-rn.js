import { NativeModules } from 'react-native';
import * as src from './src';

import BigInteger from './src/BigInteger';

export * from './src';

const { RNAWSCognito } = NativeModules;

// Store the original functions before overriding
const originalModPow = BigInteger.prototype.modPow;
const originalCalculateS = src.AuthenticationHelper.prototype.calculateS;

BigInteger.prototype.modPow = function nativeModPow(e, m, callback) {
	// Check if native module is available
	if (RNAWSCognito && RNAWSCognito.computeModPow) {
		RNAWSCognito.computeModPow(
			{
				target: this.toString(16),
				value: e.toString(16),
				modifier: m.toString(16),
			},
			(err, result) => {
				if (err) {
					return callback(new Error(err), null);
				}
				const bigIntResult = new BigInteger(result, 16);
				return callback(null, bigIntResult);
			}
		);
	} else {
		// Fall back to original JavaScript implementation
		return originalModPow.call(this, e, m, callback);
	}
};

src.AuthenticationHelper.prototype.calculateS = function nativeComputeS(
	xValue,
	serverBValue,
	callback
) {
	// Check if native module is available
	if (RNAWSCognito && RNAWSCognito.computeS) {
		RNAWSCognito.computeS(
			{
				g: this.g.toString(16),
				x: xValue.toString(16),
				k: this.k.toString(16),
				a: this.smallAValue.toString(16),
				b: serverBValue.toString(16),
				u: this.UValue.toString(16),
			},
			(err, result) => {
				if (err) {
					return callback(new Error(err), null);
				}
				const bigIntResult = new BigInteger(result, 16);
				return callback(null, bigIntResult);
			}
		);
	} else {
		// Fall back to original JavaScript implementation
		return originalCalculateS.call(this, xValue, serverBValue, callback);
	}
	return undefined;
};
