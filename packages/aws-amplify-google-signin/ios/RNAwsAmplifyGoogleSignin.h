#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <GoogleSignIn/GoogleSignIn.h>

@interface RNAwsAmplifyGoogleSignin :  RCTEventEmitter <RCTBridgeModule, GIDSignInDelegate>

@end
