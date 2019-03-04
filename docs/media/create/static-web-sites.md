---
layout: examples
---
# Static Websites with AWS Amplify

#### Deploy your Static Website with AWS Amplify

With AWS Amplify, you can easily deploy your website for hosting and streaming, and add other cloud services going forward.
{: style="font-size:20px;"}

### What's in it for Static Websites?

For static websites, AWS Amplify provides following main benefits:

- **One-command deployment** of your site with secure, CDN powered hosting
- **Streaming** support for your audio and video files
- **Testing** your website's loading times on real devices
- **Monitoring** and **engaging** users with campaign analytics
- **Adding cloud services** to your website quickly with the **CLI** 

###  Building Static Websites with AWS Amplify

When building static websites with AWS Amplify, your static assets are deployed to highly available globally CDN service for hosting and media streaming. 

If you wish to add new features such as user-signup, API access or analytics,  AWS Amplify enables you to integrate those features quickly. 

Our CLI will handle deployments and backend service orchestration, so you can focus on your content and user experience without worrying about managing server resources.

#### Deploy your Site with CLI

Amplify CLI provides a one-line deploy command that pushes your app's static assets to the Content Delivery Network (CDN). Using a CDN dramatically increases your app's loading performance by serving your content to your users from the nearest edge location.

```bash
amplify publish
```
CDN service, which is provided by Amazon CloudFront, will handle the high-performance delivery of your static assets.

![CDN](../images/mobile_hub_cdn.png?raw=true "CDN"){: style="max-height:450px;"}

If your website includes video or audio files, those assets will be automatically streamed to the browser.

#### Test your Site's Loading Performance

Every time you deploy your website, a performance test is executed using real devices. The test results will show the initial loading time for your website.

![Performance Results](../images/performance_results.png?raw=true "Performance Results")

#### Easily Add Cloud Features to your Website

Amplify CLI helps you to configure your website's backend easily. For example, the following command will create a cloud API which is an Amazon API Gateway endpoint:

```bash
amplify add api
```

Amplify CLI also creates the necessary folder structure and generates JavaScript files necessary for your app's backend logic:

After working with your backend code, deploying your web backend is very simple:

```bash
amplify push
```

#### Engage your audience

Once you deploy your website, the next challenge is understanding how your users are interacting with your website.

AWS Amplify provides analytics capabilities, push notifications and targeted messaging campaigns out-of-the-box. You will start getting key engagement metrics such as the number of user sessions and the number of app launches automatically after you deploy your website.

Analytics events are displayed in Amazon Pinpoint console. In the console, you can create targeted campaigns and push notifications to engage your customers.   

![Pinpoint](../images/pinpoint_analytics.png?raw=true "Pinpoint"){: style="max-height:450px;"}

### Start Building now!

Start building your static Web app today with AWS Amplify by visiting our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start?utm_source=static-web-sites&utm_campaign=build-pages).
{: .next-link .callout .callout--info}
