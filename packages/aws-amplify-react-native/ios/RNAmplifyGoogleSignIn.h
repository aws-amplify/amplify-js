#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <GoogleSignIn/GoogleSignIn.h>

@interface RNAmplifyGoogleSignIn :  RCTEventEmitter <RCTBridgeModule, GIDSignInDelegate>

@end
