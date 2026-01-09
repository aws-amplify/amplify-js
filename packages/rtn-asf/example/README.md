# @aws-amplify/rtn-asf Example

This is a React Native example app for testing the `@aws-amplify/rtn-asf` native module.

## Setup

1. Install dependencies:
```bash
cd packages/rtn-asf/example
yarn install
```

2. For iOS, install pods:
```bash
cd ios
pod install
```

## Running the App

### Android
```bash
yarn android
```

### iOS
```bash
yarn ios
```

## Running Tests

### Android Unit Tests
From the `packages/rtn-asf` directory:
```bash
yarn test:android
```

Or directly:
```bash
cd example/android
./gradlew test -i
```

### iOS Unit Tests
From the `packages/rtn-asf` directory:
```bash
yarn test:ios
```

Or directly using xcodebuild:
```bash
xcodebuild test -quiet -workspace example/ios/AmplifyRtnAsfExample.xcworkspace -destination 'platform=iOS Simulator,name=iPhone 16' -scheme AmplifyRtnAsf-Unit-tests
```

Note: iOS tests require:
1. Running `pod install` in the `example/ios` directory first
2. An iOS Simulator with iPhone 16 available

## What This Example Tests

The example app provides a simple UI to test the ASF context data collection:

1. **Get Context Data** - Tests calling `getContextData` with valid userPoolId and clientId
2. **Test Empty UserPoolId** - Verifies that empty userPoolId returns null
3. **Test Empty ClientId** - Verifies that empty clientId returns null

The app displays:
- Whether the native module is available
- The result of each test (context data string or null)
- Any errors that occur
