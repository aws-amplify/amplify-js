# @aws-amplify/rtn-asf

React Native module for AWS Cognito Advanced Security Features (ASF) context data collection.

This package provides native modules for iOS and Android that collect device fingerprinting data for Cognito's risk-based authentication. The data is automatically included in authentication flows (sign-in, sign-up, password reset) when this package is installed.

## Installation

```bash
npm install @aws-amplify/rtn-asf
# or
yarn add @aws-amplify/rtn-asf
```

### iOS Setup

After installing the package, install the CocoaPods dependencies:

```bash
cd ios && pod install
```

### Android Setup

No additional setup required. The package uses autolinking.

## Expo Setup

This package requires native code and is not compatible with Expo Go. You must use one of the following approaches:

### Development Build (Recommended)

Use [Expo Development Client](https://docs.expo.dev/develop/development-builds/introduction/) to create a custom development build that includes native modules:

```bash
npx expo install @aws-amplify/rtn-asf
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

### Ejected/Bare Workflow

If you've ejected from Expo or are using the bare workflow, follow the standard React Native installation steps above.

## Bare React Native

This package supports React Native's autolinking. After installation:

1. **iOS**: Run `pod install` in your `ios` directory
2. **Android**: No additional steps required

Verify the module is linked by checking:
- **iOS**: `Podfile.lock` contains `AmplifyRtnAsf`
- **Android**: The package appears in your app's dependencies

## Requirements

- React Native >= 0.76 (New Architecture / TurboModules)
- iOS 13.0+
- Android API 24+

## Usage

This package is used internally by `@aws-amplify/auth`. When installed, the auth library automatically detects and uses it to collect device context data for Cognito Advanced Security Features.

No direct usage is required. Simply install the package and the auth flows will include device fingerprinting data automatically.

## How It Works

When you call authentication methods like `signIn`, `signUp`, or `resetPassword`, the Amplify Auth library:

1. Checks if `@aws-amplify/rtn-asf` is installed
2. If available, calls the native module to collect device context data
3. Includes the encoded data in the Cognito API request
4. Cognito uses this data for risk-based authentication decisions

If the package is not installed, authentication flows continue normally without the device context data.

## Troubleshooting

### Module not found

If you see errors about the module not being found:

1. Ensure the package is installed: `npm ls @aws-amplify/rtn-asf`
2. For iOS, run `pod install` in the `ios` directory
3. Rebuild your app completely (not just a hot reload)

### Expo Go

This package is not compatible with Expo Go. Use a development build or eject to bare workflow.

### React Native < 0.76

This package requires React Native 0.76 or later for TurboModule support. For older versions, device context data collection is not available.

## License

Apache-2.0
