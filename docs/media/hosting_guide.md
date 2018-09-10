---
---

# Hosting

AWS Amplify provides hosting for static assets and websites.

Ensure you have [installed and configured the Amplify CLI and library]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start).
{: .callout .callout--info}

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

