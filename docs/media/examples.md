---
layout: examples
---

# Code Examples

AWS Amplify enables easy integration with cloud backend for common service categories such as authentication, analytics, API and storage as outlined in the [Developer Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/developer_guide). 

AWS Amplify focuses on data and service integration with your app's backend, and it works fine with any frontend JavaScript library or framework. However, the code examples provided here are specifically for *React* and *React Native*.
{: .callout .callout--info}

Following code samples demonstrates AWS Amplify's declarative API to work with backend services: 

### Add Authentication to Your App

AWS Amplify's default implementation for authentication uses Amazon Cognito, which supports User Pools and Federated Identities. Adding authentication to you app is as easy as importing the library, setting up your credentials and wrapping your app's main component with our `withAuthenticator` Higher Order Component for React and React Native.

<div class="nav-tab create" data-group='create'>
<ul class="tabs">
    <li class="tab-link current react" data-tab="react">React</li>
    <li class="tab-link react-native" data-tab="react-native">React Native</li>
</ul>
<div id="react" class="tab-content current">
Create a new React app with `create-react-app` as an example, and edit the `App.js` file:

```jsx
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default withAuthenticator(App);
```

<img src="https://dha4w82d62smt.cloudfront.net/items/2R3r0P453o2s2c2f3W2O/Screen%20Recording%202018-02-11%20at%2003.48%20PM.gif" style="display: block;height: auto;width: 100%;"/>

</div>
<div id="react-native" class="tab-content">
For React Native, the configuration is exactly the same. Simply import `aws-amplify-react-native` package instead:

```jsx
...
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

...

export default withAuthenticator(App);
```
</div>
</div>

For a complete guide for starting your app with AWS Amplify, please see our [Get Started Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start).
{: .next-link}

### Store Files on The Cloud

AWS Amplify's default implementation for Storage category uses Amazon S3. You can store content in public, protected or private folders. Protected folders allow content to be readable by everyone, but writable only by the creating user. Private folders restrict all content access to the creating user.

```js
  Storage.put(key, fileObj, {level: 'private'})
        .then (result => console.log(result))
        .catch(err => console.log(err));

    // Stores data with specifying its MIME type
    Storage.put(key, fileObj, {
        level: 'private',
        contentType: 'text/plain'
    })
    .then (result => console.log(result))
    .catch(err => console.log(err));
```

### Tracking User Activity in Your App

AWS Amplify's default implementation for Analytics category uses Amazon Pinpoint. AWS Amplify can send user session information to Amazon Pinpoint with a few lines of code:

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
...
Analytics.record('myCustomEvent');
```

See [here](https://aws-amplify.github.io/amplify-js/media/analytics_guide) for the Analytics developer guide. 

### Signing HTTP requests

AWS Amplify API module automatically signs all HTTP request to Amazon API Gateway with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html){: target='_new'}:

```js
let apiName = 'MyApiName';
let path = '/path'; 
let options = {
    headers: {...} // OPTIONAL
}
API.get(apiName, path, options).then(response => {
    // The request is already signed
    // Add your code here
});
```

