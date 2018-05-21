---
---

# Hosting

AWS Amplify provides hosting for your Web app or static website with AWS Mobile CLI. You can use [awsmobile-cli](https://github.com/aws/awsmobile-cli) to create a new web project and deploy it for hosting and streaming.  

```bash
$ npm install -g awsmobile-cli
```

If it is the first time you are using `awsmobile-cli`, you need to configure the CLI with your AWS credentials. To setup permissions for the toolchain used by the CLI, run:

```bash
$ awsmobile configure
```

If prompted for credentials, follow the steps provided by the CLI. For more information, see [Provide IAM credentials to AWS Mobile CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-credentials.html). Also, to enable cloud features with CLI, your account needs to have permission to create AWS resources.

## Deployment with CLI

AWS Mobile CLI provides a one-line deploy command that pushes your app's static assets to the Content Delivery Network (CDN). Using a CDN dramatically increases your app's loading performance by serving your content to your users from the nearest edge location.

```bash
awsmobile publish
```

CDN service, which is provided by Amazon CloudFront, will handle the high-performance delivery of your static assets. You can visit *Hosting and Streaming* section in AWS Mobile Hub to see the URLs for your web app.

![CDN](images/mobile_hub_cdn.png?raw=true "CDN"){: style="max-height:400px;"}

If your website includes video or audio files, those assets will be automatically streamed to the browser.

---

For complete documentation please visit [AWS Mobile CLI Reference](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html)
{: .next-link}
