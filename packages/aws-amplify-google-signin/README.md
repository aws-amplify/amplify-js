
# react-native-aws-amplify-google-signin

## Getting started

`$ npm install react-native-aws-amplify-google-signin --save`

### Mostly automatic installation

`$ react-native link react-native-aws-amplify-google-signin`

### Manual installation (you can skip this if you use npm install as mentioned above)


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-aws-amplify-google-signin` and add `RNAwsAmplifyGoogleSignin.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNAwsAmplifyGoogleSignin.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNAwsAmplifyGoogleSigninPackage;` to the imports at the top of the file
  - Add `new RNAwsAmplifyGoogleSigninPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-aws-amplify-google-signin'
  	project(':react-native-aws-amplify-google-signin').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-aws-amplify-google-signin/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-aws-amplify-google-signin')
  	```


#Google Sign-In for React Native

##Installation for iOS

1. react-native init myApp

2. npm install --save aws-amplify
3. npm install --save aws-amplify-react-native
4. npm install --save react-native-aws-amplify-google-signin
5. react-native link aws-amplify-react-native
6. Install the required SDKs using CocoaPods :
```
cd ios
pod init
vi Podfile 
```

7. Add the following pods for target myApp: 
```
  pod 'GoogleSignIn'
  pod 'GoogleAppUtilities'
  pod 'GoogleAuthUtilities'
  pod 'GoogleNetworkingUtilities'
  pod 'GoogleSymbolUtilities'
  pod 'GoogleUtilities'
```
8. Save changes to your Podfile, and run: 
```
pod install
```
9. Now open your project in xcode using myApp.xcworkspace
10. Add a new URL with the Identifier and URL schemes set to your app's REVERSED_CLIENT_ID(found inside GoogleService-Info.plist file), like so:

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/xcode-adding-url-types.png" width="100%"/>


 Note: If you already have your app configured on Google Developer console, then just download the plist file for your OAuth Client. If you haven't set up your Client IDs for your app, follow : https://developers.google.com/identity/sign-in/ios/sdk/ to get your app setup with a web client, iOS client and Android client.


 Now execute react-native run-ios to log into your App with Google Signin! 


---------------------------------------------
Android set up : 

1. npm install --save aws-amplify
2. npm install --save aws-amplify-react-native
3. react-native link aws-amplify-react-native
4. Add your app's google-services.json file to android/app folder.
5. Change your android/build.gradle to have : 
allprojects {
    repositories {
        
        maven { //add this to avoid issues with firebase
            url 'https://maven.google.com'
        }
       
    }
}
6.







6. In your App.js add the following imports and configure Amplify: 
```
import Amplify from 'aws-amplify';
import {withAuthenticator} from 'aws-amplify-react-native';
import {awsmobile} from './aws-exports';
Amplify.configure(awsmobile);
```

7. Wrap your app inside the withAuthenticator HOC:
```
const AppWithAuth = withAuthenticator(App);

const federated = {
  google_ios_client_id: '886205636996-fhprhdm8auutm34ssstbjdkq59bit3ek.apps.googleusercontent.com',
  google_web_client_id: '886205636996-rai4kpc3g7lg0kd66htrce63q3ub8315.apps.googleusercontent.com'
};
const FederatedApp = () => { return <AppWithAuth federated = {federated}/>}
export default FederatedApp
```



  