Access Your APIs
================

Set Up Your Backend
-------------------

The AWS Mobile Cloud Logic &lt;cloud-logic&gt; feature lets you call
APIs in the cloud. API calls are handled by your serverless Lambda
functions.

**To enable cloud APIs in your app**

``` {.sourceCode .bash}
awsmobile cloud-api enable

awsmobile push
```

Enabling Cloud Logic in your app adds a sample API,
`sampleCloudApi`{.sourceCode} to your project that can be used for
testing.

You can find the sample handler function for the API by running
`awsmobile console`{.sourceCode} in your app root folder, and then
choosing the Cloud Logic feature in your project.

![View your sample cloud API and its lambda function handler.](images/web-view-cloud-api.png)

### Quickly Test Your API From the CLI

The `sampleCloudApi`{.sourceCode} and its handler function allow you to
make end to end API calls.

**To test invocation of your unsigned APIs in the development
environment**

``` {.sourceCode .bash}
awsmobile cloud-api invoke <apiname> <method> <path> [init]
```

For the `sampleCloudApi`{.sourceCode} you may use the following examples
to test the `post`{.sourceCode} method

``` {.sourceCode .bash}
awsmobile cloud-api invoke sampleCloudApi post /items '{"body": {"testKey":"testValue"}}'
```

This call will return a response similar to the following.

``` {.sourceCode .bash}
{ success: 'post call succeed!',
url: '/items',
body: { testKey: 'testValue' } }
```

**To test the :get method**

``` {.sourceCode .bash}
awsmobile cloud-api invoke sampleCloudApi get /items
```

This will return a response as follows.

``` {.sourceCode .bash}
{ success: 'get call succeed!', url: '/items' }
```

Connect to Your Backend
-----------------------

Once you have created your own Cloud Logic &lt;cloud-logic&gt; APIs and
Lambda functions, you can call them from your app.

**To call APIs from your app**

In App.js (or other code that runs at launch-time), add the following
import.

``` {.sourceCode .java}
import Amplify, { API } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

Then add this to the component that calls your API.

``` {.sourceCode .java}
state = { apiResponse: null };

async getSample() {
 const path = "/items"; // you can specify the path
  const apiResponse = await API.get("sampleCloudApi" , path); //replace the API name
  console.log('response:' + apiResponse);
  this.setState({ apiResponse });
}
```

To invoke your API from a UI element, add an API call from within your
component's `render()`{.sourceCode} method.

``` {.sourceCode .html}
<View>
   <Button title="Send Request" onPress={this.getSample.bind(this)} />
   <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
</View>
```

To test, save the changes, run `npm run android`{.sourceCode} or
`npm run ios`{.sourceCode}\` to launch your app. Then try the UI element
that calls your API.

Next Steps
----------

Learn more about the AWS Mobile Cloud Logic &lt;cloud-logic&gt; feature
which uses
<http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html>
and <http://docs.aws.amazon.com/lambda/latest/dg/welcome.html>.

To be guided through creation of an API and it's handler, run
`awsmobile console`{.sourceCode} to open your app in the console, and
choose Cloud Logic.

Learn about AWS Mobile CLI &lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile Amplify](https://aws.github.io/aws-amplify/).
