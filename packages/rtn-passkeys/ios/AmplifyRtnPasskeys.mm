#import "AmplifyRtnPasskeys.h"

@implementation AmplifyRtnPasskeys

RCT_EXPORT_MODULE()

- (NSNumber *)multiply:(double)a b:(double)b {
	NSNumber *result = @(a * b);
	
	return result;
}

- (void)createPasskey:(JS::NativeAmplifyRtnPasskeys::PasskeyCreateOptionsJson &)input resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
	
	self.handler = [[AmplifyRtnPasskeysHandler alloc] initWithResolve:resolve reject:reject];
	
	ASAuthorizationPlatformPublicKeyCredentialProvider *platformProvider = [[ASAuthorizationPlatformPublicKeyCredentialProvider alloc] initWithRelyingPartyIdentifier:input.rp().id_()];
	ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest *platformKeyRequest = [platformProvider createCredentialRegistrationRequestWithChallenge:[input.challenge() dataUsingEncoding:NSUTF8StringEncoding] name:input.user().id_() userID:[input.user().id_() dataUsingEncoding:NSUTF8StringEncoding]];
	
	ASAuthorizationController *authController = [[ASAuthorizationController alloc] initWithAuthorizationRequests:@[platformKeyRequest]];
	
	authController.delegate = self;
	authController.presentationContextProvider = self;
	
	[authController performRequests];
}


- (void)getPasskey:(JS::NativeAmplifyRtnPasskeys::PasskeyGetOptionsJson &)input resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
	ASAuthorizationPlatformPublicKeyCredentialProvider *platformProvider = [[ASAuthorizationPlatformPublicKeyCredentialProvider alloc] initWithRelyingPartyIdentifier:input.rpId()];
	ASAuthorizationPlatformPublicKeyCredentialAssertionRequest *platformKeyRequest = [platformProvider createCredentialAssertionRequestWithChallenge:[input.challenge() dataUsingEncoding:NSUTF8StringEncoding]];
	
	ASAuthorizationController *authController = [[ASAuthorizationController alloc] initWithAuthorizationRequests:@[platformKeyRequest]];
	
	authController.delegate = self;
	authController.presentationContextProvider = self;
	
	[authController performRequests];
}

- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithAuthorization:(ASAuthorization *)authorization {
	
	id credential = authorization.credential;
	
	if ([credential isKindOfClass:[ASAuthorizationPlatformPublicKeyCredentialRegistration class]]) {
		ASAuthorizationPlatformPublicKeyCredentialRegistration *registrationCredential = (ASAuthorizationPlatformPublicKeyCredentialRegistration *)credential;
		
		// handle registration ceremony success
		
		NSDictionary *registrationResult = @{
			@"id": [registrationCredential.credentialID base64EncodedStringWithOptions:0],
			@"rawId": [registrationCredential.credentialID base64EncodedStringWithOptions:0],
			@"type": @"public-key",
			@"response": @{
				@"attestationObject": [registrationCredential.rawAttestationObject base64EncodedStringWithOptions:0],
				@"clientDataJSON": [registrationCredential.rawClientDataJSON base64EncodedStringWithOptions:0],
				@"transports": @[@"internal"]
			}
		};
		
		self.handler.resolve(registrationResult);
		
	} else if ([credential isKindOfClass:[ASAuthorizationPlatformPublicKeyCredentialAssertion class]]) {
		ASAuthorizationPlatformPublicKeyCredentialAssertion *assertionCredential = (ASAuthorizationPlatformPublicKeyCredentialAssertion *)credential;
		
		// handle assertion ceremony success
		
		NSDictionary *assertionResult = @{
			@"id": [assertionCredential.credentialID base64EncodedStringWithOptions:0],
			@"rawId": [assertionCredential.credentialID base64EncodedStringWithOptions:0],
			@"type": @"public-key",
			@"response": @{
				@"authenticatorData": [assertionCredential.rawAuthenticatorData base64EncodedStringWithOptions:0],
				@"clientDataJSON": [assertionCredential.rawClientDataJSON base64EncodedStringWithOptions:0],
				@"signature": [assertionCredential.signature base64EncodedStringWithOptions:0]
			},
			@"authenticatorAttachment": @"platform"
		};
		
		self.handler.resolve(assertionResult);
		
	}
	// handle failure
	self.handler.reject(@"INVALID_CREDENTIAL", @"Received unexpected credential type", nil);
}

- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithError:(NSError *)error {
	// handle errors
}

- (nonnull ASPresentationAnchor)presentationAnchorForAuthorizationController:(nonnull ASAuthorizationController *)controller {
	return ASPresentationAnchor();
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params {
	return std::make_shared<facebook::react::NativeAmplifyRtnPasskeysSpecJSI>(params);
}

@end

@implementation AmplifyRtnPasskeysHandler

- (instancetype)initWithResolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
	self = [super init];
	if(self) {
		_resolve = resolve;
		_reject = reject;
	}
	return self;
}

@end
