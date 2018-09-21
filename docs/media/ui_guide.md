---
---

# UI Components

## Overview 

AWS Amplify provides drop-in UI components with a [style guide](https://aws-amplify.github.io/media/ui_library) for your apps that automatically integrate with your configured cloud services. 
- [Higher Order Components](https://reactjs.org/docs/higher-order-components.html) (HOC) for both React and React Native applications. 
 - Angular components
 - Ionic components

## Authentication

User interface elements that provide drop-in components for user authentication. By defaulthese copmonents will use Amazon Cognito

### Authenticator

The Authenticator is a drop-in UI component that provides:

 - User Sign in
 - User Sign up
 - User Sign out
 - Forgot Password
 - Federated authentication
 - MFA (Multi-Factor Authentication) e.g. SMS, Email, and TOTP (Temporary One Time Password)
 - Confirm MFA Code's and Provide QR codes for TOTP

> React (aws-amplify-react) and React native (aws-amplify-react-native) provide HOCs for Authentication via [withAuthenticator]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide#using-components-in-react). Angular and Ionic provide components and service provider.


Available for [React]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide#using-components-in-react), [Angular/Ionic]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/ionic_guide#authenticator), and [Vue]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/vue_guide#authentication-components)

## Storage 

User interface elements that provide drop-in components for image uploading and viewing. By default copmonents will use Amazon S3.

### Photo Picker

The Photo Picker is a drop-in Ui component that provides:

 - File chooser
 - Image UI preview
 - Image upload
 - Events for file chosen and upload

Available for [React]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide#picker) or [Angular]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide#photo-picker), and [Vue]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/vue_guide#storage-components)

### Album

The Album is a drop-in UI component that provides:

 - Image listing
 - Events for image selection with URLs

Available for [React]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide#s3album) or [Angular]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide#s3-album), and [Vue]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/vue_guide#storage-components)

## Interactions

User interface elements that provide drop-in components for AI enabled chat bot interactions. By default copmonents will use Amazon Lex.

### Chatbot

The Chatbot is a drop-in UI component that provides:

 - Conversaion UI
 - Events for conversation complete

Available for [React]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/interactions_guide#using-with-react), [React Native]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/interactions_guide#using-with-react-native), [Angular]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/angular_guide#interactions), [Ionic]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/ionic_guide#interactions), and [Vue]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/vue_guide#interaction-components)
