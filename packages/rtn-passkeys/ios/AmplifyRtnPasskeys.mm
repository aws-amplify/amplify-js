#import "AmplifyRtnPasskeys.h"

static NSString *const PUBLIC_KEY_TYPE = @"public-key";
static NSString *const PLATFORM_ATTACHMENT = @"platform";
static NSString *const INTERNAL_TRANSPORT = @"internal";

static NSDictionary *const ERROR_MAP = @{
	@(ASAuthorizationErrorFailed) : @"FAILED",
	@(ASAuthorizationErrorUnknown) : @"UNKNOWN",
	@(ASAuthorizationErrorCanceled) : @"CANCELED",
	@(ASAuthorizationErrorNotHandled) : @"NOT_HANDLED",
	@(ASAuthorizationErrorNotInteractive) : @"NOT_INTERACTIVE",
	@(ASAuthorizationErrorInvalidResponse) : @"INVALID_RESPONSE",
	@(ASAuthorizationErrorMatchedExcludedCredential) : @"DUPLICATE",
};

@implementation AmplifyRtnPasskeys

RCT_EXPORT_MODULE()

- (NSNumber *)multiply:(double)a b:(double)b {
	NSNumber *result = @(a * b);

	return result;
}

- (void)createPasskey:
            (JS::NativeAmplifyRtnPasskeys::PasskeyCreateOptionsJson &)input
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {

	if (self.handler)
		return;

	self.handler = [[AmplifyRtnPasskeysHandler alloc] initWithResolve:resolve
	                                                           reject:reject];

	ASAuthorizationPlatformPublicKeyCredentialProvider *platformProvider =
	    [[ASAuthorizationPlatformPublicKeyCredentialProvider alloc]
	        initWithRelyingPartyIdentifier:input.rp().id_()];

	ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest
	    *platformKeyRequest = [platformProvider
	        createCredentialRegistrationRequestWithChallenge:
	            [AmplifyRtnPasskeysBase64UrlTranscoder
	                base64UrlDecode:input.challenge()]
	                                                    name:input.user().name()
	                                                  userID:
	                                                      [AmplifyRtnPasskeysBase64UrlTranscoder
	                                                          base64UrlDecode:
	                                                              input.user()
	                                                                  .id_()]];

	NSMutableArray<ASAuthorizationPlatformPublicKeyCredentialDescriptor *>
	    *excludedCredentials = [NSMutableArray array];

	if (@available(iOS 16.0, *)) {
		if (input.excludeCredentials().has_value()) {
			auto credentials = input.excludeCredentials().value();

			for (const auto &credential : credentials) {
				ASAuthorizationPlatformPublicKeyCredentialDescriptor *pkcDescriptor =
				    [[ASAuthorizationPlatformPublicKeyCredentialDescriptor alloc]
				        initWithCredentialID:[AmplifyRtnPasskeysBase64UrlTranscoder
				                                 base64UrlDecode:credential.id_()]];

				[excludedCredentials addObject:pkcDescriptor];
			}
		}

		platformKeyRequest.excludedCredentials = excludedCredentials;
	}

	ASAuthorizationController *authController = [[ASAuthorizationController alloc]
	    initWithAuthorizationRequests:@[ platformKeyRequest ]];

	authController.delegate = self;
	authController.presentationContextProvider = self;

	[authController performRequests];
}

- (void)getPasskey:(JS::NativeAmplifyRtnPasskeys::PasskeyGetOptionsJson &)input
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {

	if (self.handler)
		return;

	self.handler = [[AmplifyRtnPasskeysHandler alloc] initWithResolve:resolve
	                                                           reject:reject];

	ASAuthorizationPlatformPublicKeyCredentialProvider *platformProvider =
	    [[ASAuthorizationPlatformPublicKeyCredentialProvider alloc]
	        initWithRelyingPartyIdentifier:input.rpId()];
	ASAuthorizationPlatformPublicKeyCredentialAssertionRequest
	    *platformKeyRequest =
	        [platformProvider createCredentialAssertionRequestWithChallenge:
	                              [AmplifyRtnPasskeysBase64UrlTranscoder
	                                  base64UrlDecode:input.challenge()]];

	ASAuthorizationController *authController = [[ASAuthorizationController alloc]
	    initWithAuthorizationRequests:@[ platformKeyRequest ]];

	authController.delegate = self;
	authController.presentationContextProvider = self;

	[authController performRequests];
}

- (void)authorizationController:(ASAuthorizationController *)controller
    didCompleteWithAuthorization:(ASAuthorization *)authorization {

	id credential = authorization.credential;

	// Handle Registration Ceremony Success
	if ([credential
	        isKindOfClass:[ASAuthorizationPlatformPublicKeyCredentialRegistration
	                          class]]) {
		ASAuthorizationPlatformPublicKeyCredentialRegistration
		    *registrationCredential =
		        (ASAuthorizationPlatformPublicKeyCredentialRegistration *)
		            credential;

		NSDictionary *registrationResult = @{
			@"id" : [AmplifyRtnPasskeysBase64UrlTranscoder
			    base64UrlEncode:registrationCredential.credentialID],
			@"rawId" : [AmplifyRtnPasskeysBase64UrlTranscoder
			    base64UrlEncode:registrationCredential.credentialID],
			@"type" : PUBLIC_KEY_TYPE,
			@"response" : @{
				@"attestationObject" : [AmplifyRtnPasskeysBase64UrlTranscoder
				    base64UrlEncode:registrationCredential.rawAttestationObject],
				@"clientDataJSON" : [AmplifyRtnPasskeysBase64UrlTranscoder
				    base64UrlEncode:registrationCredential.rawClientDataJSON],
				@"transports" : @[ INTERNAL_TRANSPORT ]
			}
		};

		self.handler.resolve(registrationResult);
		self.handler = nil;

		return;
	}

	// Handle Authentication Ceremony Success
	if ([credential
	        isKindOfClass:[ASAuthorizationPlatformPublicKeyCredentialAssertion
	                          class]]) {
		ASAuthorizationPlatformPublicKeyCredentialAssertion *assertionCredential =
		    (ASAuthorizationPlatformPublicKeyCredentialAssertion *)credential;

		NSDictionary *assertionResult = @{
			@"id" : [AmplifyRtnPasskeysBase64UrlTranscoder
			    base64UrlEncode:assertionCredential.credentialID],
			@"rawId" : [AmplifyRtnPasskeysBase64UrlTranscoder
			    base64UrlEncode:assertionCredential.credentialID],
			@"type" : PUBLIC_KEY_TYPE,
			@"response" : @{
				@"authenticatorData" : [AmplifyRtnPasskeysBase64UrlTranscoder
				    base64UrlEncode:assertionCredential.rawAuthenticatorData],
				@"clientDataJSON" : [AmplifyRtnPasskeysBase64UrlTranscoder
				    base64UrlEncode:assertionCredential.rawClientDataJSON],
				@"signature" : [AmplifyRtnPasskeysBase64UrlTranscoder
				    base64UrlEncode:assertionCredential.signature]
			},
			@"authenticatorAttachment" : PLATFORM_ATTACHMENT
		};

		self.handler.resolve(assertionResult);
		self.handler = nil;

		return;
	}

	// handle failure
	self.handler.reject(@"NOT_HANDLED", nil, nil);
	self.handler = nil;
}

- (void)authorizationController:(ASAuthorizationController *)controller
           didCompleteWithError:(NSError *)error {
	// handle errors

	NSString *errorName = ERROR_MAP[@(error.code)] ?: @"UNKNOWN";
	NSString *errorMessage = error.localizedDescription;

	if ([errorMessage containsString:@"not associated with domain"]) {
		errorName = @"RELYING_PARTY_MISMATCH";
	}

	self.handler.reject(errorName, errorMessage, error);
	self.handler = nil;
}

- (nonnull ASPresentationAnchor)presentationAnchorForAuthorizationController:
    (nonnull ASAuthorizationController *)controller {
	return ASPresentationAnchor();
}

- (nonnull NSNumber *)getIsPasskeySupported {
	if (@available(iOS 15.0, *)) {
		return @YES;
	}
	return @NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
	return std::make_shared<facebook::react::NativeAmplifyRtnPasskeysSpecJSI>(
	    params);
}

@end

@implementation AmplifyRtnPasskeysHandler

- (instancetype)initWithResolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
	self = [super init];
	if (self) {
		_resolve = resolve;
		_reject = reject;
	}
	return self;
}

@end

@implementation AmplifyRtnPasskeysBase64UrlTranscoder
+ (NSString *)base64UrlEncode:(NSData *)data {
	NSString *base64String = [data base64EncodedStringWithOptions:0];

	base64String = [base64String stringByReplacingOccurrencesOfString:@"/"
	                                                       withString:@"_"];
	base64String = [base64String stringByReplacingOccurrencesOfString:@"+"
	                                                       withString:@"-"];
	base64String = [base64String stringByReplacingOccurrencesOfString:@"="
	                                                       withString:@""];

	return base64String;
}

+ (NSData *)base64UrlDecode:(NSString *)base64UrlString {
	NSString *base64String =
	    [base64UrlString stringByReplacingOccurrencesOfString:@"_"
	                                               withString:@"/"];

	base64String = [base64String stringByReplacingOccurrencesOfString:@"-"
	                                                       withString:@"+"];

	NSUInteger padLength = 4 - (base64String.length % 4);

	if (padLength < 4) {
		base64String =
		    [base64String stringByPaddingToLength:base64String.length + padLength
		                               withString:@"="
		                          startingAtIndex:0];
	}

	return [[NSData alloc] initWithBase64EncodedString:base64String options:0];
}

@end
