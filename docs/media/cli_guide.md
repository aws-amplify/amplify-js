---
---

# Amplify CLI  

Amplify CLI enables adding cloud features to your app easily by provisioning the backend resources.

To install: 

```bash
$ npm install -g @aws-amplify/cli
```

If it is the first time you are using the CLI, you need to configure the CLI with your AWS credentials. To setup permissions for the toolchain used by the CLI, run:

```bash
$ amplify configure
```

If prompted for credentials, follow the steps provided by the CLI to create a new AWS console user and retrieve account credentials.  

For more information on individual installation steps, visit [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config?platform=react&ref_url=/amplify-js/media/quick_start&ref_content={{"Get Started" | uri_escape }}&ref_content_section=automatic-setup){: target='_new'}.
{: .callout .callout--action}