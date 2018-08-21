---
---
# API

AWS Amplify API module provides a simple solution when making HTTP requests to REST and GraphQL endpoints. It also provides an automatic, lightweight signing process which complies with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html). 

## Using REST Endpoints

API module provides a simple to use REST client when working with REST endpoints. The API module can also be used for creating signed requests against Amazon API Gateway when the Amazon API Gateway API Authorization is set to `AWS_IAM`. 

Before start, please be sure that you have installed the Amplify CLI and client libraries by visiting [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/install_n_config). 
{: .callout .callout--info}

**When you are done with the installation**, you can follow below steps to enable API category in your app.

### Automated Setup

AWS Amplify CLI helps you to create fully functional REST backend which triggers a cloud function and accesses a cloud database. Based on your selected configuration, your REST backend is automatically provisioned using Amazon API Gateway, AWS Lambda, and Amazon DynamoDB.

##### Create Your Backend with the CLI

To create a fully functioning project with the API category, run following commands in the **root directory** of your project:

```bash
$ amplify add api
```

and select `REST` as the service type:
```bash
? Please select from one of the below mentioned services
  GraphQL
❯ REST
```

The CLI will prompt you several options to create your resources. With provided options, you can create:
- REST endpoints that triggers a Lambda function
- REST endpoints to enable CRUD operations on an Amazon DynamoDB table

You can use existing Lambda functions and DynamoDB tables, or create new ones simply by following the CLI prompts. When you create your resources, update your backend with `push` command:

```bash
$ amplify push #Update your backend 
```

After the backend update, your updated configuration file `aws-exports.js` file will include an API configuration. In case you have selected to create a Serverless Express Lambda function, the boilerplate code for your function will also be created under `amplify/backend/function`.

##### Configure Your App

In your project's entry point, i.e. App.js:

```js
import Amplify, { API } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### Manual Setup

When you manually configure API category to work with Amazon API gateway, you are required to pass in an *Amazon Cognito Identity Pool ID*, allowing AWS Amplify to retrieve base credentials for a user even in an unauthenticated state. The configuration also requires a list of your APIs, comprised of a friendly name for the API and the endpoint URL.

Amazon Cognito Identity Pool is required to have access to the API using *Amazon IAM*. You can configure it manually, or let Amplify CLI do it for you with [Automated Setup](#automated-setup). For manual configuration, please see [Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html) developer guide for more details.

In the manual configuration, you need to provide your AWS Resource credentials to `Amplify.configure()`:

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

 **NOTE** To call regional service endpoints, your Amazon Cognito role needs to be configured with appropriate access for the related service. See [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) for more details.
 {: .callout .callout--warning}

### Using the API Client

To invoke an API, you need the name for the related endpoint. If you manually configure the API, you already have a name for the endpoint. If you use Automated Setup or configure your API on AWS Mobile Hub, you can check the API name in the Mobile Hub console by clicking **Cloud Logic** tile. 

The following code sample assumes you have used Automated Setup.

To invoke an endpoint, you need to set `apiName`, `path` and `headers` parameters, and each method returns a Promise.

Under the hood, aws-amplify use [Axios](https://github.com/axios/axios), so the API status code response > 299 are thrown as an exception.
If you need to handle errors managed by your API, work with the `error.response` object.

#### **GET**

```js
let apiName = 'MyApiName';
let path = '/path'; 
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
    response: true // OPTIONAL (return entire response object instead of response.data)
    queryStringParameters: {} // OPTIONAL
}
API.get(apiName, path, myInit).then(response => {
    // Add your code here
}).catch(error => {
    console.log(error.response)
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

**Using Query Parameters**

To use query parameters with *get* method, you can pass them in `queryStringParameters` parameter in your method call:

```js
let items = await API.get('myCloudApi', '/items', {
  'queryStringParameters': {
    'order': 'byPrice'
  }
});
```

**Accessing Query Parameters in Cloud API**

If you are using a Cloud API which is generated with Amplify CLI (or AWS Mobile Hub), your backend is created with Lambda Proxy Integration, and you can access your query parameters within your Lambda function via the *event* object:

```js
exports.handler = function(event, context, callback) {
    console.log (event.queryStringParameters);
}
```

Alternatively, you can update your backend file which is locates at `amplifyjs/backend/cloud-api/[your-lambda-function]/app.js` with the middleware:

```js
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
app.use(awsServerlessExpressMiddleware.eventContext())
```

In your request handler use `req.apiGateway.event`:

```js
app.get('/items', function(req, res) {
  // req.apiGateway.event.queryStringParameters
  res.json(req.apiGateway.event)
});
```

Then you can use query parameters in your path as follows:

```js
API.get('sampleCloudApi', '/items?q=test');
```

To learn more about Lambda Proxy Integration, please visit [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html).
{: .callout .callout--info}

#### **POST**

Posts data to the API endpoint:

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = {
    body: {}, // replace this with attributes you need
    headers: {} // OPTIONAL
}

API.post(apiName, path, myInit).then(response => {
    // Add your code here
}).catch(error => {
    console.log(error.response)
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

When used together with [Cloud API](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/web-access-apis.html), PUT method can be used to create or update records. It updates the record if a matching record is found, otherwise a new record will be created.

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; // replace this with the path you have configured on your API
let myInit = {
    body: {}, // replace this with attributes you need
    headers: {} // OPTIONAL
}

API.put(apiName, path, myInit).then(response => {
    // Add your code here
}).catch(error => {
    console.log(error.response)
});
```

Example with async/await:

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

Update a record:

```js
const params = {
    body: {
        itemId: '12345',
        itemDesc: ' update description'
    }
}
const apiResponse = await API.put('MyTableCRUD', '/manage-items', params);
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
}).catch(error => {
    console.log(error.response)
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
    return await API.del(apiName, path, myInit);
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

### Custom Request Headers

When working with a REST endpoint, you may need to set request headers for authorization purposes. This is done by passing a `custom_header` function into the configuration:

```js
Amplify.configure({
  API: {
    endpoints: [
      {
        name: "sampleCloudApi",
        endpoint: "https://xyz.execute-api.us-east-1.amazonaws.com/Development",
        custom_header: async () => { 
          return { Authorization : 'token' } 
          // Alternatively, with Cognito User Pools use this:
          // return { Authorization: (await Auth.currentSession()).idToken.jwtToken } 
        }
      }
    ]
  }
});
```

### Unauthenticated Requests

You can use API category to access API Gateway endpoints that doesn't require authentication. In this case, you need to allow unauthenticated identities in your Amazon Cognito Identity Pool settings. For more information, please visit [Amazon Cognito Developer Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html#enable-or-disable-unauthenticated-identities).
 
## Using GraphQL Endpoints

AWS Amplify API Module supports AWS AppSync or any other GraphQL backend.

To learn more about GraphQL, please visit [GraphQL website](http://graphql.org/learn/).
{: .callout .callout-action}

### Using AWS AppSync

AWS AppSync is a cloud-based fully-managed GraphQL service that is integrated with AWS Amplify. You can create your AWS AppSync GraphQL API backend with the Amplify CLI and connect to your backend using AWS Amplify API category. 

Learn more about [AWS AppSync](https://aws.amazon.com/appsync/) by visiting [AWS AppSync Developer Guide](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html){: .target='new'}.
{: .callout .callout--action}

#### Automated Configuration with CLI

After creating your AWS AppSync API, following command enables AppSync GraphQL API in your  project:

```bash
$ amplify add api
```

Select *GraphQL* when you are prompted for service type:

```terminal
? Please select from one of the below mentioned services (Use arrow keys)
❯ GraphQL
  REST
```

Name your GraphQL endpoint and select authorization type for this endpoint:

```terminal
? Please select from one of the below mentioned services GraphQL
? Provide API name: myNotesApi
? Choose an authorization type for the API (Use arrow keys)
❯ API key
  Amazon Cognito User Pool
```

AWS AppSync API keys expire seven days after creation, and using API KEY authentication is only suggested for development. To change AWS AppSync authorization type after the initial configuration, use the `$ amplify appsync configure` command.
{: .callout .callout--info}

When you update your backend with *push* command, you can go to [AWS AppSync Console](https://aws.amazon.com/appsync/) and see that a new API is added under *APIs* menu item:

```bash
$ amplify push
```

##### Updating Your GraphQL Schema

When you add a GraphQL API with the CLI, the schema definition for your backend data structure is saved in *amplify/backend/api/YOUR-API-NAME/schema.graphql* definition file. 
Once your API is deployed, updating the schema is very easy with the CLI. You can edit the schema file and run *push* command to update your GraphQL backend.

A sample GraphQL Schema will look like this:

```graphql
type Todo @model {
  id: ID!
  name: String!
  description: String
}
```

Add a new field *Model* to your schema:

```graphql
type Todo @model {
  id: ID!
  name: String!
  description: String
  model: String
}
```

Update your GraphQL backend:

```bash
$ amplify push
```

When you run the *push* command, you will notice that your change in the schema file is automatically detected and your backend will be updated respectively. 

```terminal
| Category | Resource name   | Operation | Provider plugin   |
| -------- | --------------- | --------- | ----------------- |
| Api      | myNotesApi      | Update    | awscloudformation |
| Auth     | cognito6255949a | No Change | awscloudformation |
```

You can now see the changes on your backend by visiting [AWS AppSync Console](https://aws.amazon.com/appsync/).

##### Using GraphQL Transformer Directives

As you can notice in the sample schema file above, the definition has a `@model` directive. This tells Amplify CLI that the related tyeps should be stored in Amazon DynamoDB. When you create or updated your backend with *push* command, the CLI will automatically create the necessary data sources for you, behind the scenes.

The resource creation is based on AWS CloudFormation templates that your can find under *amplify/backend/api/YOUR-API-NAME/cloudformation-template.json* 

The following directives are available to be used with the GraphQL Transformer when defining your schema:  

| Directive | Description |
| --- | --- |
| @model | Used for storing types in Amazon DynamoDB. |
| @auth | Used to define different authorization strategies. | 
| @connection | Used for specifying relationships between @model object types. |
| @searchable | Used for streaming the data of an @model object type to Amazon ElasticSearch Service. |

##### Using the Configuration File in Your Code

Import your auto generated `aws-exports.js` file to configure your app to work with your AWS AppSync GraphQL backend:

```js
import aws_config from "./aws-exports";
Amplify.configure(aws_config);
```

#### Manual Configuration

As an alternative to automatic configuration, you can manually enter AWS AppSync configuration parameters in your app. Authentication type options are `API_KEY`, `AWS_IAM`, `AMAZON_COGNITO_USER_POOLS` and `OPENID_CONNECT`.

##### Using API_KEY

```js
let myAppConfig = {
    // ...
    'aws_appsync_graphqlEndpoint': 'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
    'aws_appsync_region': 'us-east-1',
    'aws_appsync_authenticationType': 'API_KEY',
    'aws_appsync_apiKey': 'da2-xxxxxxxxxxxxxxxxxxxxxxxxxx',
    // ...
}

Amplify.configure(myAppConfig);
```

##### Using AWS_IAM

```js
let myAppConfig = {
    // ...
    'aws_appsync_graphqlEndpoint': 'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
    'aws_appsync_region': 'us-east-1',
    'aws_appsync_authenticationType': 'AWS_IAM',
    // ...
}

Amplify.configure(myAppConfig);
```

##### Using AMAZON_COGNITO_USER_POOLS

```js
let myAppConfig = {
    // ...
    'aws_appsync_graphqlEndpoint': 'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
    'aws_appsync_region': 'us-east-1',
    'aws_appsync_authenticationType': 'AMAZON_COGNITO_USER_POOLS', // You have configured Auth with Amazon Cognito User Pool ID and Web Client Id
    // ...
}

Amplify.configure(myAppConfig);
```

##### Using OPENID_CONNECT

```js
let myAppConfig = {
    // ...
    'aws_appsync_graphqlEndpoint': 'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
    'aws_appsync_region': 'us-east-1',
    'aws_appsync_authenticationType': 'OPENID_CONNECT', // Before calling API.graphql(...) is required to do Auth.federatedSignIn(...) check authentication guide for details.
    // ...
}

Amplify.configure(myAppConfig);
```

### Using a GraphQL Server

To access a GraphQL API with your app, you need to configure the endpoint URL in your app's configuration. Add the following line to your setup:

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

#### Set Custom Request Headers for Graphql 

When working with a GraphQL endpoint, you may need to set request headers for authorization purposes. This is done by passing a `graphql_headers` function into the configuration:

```js
Amplify.configure({
  API: {
    graphql_headers: async () => ({
        'My-Custom-Header': 'my value'
    })
  }
});
```

#### Signing Request with IAM

AWS Amplify provides the ability to sign requests automatically with AWS Identity Access Management (IAM) for GraphQL requests that are processed through AWS API Gateway. Add *graphql_endpoint_iam_region* parameter to your GraphQL configuration statement to enable signing: 

```js
Amplify.configure({
  API: {
    graphql_endpoint: 'https://www.example.com/my-graphql-endpoint',
    graphql_endpoint_iam_region: 'my_graphql_apigateway_region'
  }
});
```

### Working with the GraphQL Client

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
const allEvents = await API.graphql(graphqlOperation(ListEvents));

// Query using a parameter
const oneEvent = await API.graphql(graphqlOperation(GetEvent, { id: 'some id' }));
console.log(oneEvent);

```

#### Mutations

Mutations are used to create or update data with GraphQL. A sample mutation query to create a new *Event* in a calendar app looks like this:

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
    description: 'Coming together as a team!'
};

const newEvent = await API.graphql(graphqlOperation(CreateEvent, eventDetails));
console.log(newEvent);
```

#### Subscriptions

Subscriptions is a GraphQL feature allowing the server to send data to its clients when a specific event happens. You can enable real-time data integration in your app with a subscription. 

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
const subscription = API.graphql(
    graphqlOperation(SubscribeToEventComments, { eventId: '123' })
).subscribe({
    next: (eventData) => console.log(eventData)
});

// Stop receiving data updates from the subscription
subscription.unsubscribe();

```

When using **AWS AppSync** subscriptions, be sure that your AppSync configuration is at the root of the configuration object, instead of being under API: 

```js
Amplify.configure({
  Auth: {
    identityPoolId: 'xxx',
    region: 'xxx' ,
    cookieStorage: {
      domain: 'xxx',
      path: 'xxx',
      secure: true
    }
  },
  aws_appsync_graphqlEndpoint: 'xxxx',
  aws_appsync_region: 'xxxx',
  aws_appsync_authenticationType: 'xxxx',
  aws_appsync_apiKey: 'xxxx'
});
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

## Customization

### Customizing HTTP Request Headers

To use custom headers on your HTTP request, you need to add these to Amazon API Gateway first. For more info about configuring headers, please visit [Amazon API Gateway Developer Guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

If you have used *amplify* CLI or *AWS Mobile Hub* to create your API, you can enable custom headers by following above steps:  

1. Visit [Amazon API Gateway console](https://aws.amazon.com/api-gateway/).
3. On Amazon API Gateway console, click on the path you want to configure (e.g. /{proxy+})
4. Then click the *Actions* dropdown menu and select **Enable CORS**
5. Add your custom header (e.g. my-custom-header) on the text field Access-Control-Allow-Headers, separated by commas, like: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,my-custom-header'.
6. Click on 'Enable CORS and replace existing CORS headers' and confirm.
7. Finally, similar to step 3, click the Actions dropdown menu and then select **Deploy API**. Select **Development** on deployment stage and then **Deploy**. (Deployment could take a couple of minutes).


## Using Modular Imports

If you only need to use Api, you can do: `npm install @aws-amplify/api` which will only install the Api module for you.
Note: if you're using Cognito Federated Identity Pool to get AWS credentials, please also install `@aws-amplify/auth`.
Note: if you're using Graphql, please also install `@aws-amplify/pubsub`

Then in your code, you can import the Api module by:

```js
import API from '@aws-amplify/api';

API.configure();

```

## API Reference   

For the complete API documentation for API module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/api/classes/apiclass.html)
{: .callout .callout--info}