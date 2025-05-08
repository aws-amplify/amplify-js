#import "AmplifyRtnPasskeys.h"
#import "AmplifyRtnPasskeys-Swift.h"

@implementation AmplifyRtnPasskeys

- (void)createPasskey:
            (JS::NativeAmplifyRtnPasskeys::PasskeyCreateOptionsJson &)input
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {

	NSMutableArray *excludeCredentials = [@[] mutableCopy];

	if (input.excludeCredentials().has_value()) {
		auto credentials = input.excludeCredentials().value();
		for (const auto &credential : credentials) {
			[excludeCredentials addObject:credential.id_()];
		}
	}

	return [[AmplifyRtnPasskeysHelper alloc] createPasskey:input.rp().id_()
	                                                userId:input.user().id_()
	                                              userName:input.user().name()
	                                             challenge:input.challenge()
	                                    excludeCredentials:excludeCredentials
	                                               resolve:resolve
	                                                reject:reject];
}

- (void)getPasskey:(JS::NativeAmplifyRtnPasskeys::PasskeyGetOptionsJson &)input
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {

	NSMutableArray *allowCredentials = [@[] mutableCopy];

	if (input.allowCredentials().has_value()) {
		auto credentials = input.allowCredentials().value();
		for (const auto &credential : credentials) {
			[allowCredentials addObject:credential.id_()];
		}
	}

	return [[AmplifyRtnPasskeysHelper alloc] getPasskey:input.rpId()
	                                          challenge:input.challenge()
	                                   userVerification:input.userVerification()
	                                   allowCredentials:allowCredentials
	                                            resolve:resolve
	                                             reject:reject];
}

- (nonnull NSNumber *)getIsPasskeySupported {
	return [AmplifyRtnPasskeysHelper getIsPasskeySupported];
}

+ (NSString *)moduleName {
	return @"AmplifyRtnPasskeys";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
	return std::make_shared<facebook::react::NativeAmplifyRtnPasskeysSpecJSI>(
	    params);
}

@end
