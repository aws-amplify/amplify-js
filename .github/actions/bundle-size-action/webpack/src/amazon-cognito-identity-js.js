/**
 * Validate that `crypto` is not included in the final bundle
 *
 * See: https://github.com/aws-amplify/amplify-js/pull/7521
 */
import {
	CognitoUserPool,
	CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js#usage
var poolData = {
	UserPoolId: '...', // Your user pool id here
	ClientId: '...', // Your client id here
};
var userPool = new CognitoUserPool(poolData);

var attributeList = [];

var dataEmail = {
	Name: 'email',
	Value: 'email@mydomain.com',
};

var dataPhoneNumber = {
	Name: 'phone_number',
	Value: '+15555555555',
};
var attributeEmail = new CognitoUserAttribute(dataEmail);
var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);

attributeList.push(attributeEmail);
attributeList.push(attributePhoneNumber);

userPool.signUp('username', 'password', attributeList, null, function(
	err,
	result
) {
	if (err) {
		alert(err.message || JSON.stringify(err));
		return;
	}
	var cognitoUser = result.user;
	console.log('user name is ' + cognitoUser.getUsername());
});
