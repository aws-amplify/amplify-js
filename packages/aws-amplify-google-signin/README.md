
# react-native-aws-amplify-google-signin

## Getting started

`$ npm install react-native-aws-amplify-google-signin --save`

### Mostly automatic installation

`$ react-native link react-native-aws-amplify-google-signin`

### Manual installation


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

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNAwsAmplifyGoogleSignin.sln` in `node_modules/react-native-aws-amplify-google-signin/windows/RNAwsAmplifyGoogleSignin.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using Aws.Amplify.Google.Signin.RNAwsAmplifyGoogleSignin;` to the usings at the top of the file
  - Add `new RNAwsAmplifyGoogleSigninPackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNAwsAmplifyGoogleSignin from 'react-native-aws-amplify-google-signin';

// TODO: What to do with the module?
RNAwsAmplifyGoogleSignin;
```
  