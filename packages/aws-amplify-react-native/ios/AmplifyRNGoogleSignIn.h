//
//  AmplifyRNGoogleSignIn.h
//  natmodule
//
//  Created by Sharma, Nidhi on 3/13/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <GoogleSignIn/GoogleSignIn.h>
#import <React/RCTEventEmitter.h>

@interface AmplifyRNGoogleSignIn :  RCTEventEmitter <RCTBridgeModule, GIDSignInDelegate>

@end
