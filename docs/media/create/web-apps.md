---
layout: examples
---
# Web Apps with AWS Amplify

#### AWS Amplify helps developers to create high-quality web apps quickly

AWS Amplify handles the heavy lifting of configuring and integrating cloud services behind the scenes. It provides a powerful high-level API and ready-to-use best practices.
{: style="font-size:20px;"}

### What's in it for Web Developers?

For Web developers, AWS Amplify provides following main benefits:

- **Easy integration** with cloud operations with declarative API
- **CLI support** for bootstrapping your app backend quickly
- **Local configuration and deployment** of your app's backend logic
- **Deployment** of static assets for hosting and streaming
- **UI components** for common operations such as Authorization and Storage
- **Monitoring** app usage and **engaging** users with campaign analytics

###  Building and Deploying Web Apps with AWS Amplify

When building serverless web apps with AWS Amplify, your frontend resources are deployed for hosting, and your app's backend will be handled by cloud services that you integrate.

Cloud services to build serverless web apps are usually described as BaaS (backend as a service). Serverless apps will allow you to focus on your requirements without worrying about managing server resources or paying for unused capacity.

#### Declarative and easy-to-use API

AWS Amplify's declarative API is focused on the interactions with data, rather than specific implementations of cloud operations.

With AWS Amplify, you can focus more on your app's business logic, and let the standard functionality like authorization, user management, storage, notifications and analytics is handled for you by the cloud.

As an example, here is how you upload an image to a logged-in user's private storage:

```js
    Storage.put('example.png', file, {
        level: 'private',
        contentType: 'image/png'
    })
```

In the example, AWS Amplify Storage category already knows about the authenticated user context, your Amazon S3 buckets and request signing requirements for added security. All the underlying process is managed automatically under the hood, and you get what you want; uploading a user file to a protected location.

#### Command line support

Amplify CLI helps you to configure your app's backend easily. For example, the following command will create a cloud API which is an Amazon API Gateway endpoint:

```bash
amplify add api
```

Amplify CLI creates the necessary folder structure and generates JavaScript files for your app's backend:

![Performance Results](../images/backend_cloud_api.png?raw=true "Performance Results")

After working with your backend code, deploying your app backend is very simple with CLI:

```bash
amplify push
```

#### Manage your Backend with Amplify CLI

If you have existing AWS resources such as Amazon API Gateway endpoints or Amazon S3 buckets, you can use them with AWS Amplify.

Otherwise, Amplify CLI is a great tool for creating AWS resources, related user roles, and security policies.

Mix and match building blocks for your app, and start implementing cloud operations like Authorization, Storage and Cloud API.  

Syncing your latest backend configuration with your local app project is simple with the CLI:

```bash
amplify push
```

#### Deploy your Web App

Amplify CLI provides a one-line deploy command that pushes your app's static assets to the Content Delivery Network (CDN). This is your apps' hosting environment with media streaming features.

Using a CDN dramatically increases your app's loading performance by serving static assets to your users from the nearest edge location.

With Amplify CLI, you can deploy your app with single line command:

```bash
amplify publish
```
Amazon CloudFront will handle the delivery of your static assets to the browser.

![CDN](../images/mobile_hub_cdn.png?raw=true "CDN")

If your web app resources include media files like video or audio, those assets will be automatically streamed to the browser, providing the best user experience.

#### Monitor your Web App's Loading Performance

Every time you deploy your app to hosting, a performance test will be automatically executed using real devices. The test results will show the initial load times for your app.

![Performance Results](../images/performance_results.png?raw=true "Performance Results")

#### Use your Favorite Frontend Library

AWS Amplify provides UI components for React and Angular, so you can import AWS Amplify modules easily and use the UI components for Authentication and Storage categories. (Vue.js components support is coming soon.)

In a React app, you can also use a Higher-Order Components to provide a sign-in/sign-out experience simply by wrapping your app's main component:

```js
export default withAuthenticator(App);
```

In Angular, you can use Authenticator UI component to enable the same auth experience:

```html
<amplify-authenticator></amplify-authenticator>
```

#### Engage your audience

Once you have deployed your web app, the next challenge is understanding how your users are interacting with your app.

AWS Amplify provides analytics capabilities, push notifications and targeted messaging campaigns out-of-the-box. You will start getting key engagement metrics such as the number of user sessions and the number of app launches automatically after you deploy your app.

Also, collecting more data with Analytics category is as simple as;

```js
Analytics.record('albumVisit', { genre: 'jazz', artist: 'Miles Davis' });
```

Analytics events are displayed in Amazon Pinpoint console. In the console, you can create targeted campaigns and push notifications to engage your customers.   

![Pinpoint](../images/pinpoint_analytics.png?raw=true "Pinpoint")

#### Utilities

AWS Amplify comes with additional utility modules that will help you to build better-quality apps and PWAs (Progressive Web Apps) that benefits local cache, notifications, and service workers.

### Start Building now!

Start building your Web app today with AWS Amplify by visiting our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start?utm_source=web-apps&utm_campaign=build-pages).
{: .next-link .callout .callout--info}
