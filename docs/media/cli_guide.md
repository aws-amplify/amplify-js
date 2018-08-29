<html>
  <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->     <script async src="https://www.googletagmanager.com/gtag/js?id=UA-115615468-1"></script>     <script>         window.dataLayer = window.dataLayer || [];         function gtag(){dataLayer.push(arguments);}         gtag('js', new Date());         gtag('config', 'UA-115615468-1',{             'linker': {             'domains': ['aws-amplify.github.io']             }         });         var navigateToNextPage = function (elem) {             var path = "https://github.com/aws-amplify/amplify-cli";             location.replace( path + location.search);         };       gtag('event', 'page_view', {         'event_callback': navigateToNextPage         });     </script> <meta http-equiv="refresh" content="5; url=https://github.com/aws-amplify/amplify-cli" />
  </head>
  <body>
    <p>Redirecting to <a href="https://github.com/aws-amplify/amplify-cli">https://github.com/aws-amplify/amplify-cli</a></p>
  </body>
</html>
---
---
# Amplify CLI  

Amplify CLI enables adding cloud features to your app easily by provisioning the backend resources.

- Install [Node.js®](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) if they are not already on your machine.

Verify that you are running at least Node.js version 8.x or greater and npm version 5.x or greater by running `node -v` and `npm -v` in a terminal/console window.
{: .callout .callout--action}

- Install and configure the Amplify CLI.

```bash
$ npm install -g @aws-amplify/cli
$ amplify configure
```
