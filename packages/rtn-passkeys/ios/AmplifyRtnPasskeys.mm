#import "AmplifyRtnPasskeys.h"
#import "AmplifyRtnPasskeys-Swift.h"

@implementation AmplifyRtnPasskeys

- (void)createPasskey:
            (JS::NativeAmplifyRtnPasskeys::PasskeyCreateOptionsJson &)input
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {

	NSMutableDictionary *rawInput = [@{
		@"challenge" : input.challenge(),
		@"rp" : @{@"id" : input.rp().id_()},
		@"user" : @{@"id" : input.user().id_(), @"name" : input.user().name()},
	} mutableCopy];
	
	NSMutableArray *excludeCredentials = [NSMutableArray array];
	
	if (input.excludeCredentials().has_value()) {
		auto credentials = input.excludeCredentials().value();
		for (const auto &credential : credentials) {
			[excludeCredentials addObject:@{ @"id": credential.id_() }];
		}
	}
	
	rawInput[@"excludeCredentials"] = excludeCredentials;
	

  return [[AmplifyRtnPasskeysHelper alloc] createPasskey:rawInput
                                                 resolve:resolve
                                                  reject:reject];
}

- (void)getPasskey:(JS::NativeAmplifyRtnPasskeys::PasskeyGetOptionsJson &)input
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {

	NSMutableDictionary *rawInput = [@{
		@"rpId" : input.rpId(),
		@"challenge" : input.challenge(),
		@"userVerification" : input.userVerification()
	} mutableCopy];
	
	NSMutableArray *allowCredentials = [NSMutableArray array];
	
	if (input.allowCredentials().has_value()) {
		auto credentials = input.allowCredentials().value();
		for (const auto &credential : credentials) {
			[allowCredentials addObject:@{ @"id": credential.id_() }];
		}
	}
	
	rawInput[@"allowCredentials"] = allowCredentials;

  return [[AmplifyRtnPasskeysHelper alloc] getPasskey:rawInput resolve:resolve reject:reject];
}

- (nonnull NSNumber *)getIsPasskeySupported {
  return [AmplifyRtnPasskeysHelper getIsPasskeySupported];
}

+ (NSString *)moduleName {
  return @"AmplifyRtnPasskeys";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
	return std::make_shared<facebook::react::NativeAmplifyRtnPasskeysSpecJSI>(params);
}

@end
