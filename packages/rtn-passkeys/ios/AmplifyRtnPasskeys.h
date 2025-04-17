
#import "generated/AmplifyRtnPasskeysSpec/AmplifyRtnPasskeysSpec.h"
#import <AuthenticationServices/AuthenticationServices.h>

@interface AmplifyRtnPasskeysHandler : NSObject

@property (nonatomic, copy) RCTPromiseResolveBlock resolve;
@property (nonatomic, copy) RCTPromiseRejectBlock reject;

- (instancetype) initWithResolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

@end

@interface AmplifyRtnPasskeys : NSObject <NativeAmplifyRtnPasskeysSpec, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding>

@property (nonatomic, strong) AmplifyRtnPasskeysHandler *handler;

@end

@interface AmplifyRtnPasskeysBase64UrlTranscoder : NSObject
	+ (NSString *)base64UrlEncode:(NSData *)string;
	+ (NSData *)base64UrlDecode:(NSString *)base64UrlString;
@end
