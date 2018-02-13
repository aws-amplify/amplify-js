# Configure aws-amplify
AWS Amplify library let you configure once, run anywhere. :ghost:

There is couple of ways to get and configure aws-amplify

* [From AWS Mobile Hub](from-aws-mobile-hub)

## From AWS Mobile Hub

Go to AWS Console -> search for Mobile Hub -> Create a project, or open the one that your are working on -> Hosting and Streaming -> Download aws-exports.js file

Host and Streaming
![Hosting and Streaming](mobile_hub_1.png)

Download aws-exports.js
![Download aws-exports.js](mobile_hub_2.png)

### Import and Configure

In your app start point, normally index.js, or App.js, add these lines:

```js
import Amplify from 'aws-amplify';
// Provided by awsmobile-cli or downloaded from the console,
// this assumes your aws-exports.js is in the same directory.
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```
