# Changelog for AWS Amplify
<!--LATEST=0.1.36-->
<!--ENTRYINSERT-->

## 01/31/2018
* aws-amplify - v0.2.0
    * Enhancement: Allow SignUp with validation data #182
    * Enhancement: Add .patch() interface to API #207
    * Enhancement: Number.isInteger #185
    * Enhancement: Add protected level to Storage #213
    * Bug fix: Cache configure keyPrefix #210
* aws-amplify-react - v0.1.32
    * Bug fix: S3Album private level #213
* aws-amplify-react-native - v0.2.0
    * Enahancement: Refactor to use core library instead of duplicate implemntation #200

## 01/18/2018
* aws-amplify - v0.1.36
    * Enhancement: Sign up with custom attributes #160
    * Bug fix: Api cred refresh #118
    * Bug fix: EndpointId for Pinpoint not get refreshed correctly #161
* aws-amplify-react - v0.1.31
    * Bug fix: Now S3Image can upload files to private folder #133
* aws-amplify-react-native - v0.1.24
    * Enahancement: Remove dependency from aws-mobile-analytics dependency #142
    * Enhancement: Sign up with custom attributes #160
    * Bug fix: EndpointId for Pinpoint not get refreshed correctly #161

## 01/16/2018
* aws-amplify - v0.1.35
    * Improvements to Typescript developer experience. #155
	* fix RN props #158
	* delete ama #142
* aws-amplify-react-native - v0.1.23
    * fix RN props #158

## 01/12/2018
* aws-amplify-react-native - v0.1.22
    * bug fix: fix aws-sdk package
## 01/11/2018
* aws-amplify - v0.1.34
    * bug fix: fix aws-sdk package
    * bug fix: update main script

## 01/09/2018

* aws-amplify - v0.1.32
* aws-amplify-react - v0.1.30
* aws-ampliify-react-native - v0.1.21

* Enhancement: remove aws-sdk-mobile-analytics dependency from package.json

## 01/08/2018

* aws-amplify - v0.1.31
* aws-amplify-react - v0.1.30
* aws-ampliify-react-native - v0.1.21

* Feature: Export Authenticator in aws-amplify-react-native
* Enhancement: Reduce bundle size by removing aws-mobile-analytics dependency
* Security issue: Change dependency on typedoc for security issue
* Bug fix: Timezone error for Windows
* Bug fix: Npm badge fix
* Bug fix: Doc syntax error fix
* Bug fix: Add charset on default header for API

## 12/22/2017

* aws-amplify - v0.1.30
* aws-amplify-react - v0.1.30
* aws-amplify-react-native - v0.1.20

* feature: Federated Authentication with Google and Facebook in React
* bugFix: Federated auth token fixes
* feature: Automatic S3 Analytics tracking with React components
* feature: Increase unit test coverage
* feature: Jest snapshot update
* feature: Update default auth theme
* feature: Export Signer interface for 3rd party HttpModules
* bugFix: aws-amplify-react-native: Update pinpoint region in React Native
* feature: Better support for guest (Unauthenticated) credentials
* bugFix: documentation: Fix broken link (to authentication)
