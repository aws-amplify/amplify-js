---
---

# Hosting

AWS Amplify provides hosting for your Web app or static website.

## Installation and Configuration

Before start, please be sure that you have installed the CLI and client libraries by visiting [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config). 
{: .callout .callout--info}

**When you are done with the installation**, you can follow below steps to enable Storage category in your app.

## Deployment with CLI

You can use Amplify CLI to create a new web project and deploy it for hosting and streaming.  

Amplify CLI provides a single-line deploy command that pushes your app's static assets to the Content Delivery Network (CDN). Using a CDN dramatically increases your app's loading performance by serving your content to your users from the nearest edge location.

To enable hosting with your app, run: 

```bash
$ amplify hosting add
```

The CLI will prompt for hosting bucket name. When the hosting is successfully added, publish your app with the following command:

```bash
$ amplify publish
```

CDN service, which is provided by Amazon CloudFront, will handle the high-performance delivery of your static assets. If your website includes video or audio files, those assets will be automatically streamed to the browser.

---

For complete documentation please visit [Amplify CLI Reference](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html)
{: .next-link}
