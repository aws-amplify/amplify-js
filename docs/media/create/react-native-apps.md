---
layout: examples
---

# React Native apps with AWS Amplify

### AWS Amplify helps mobile developers to create cloud-powered React Native apps quickly.

When working with React Native, AWS Amplify handles the heavy lifting of configuring and integrating cloud services for you. It provides a powerful API and React Native components to speed-up your development.
{: style="font-size:20px;"}

### What's in it for React Native Developers?

With AWS Amplify's cloud connectivity support, you can create your apps quickly and deliver the best experience for your users. For React Native developers, AWS Amplify provides following main benefits:

- **Easy integration** with cloud operations using declarative API
- **CLI support** for bootstrapping your app backend quickly
- **Local configuration and deployment** of your app's backend logic
- **Security best-practices** with out-of-the-box implementations
- **React Native UI components** for common operations such as authorization and storage
- **Monitoring** app usage and **engaging** users with campaign analytics

###  Building React Native Apps with AWS Amplify

React Native gives you the flexibility of creating multi-platform native mobile experiences with JavaScript. Unlike [hybrid mobile apps]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/create/hybrid-mobile-apps) that run on a browser view,  React Native apps run on a faster runtime environment which has better integration with native capabilities of the device. 

When building React Native apps, your app bundle is deployed to the app stores, and your mobile app's backend logic will be handled by cloud operations that you integrate with AWS Amplify.

Cloud services for mobile apps are often categorized as MBaaS (mobile back-end as a service).  AWS Amplify offers MBaaS functionality for various categories of cloud operations so that you can create your mobile app backend easily.

#### Declarative and easy-to-use API

AWS Amplify's declarative API is focused on the interactions with data, rather than specific implementations of cloud operations.

With AWS Amplify, you can concentrate more on your app's business logic, while your backend features like authorization, user management, storage, notifications, and analytics are handled for you by cloud services.

As an example, here is how you upload an image to a logged-in user's private storage:

```js
    Storage.put('example.png', file, {
        level: 'private',
        contentType: 'image/png'
    })
```

In this example, AWS Amplify Storage category already knows about the authenticated user context, your Amazon S3 buckets and request signing requirements for security. All the underlying operations are executed automatically under the hood, and you get what you want; uploading a user file to a secure location.

#### CLI support

Amplify CLI helps you to configure your app's backend easily. For example, the following command will create a cloud API which is an Amazon API Gateway endpoint:

```bash
amplify add api
```

Amplify CLI generates JavaScript files for your app's backend logic, and places them to the appropriate folder structure in your project. 

![Performance Results](../images/backend_cloud_api.png?raw=true "Performance Results")

After working with your backend code, deploying your app backend is very simple with the CLI:

```bash
amplify push
```

#### Manage your Backend with Amplify CLI

If you have existing AWS resources such as Amazon API Gateway endpoints or Amazon S3 buckets, you can use them with AWS Amplify by setting up resource credentials in your app's configuration.

Alternatively, Amplify CLI is an excellent tool for creating AWS resources, related user roles, and security policies.

Syncing your latest backend configuration with your local app project is simple with the CLI:

```bash
amplify push
```

#### React Native components

To speed-up your React Native development, AWS Amplify provides UI components.  You can import the UI components and use out-of-the box functionality for Authentication and Storage categories. 

As an example, in you React Native app, you can use a Higher-Order Components to provide a sign-in/sign-out experience for your app simply by wrapping your app's main component:

```js
export default withAuthenticator(App);
```

#### Engage your audience

Once you have deployed your web app, the next challenge will be monitoring your users' interaction with your app.

AWS Amplify provides analytics, push notifications and targeted messaging capabilities out-of-the-box. You will start receiving key engagement metrics such as the number of user sessions and the number of app launches automatically after you deploy your app.

Also, collecting more data with Analytics category is simple:

```js
Analytics.record('albumVisit', { genre: 'jazz', artist: 'Miles Davis' });
```
Analytics events are displayed in Amazon Pinpoint console. In the console, you can create targeted campaigns and send push notifications to engage your customers.

![Performance Results](../images/pinpoint_analytics.png?raw=true "Performance Results")

#### Utilities

AWS Amplify comes with additional utility modules that will help you to build better React Native apps with local cache, notifications, and more.

### Start Building a React Native app now!

Start building your Web app today with AWS Amplify by visiting our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start?platform=react-native&utm_source=web-apps&utm_campaign=build-pages).
{: .next-link .callout .callout--info}
