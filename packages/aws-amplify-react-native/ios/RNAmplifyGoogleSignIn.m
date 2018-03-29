
#import "RNAmplifyGoogleSignIn.h"

@implementation RNAmplifyGoogleSignIn

RCT_EXPORT_MODULE();
@synthesize bridge = _bridge;

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"RNGoogleSignInError",@"RNGoogleSignInSuccess",@"RNGoogleSignInWillDispatch",@"RNGoogleRevokeError",@"RNGoogleRevokeSuccess"];
}

RCT_EXPORT_METHOD(configure:(NSArray*)scopes iosClientId:(NSString*)iosClientId webClientId:(NSString*)webClientId hostedDomain:(NSString*)hostedDomain)
{
    [GIDSignIn sharedInstance].delegate = self;
    [GIDSignIn sharedInstance].uiDelegate = self;
    
    
    [GIDSignIn sharedInstance].scopes = scopes;
    [GIDSignIn sharedInstance].clientID = iosClientId;
    
    if (hostedDomain != nil) {
        [GIDSignIn sharedInstance].hostedDomain = hostedDomain;
    }
    if ([webClientId length] != 0) {
        [GIDSignIn sharedInstance].serverClientID = webClientId;
    }
}

RCT_EXPORT_METHOD(currentUserAsync)
{
    [[GIDSignIn sharedInstance] signInSilently];
}

RCT_EXPORT_METHOD(signIn)
{
    [[GIDSignIn sharedInstance] signIn];
}

RCT_EXPORT_METHOD(signOut)
{
    [[GIDSignIn sharedInstance] signOut];
}

- (void)signIn:(GIDSignIn *)signIn didSignInForUser:(GIDGoogleUser *)user withError:(NSError *)error {
    
    if (error != Nil) {
        return [self sendEventWithName:@"RNGoogleSignInError" body:@{
                                                                     @"message": error.description,
                                                                     @"code": [NSNumber numberWithInteger: error.code]
                                                                     }];
        
    }
    
    NSURL *imageURL;
    
    if ([GIDSignIn sharedInstance].currentUser.profile.hasImage)
    {
        imageURL = [user.profile imageURLWithDimension:120];
    }
    
    NSDictionary *body = @{
                           @"name": user.profile.name,
                           @"givenName": user.profile.givenName,
                           @"familyName": user.profile.familyName,
                           @"id": user.userID,
                           @"photo": imageURL ? imageURL.absoluteString : [NSNull null],
                           @"email": user.profile.email,
                           @"idToken": user.authentication.idToken,
                           @"accessToken": user.authentication.accessToken,
                           @"serverAuthCode": user.serverAuthCode ? user.serverAuthCode : [NSNull null],
                           @"accessTokenExpirationDate": [NSNumber numberWithDouble:user.authentication.accessTokenExpirationDate.timeIntervalSinceNow]
                           };
    
    return [self sendEventWithName:@"RNGoogleSignInSuccess" body:body];
}

- (void) signInWillDispatch:(GIDSignIn *)signIn error:(NSError *)error {
    
    return [self sendEventWithName:@"RNGoogleSignInWillDispatch" body:@{}];
}

- (void)signIn:(GIDSignIn *)signIn didDisconnectWithUser:(GIDGoogleUser *)user withError:(NSError *)error {
    if (error != Nil) {
        return [self sendEventWithName:@"RNGoogleRevokeError" body:@{
                                                                     @"message": error.description,
                                                                     @"code": [NSNumber numberWithInteger: error.code]
                                                                     }];
    }
    
    return [self sendEventWithName:@"RNGoogleRevokeSuccess" body:@{}];
}

- (void) signIn:(GIDSignIn *)signIn presentViewController:(UIViewController *)viewController {
    UIViewController *parent = [self topMostViewController];
    [parent presentViewController:viewController animated:true completion:nil];
}

- (void) signIn:(GIDSignIn *)signIn dismissViewController:(UIViewController *)viewController {
    [viewController dismissViewControllerAnimated:true completion:nil];
}

+ (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    
    return [[GIDSignIn sharedInstance] handleURL:url
                               sourceApplication:sourceApplication
                                      annotation:annotation];
}

#pragma mark - Internal Methods

- (UIViewController *)topMostViewController {
    UIViewController *topController = [UIApplication sharedApplication].keyWindow.rootViewController;
    while (topController.presentedViewController) {
        topController = topController.presentedViewController;
    }
    return topController;
}

@end
