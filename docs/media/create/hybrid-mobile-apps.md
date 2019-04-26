---
layout: examples
---
# Hybrid Mobile apps with AWS Amplify

#### AWS Amplify helps web developers to build cloud-powered hybrid mobile apps quickly.

Hybrid development based on Apache Cordova is an easy path to create mobile apps. AWS Amplify makes it even easier by handling the creation, configuration, and integration of cloud services.
{: style="font-size:20px;"}

### What's in it for Hybrid Mobile Developers?

For hybrid mobile developers, AWS Amplify provides following main benefits:

- **Easy integration** for cloud operations with declarative API 
- **CLI support** for bootstrapping your app backend quickly
- **Local configuration and deployment** of your app's backend logic
- **UI components** for common operations such as Authorization and Storage
- **Monitoring** app usage and **engaging** users with campaign analytics

###  Building Hybrid Mobile Apps with AWS Amplify

Hybrid mobile development gives you the flexibility of creating multi-platform mobile apps with the tools and technologies you use for Web development. Combined with AWS Amplify's cloud services support, you can create your apps faster and iterate quickly to provide the best experience for your customers.

Creating a web app with JavaScript, CSS and HTML5 and packaging it as a mobile app for distribution is an exciting idea for many developers. Indeed, this is the easiest way to build a mobile app if you are familiar with web development. 

When building hybrid mobile apps with AWS Amplify, your app resources are bundled and deployed with the toolchain of your preference, and your app's backend integration will be handled by AWS Amplify. 

You can import AWS Amplify in your Cordova or PhoneGap project to start working with your backend. In addition, AWS Amplify provides Angular components which you can use with Ionic.

#### Declarative and easy-to-use API

AWS Amplify's declarative API is focused on the interactions with data, rather than specific implementations of cloud operations.

With AWS Amplify, you can focus more on your app's business logic and your end-user requirements, and let the standard functionality like authorization, user management, storage, notifications and analytics is handled for you.

As an example, here is how you upload an image to a logged-in user's private storage:

```js
    Storage.put('example.png', file, {
        level: 'private',
        contentType: 'image/png'
    })
```

In this example, AWS Amplify Storage category already knows about the authenticated user context, your Amazon S3 buckets and request signing requirements for added security. All the underlying process is managed automatically under the hood, and you get what you want; uploading a user file to a protected location.

#### CLI support

Amplify CLI helps you to configure your app's backend easily. For example, the following command will create a cloud API which is an Amazon API Gateway endpoint:

```bash
amplify add api
```

Amplify CLI creates the necessary folder structure and generates JavaScript files for your app's backend logic:

![Performance Results](../images/backend_cloud_api.png?raw=true "Performance Results")

After working with your backend code, deploying your app backend is very simple with CLI:

```bash
amplify push
```

#### Manage your Backend with Amplify CLI

If you have existing AWS resources such as Amazon API Gateway endpoints or Amazon S3 buckets, you can use them with AWS Amplify by setting up resource credentials in your app's configuration. 

Otherwise, AWS Amplify CLI is a great tool for creating AWS resources, related user roles, and security policies.

Mix and match building blocks for app's backend, and start working with cloud operations like Authorization, Storage and Cloud API.

Syncing your latest backend configuration with your local app project is simple with the CLI:

```bash
amplify push
```

#### Use your Favorite Frontend Library

AWS Amplify provides UI components for React, Angular and Ionic, so you can import AWS Amplify modules easily and use UI components for Authentication and Storage categories. (Vue.js components support is coming soon.)

In a React app, you can use a Higher-Order Components to provide a sign-in/sign-out experience for your app simply by wrapping your app's main component:

```js
export default withAuthenticator(App);
```

In Angular or Ionic, you can use Authenticator UI component in your view to provide the same auth experience:

```html
<amplify-authenticator></amplify-authenticator>
```

#### Engage your audience

Once you have deployed your web app, the next challenge is understanding how your users are interacting with your app.

AWS Amplify provides built-in analytics, push notifications and targeted messaging. You will start getting key engagement metrics such as the number of user sessions and the number of app launches automatically after you deploy your app.

Also, collecting more data with Analytics category is as simple as;

```js
Analytics.record('albumVisit', { genre: 'jazz', artist: 'Miles Davis' });
```

Analytics events are displayed in Amazon Pinpoint console. In the console, you can create targeted campaigns and push notifications to engage your customers.

![Pinpoint](../images/pinpoint_analytics.png?raw=true "Pinpoint")

#### Utilities

AWS Amplify comes with additional utility modules that will help you to build better-quality hybrid mobile apps.

### Start Building now!

Start building your hybrid mobile app with AWS Amplify by visiting our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start?utm_source=hybrid-mobile-apps&utm_campaign=build-pages).
{: .next-link .callout .callout--info}
