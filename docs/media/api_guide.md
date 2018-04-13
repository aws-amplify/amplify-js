---
---
# API

AWS Amplify API module provides a simple solution when making HTTP requests. It provides an automatic, lightweight signing process which complies with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html). 


API module supports REST and GraphQL endpoints.

## Working with REST Endpoints
The API module can be used out of the box for creating signed requests against Amazon API Gateway, when the API Authorization is set to `AWS_IAM`. 

Please refer to [AWS Amplify Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config) for initial setup.
{: .callout .callout--info}

In API configuration, you are required to pass in an *Amazon Cognito Identity Pool ID*, allowing AWS Amplify to retrieve base credentials for a user even in an un-authenticated state. The configuration also requires a list of your APIs, comprised of a friendly name for the API and the endpoint URL. 

Amazon Cognito Identity Pool is required to have access to the API using *Amazon IAM*. You can configure it manually, or let AWS Mobile Hub do it for you with [Automated Setup](#automated-setup). For manual configuration, please see [Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html) developer guide for more details.


### Automated Setup

To create a fully functioning project with the API category, run following commands in the **root directory** of your project:

```bash
$ npm install -g awsmobile-cli
$ cd my-app #Change to your project's root folder
$ awsmobile init
$ awsmobile cloud-api enable
$ awsmobile push #Update your backend 
```

In your project's entry point, i.e. App.js:

```js
import Amplify, { API } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### Manual Setup

In manual configuration, you need to provide your AWS Resource credentials to `Amplify.configure()`:

```js
import Amplify, { API } from 'aws-amplify';

Amplify.configure({
    Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
    // REQUIRED - Amazon Cognito Region
        region: 'XX-XXXX-X', 
    // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'XX-XXXX-X_abcd1234', 
    // OPTIONAL - Amazon Cognito Web Client ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234',
    },
    API: {
        endpoints: [
            {
                name: "MyAPIGatewayAPI",
                endpoint: "https://1234567890-abcdefgh.amazonaws.com"
            },
            {
                name: "MyCustomCloudFrontApi",
                endpoint: "https://api.my-custom-cloudfront-domain.com",

            },
            {
                name: "MyCustomLambdaApi",
                endpoint: "https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/yourFuncName/invocations",
                service: "lambda",
                region: "us-east-1"
            }
        ]
    }
});
```

### AWS Regional Endpoints

When working with Amazon API Gateway, you can utilize regional endpoints by passing in the `service` and `region` information to the configuration. For a list of available service endpoints see [AWS Regions and Endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html). 

As an example, the following API configuration defines a Lambda invocation in `us-east-1` region with Lambda endpoint `https://lambda.us-east-1.amazonaws.com`.  

```js
API: {
    endpoints: [
        {
            name: "MyCustomLambdaApi",
            endpoint: "https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/yourFuncName/invocations",
            service: "lambda",
            region: "us-east-1"
        }
    ]
}
```

For more information related to invoking AWS Lambda functions, see [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html).

For more information about working with AWS Lambda without Amazon API Gateway, see [this post](https://forum.serverless.com/t/directly-proxying-lambda-via-cloudfront-without-api-gateway/3808).
{: .callout .callout--info}

 **NOTE** In order to call regional service endpoints, your Amazon Cognito role needs to be configured with appropriate access for the related service. See [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) for more details.
 {: .callout .callout--warning}

### Using the API Client

To invoke an API, you will need the name for the related endpoint. If you manually configure the API, you already have a name for the endpoint. If you use Automated Setup or configure your API on AWS Mobile Hub, you can check the API name in the Mobile Hub console by clicking **Cloud Logic** tile. 

The following code sample assumes you have used Automated Setup.

To invoke an endpoint, you need to set `apiName`, `path` and `headers` parameters, and each method returns a Promise.

#### **GET**

```js
let apiName = 'MyApiName';
let path = '/path'; 
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
    response: true // OPTIONAL (return entire response object instead of response.data)
}
API.get(apiName, path, myInit).then(response => {
    // Add your code here
});
```

Note: To get the full response from the resulting API call, set `response` to `true` in the `init` object.
 {: .callout .callout--info}

Example with async/await

```js
async function getData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.get(apiName, path, myInit);
}

getData();
```

#### **POST**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = {
    body: {}, // replace this with attributes you need
    headers: {} // OPTIONAL
}

API.post(apiName, path, myInit).then(response => {
    // Add your code here
});
```

Example with async/await

```js
async function postData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        body: {}, // replace this with attributes you need
        headers: {} // OPTIONAL
    }
    return await API.post(apiName, path, myInit);
}

postData();
```

#### **PUT**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; // replace this with the path you have configured on your API
let myInit = {
    body: {}, // replace this with attributes you need
    headers: {} // OPTIONAL
}

API.put(apiName, path, myInit).then(response => {
    // Add your code here
});
```

Example with async/await

```js
async function putData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        body: {}, // replace this with attributes you need
        headers: {} // OPTIONAL
    }
    return await API.put(apiName, path, myInit);
}

putData();
```

#### **DELETE**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
}

API.del(apiName, path, myInit).then(response => {
    // Add your code here
});
```

Example with async/await

```js
async function deleteData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.delete(apiName, path, myInit);
}

deleteData();
```

#### **HEAD**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
}
API.head(apiName, path, myInit).then(response => {
    // Add your code here
});
```

Example with async/await:

```js
async function head() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.head(apiName, path, myInit);
}

head();
```

## Working with GraphQL Endpoints

AWS Amplify API Module supports GraphQL endpoints via an easy-to-use GraphQL client.

To learn more about GraphQL, please visit [GraphQL website](http://graphql.org/learn/).
{: .callout .callout-info}

### Configuration for GraphQL Server

To access a GraphQL API with your app, you need to configure endpoint URL in your app's configuration. Add the following line to your setup:

```js

import Amplify, { API } from "aws-amplify";
import aws_config from "./aws-exports";
 
// Considering you have an existing aws-exports.js configuration file 
Amplify.configure(aws_config);

// Configure a custom GraphQL endpoint
Amplify.configure({
  API: {
    graphql_endpoint: 'https:/www.example.com/my-graphql-endpoint'
  }
});

```

#### Set Custom Request Headers  

When working with a GraphQL endpoint, you will need to set request headers for authorization purposes. This is done by passing a `graphql_headers` function into the configuration:

```js
Amplify.configure({
  API: {
    graphql_headers: async () => ({
      'My-Custom-Header': 'my value'
    })
  }
});
```

### Configuration for AWS AppSync

AWS AppSync is a cloud-based fully-managed GraphQL service that is integrated with AWS Amplify API category and command line tools with AWS Mobile CLI.

To create an AWS AppSync API, please visit [AWS AppSync Console](https://aws.amazon.com/appsync/) or visit [AWS AppSync Developer Guide](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html).
{: .callout .callout--info}

#### Automated Configuration with CLI

After creating your AWS AppSync API, following command will enable AppSync GraphQL API in your  project:

```bash
$ awsmobile appsync enable
```

AWS AppSync supports multiple authorization types, which are AWS Identity and Access Management (IAM), Amazon Cognito User Pool and API key. To configure auth type, use the following command:

```bash
$ awsmobile appsync configure
```

```console
? Please specify the auth type:  (Use arrow keys)
❯ AWS_IAM 
  API_KEY 
  AMAZON_COGNITO_USER_POOLS 
```

Enabling AppSync will create a local folder which you can find AppSync configuration files under `/awsmobilejs/backend/appsync` folder that is automatically synced with AppSync when you run `awsmobile push` command.

Note: AWS AppSync API keys expire seven days after creation, and using API_KEY authentication is only suggested for development.
{: .callout .callout--info}

Import your auto updated `aws-exports.js` file to configure your app:

```js
import aws_config from "./aws-exports";
Amplify.configure(aws_config);
```

#### Manual Configuration

As an alternative to automatic configuration, you can manually enter configuration parameters in your app:

```js
let myAppConfig = {
    // ...
    'aws_appsync_graphqlEndpoint': 'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
    'aws_appsync_region': 'us-east-1',
    'aws_appsync_authenticationType': 'API_KEY',
    'aws_appsync_apiKey': 'da2-xxxxxxxxxxxxxxxxxxxxxxxxxx',
    // ...
}

Amplify.configure(aws_config);
```


### Using GraphQL Client

AWS Amplify API category provides a GraphQL client for working with queries, mutations, and subscriptions.

#### Query Declarations

You can declare GraphQL queries with standard GraphQL query syntax. To learn more about GraphQL queries, please visit [GraphQL Developer Documentation](http://graphql.org/learn/queries/). 

```js
const ListEvents = `query ListEvents {
  listEvents {
    items {
      id
      where
      description
    }
  }
}`;
```

You can also define parameters in your query. You can later assign values to parameters with `graphqlOperation` function.

```js
const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
    getEvent(id: $id) {
        id
        name
        description
        comments(nextToken: $nextToken) {
            items {
                content
            }
        }
    }
}`;
```

#### Simple Query

Running a GraphQL query is simple. Define your query and execute it with `API.graphql`:

```js
import Amplify, { API, graphqlOperation } from "aws-amplify";

const ListEvents = `query ListEvents {
  listEvents {
    items {
      id
      where
      description
    }
  }
}`;

const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
    getEvent(id: $id) {
        id
        name
        description
        comments(nextToken: $nextToken) {
            items {
                content
            }
        }
    }
}`;

// Simple query
const allEvents = await API.graphql({ ListEvents });

// Query using a parameter
const oneEvent = await API.graphql(graphqlOperation(GetEvent, { id: 'some id' }));
console.log(oneEvent);

```

#### Mutations

Mutations are used to create or update data with GraphQL. A sample mutation query to create a new *Event* in a calendar app will look like this:

```js
import Amplify, { API, graphqlOperation } from "aws-amplify";

const CreateEvent = `mutation CreateEvent($name: String!, $when: String!, $where: String!, $description: String!) {
  createEvent(name: $name, when: $when, where: $where, description: $description) {
    id
    name
    where
    when
    description
  }
}`;

// Mutation
const eventDetails = {
    name: 'Party tonight!',
    when: '8:00pm',
    where: 'Ballroom',
    decription: 'Coming together as a team!'
};

const newEvent = await API.graphql(graphqlOperation(CreateEvent, eventDetails));
console.log(newEvent);
```

#### Subscriptions

Subscriptions are a GraphQL feature allowing the server to send data to its clients when a specific event happens. You can enable real-time data integration in your app with a subscription. 

```js
import Amplify, { API, graphqlOperation } from "aws-amplify";

const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
  subscribeToEventComments(eventId: $eventId) {
    eventId
    commentId
    content
  }
}`;

// Subscribe with eventId 123
const subscription = API.graphqlSubscribe(
    graphqlOperation(SubscribeToEventComments, { eventId: '123' })
).subscribe({
    next: (eventData) => console.log(eventData)
});

// Stop receiving data updates from the subscription
subscription.unsubscribe();

```

### React Components

API category provides React components for working with GraphQL data. 

#### Connect

`<Connect/>` component is used to execute a GraphQL query or mutation. You can execute GraphQL queries by passing your queries in `query` or `mutation` attributes:

```js
import React from 'react';
import Amplify, { graphqlOperation }  from "aws-amplify";
import { Connect } from "aws-amplify-react";

class App extends React.Component {

    render() {

        const ListView = ({ events }) => (
            <div>
                <h3>All events</h3>
                <ul>
                    {events.map(event => <li key={event.id}>{event.name} ({event.id})</li>)}
                </ul>
            </div>
        );

        const ListEvents = `query ListEvents {
            listEvents {
                items {
                id
                name
                description
                }
            }
        }`;

        return (
            <Connect query={graphqlOperation(ListEvents)}>
                {({ data: { listEvents } }) => (
                    <ListView events={listEvents.items} />
                )}
            </Connect>
        )
    }
} 

export default App;

```

Also, you can use `subscription` and `onSubscriptionMsg` attributes to enable subscriptions:

```js

<Connect  query={graphqlOperation(GetEvent, { id: currEventId })}
          subscription={graphqlOperation(SubscribeToEventComments, { eventId: currEventId })}
          onSubscriptionMsg={(prev, { subscribeToEventComments }) => {
            console.log ( subscribeToEventComments);
            return prev; }}>
    {({ data: { listEvents } }) => (
        <AllEvents events={listEvents ? listEvents.items : []} />
    )}
 </Connect>

```

For mutations, a `mutation` function needs to be provided with `Connect` component. `mutation` returns a promise that resolves with the result of the GraphQL mutation.

```js
class CreateEvent extends React.Component {
  // ...
  // This component calls its onCreate prop to trigger the mutation
  // ...
}
<Connect mutation={graphqlOperation(Operations.CreateEvent)}>
  {({ mutation }) => (
      <CreateEvent onCreate={mutation} />
  )}
</Connect>
```

--- 


## API Reference   

For the complete API documentation for API module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/api/classes/apiclass.html)
{: .callout .callout--info}


## Customization

### Using Custom HTTP Request Headers

To use custom headers on your HTTP request, you need to add these to Amazon API Gateway first. For more info about configuring headers, please visit [Amazon API Gateway Developer Guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

If you have used *awsmobile* CLI or *AWS Mobile Hub* to create your API, you can enable custom headers by following above steps:  

1. Visit [Amazon API Gateway console](https://aws.amazon.com/api-gateway/).
3. On Amazon API Gateway console, click on the path you want to configure (e.g. /{proxy+})
4. Then click the *Actions* dropdown menu and select **Enable CORS**
5. Add your custom header (e.g. my-custom-header) on the text field Access-Control-Allow-Headers, separated by commas, like: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,my-custom-header'.
6. Click on 'Enable CORS and replace existing CORS headers' and confirm.
7. Finally, similar to step 3, click the Actions dropdown menu and then select **Deploy API**. Select **Development** on deployment stage and then **Deploy**. (Deployment could take a couple of minutes).
