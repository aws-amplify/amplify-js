/**
 *
 *  Collection of service errors that are common in the cognito auth plugin
 *
 * @link https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_Operations.html
 */
export enum CognitoServiceErrorCode {
	AliasExistsException = 'AliasExistsException',
	CodeDeliveryFailureException = 'CodeDeliveryFailureException',
	CodeMismatchException = 'CodeMismatchException',
	ConcurrentModificationException = 'ConcurrentModificationException',
	EnableSoftwareTokenMFAException = 'EnableSoftwareTokenMFAException',
	ExpiredCodeException = 'ExpiredCodeException',
	ForbiddenException = 'ForbiddenException',
	InternalErrorException = 'InternalErrorException',
	InvalidEmailRoleAccessPolicyException = 'InvalidEmailRoleAccessPolicyException',
	InvalidLambdaResponseException = 'InvalidLambdaResponseException',
	InvalidParameterException = 'InvalidParameterException',
	InvalidPasswordException = 'InvalidPasswordException',
	InvalidSmsRoleAccessPolicyException = 'InvalidSmsRoleAccessPolicyException',
	InvalidSmsRoleTrustRelationshipException = 'InvalidSmsRoleTrustRelationshipException',
	InvalidUserPoolConfigurationException = 'InvalidUserPoolConfigurationException',
	LimitExceededException = 'LimitExceededException',
	MFAMethodNotFoundException = 'MFAMethodNotFoundException',
	NotAuthorizedException = 'NotAuthorizedException',
	PasswordResetRequiredException = 'PasswordResetRequiredException',
	ResourceNotFoundException = 'ResourceNotFoundException',
	SoftwareTokenMFANotFoundException = 'SoftwareTokenMFANotFoundException',
	TooManyFailedAttemptsException = 'TooManyFailedAttemptsException',
	UnexpectedLambdaException = 'UnexpectedLambdaException',
	UserLambdaValidationException = 'UserLambdaValidationException',
	UserNotConfirmedException = 'UserNotConfirmedException',
	UserNotFoundException = 'UserNotFoundException',
	UsernameExistsException = 'UsernameExistsException',
	TooManyRequestsException = 'TooManyRequestsException',
	ResourceConflictException = 'ResourceConflictException',
	InvalidIdentityPoolConfigurationException = 'InvalidIdentityPoolConfigurationException',
	ExternalServiceException = 'ExternalServiceException',
}
