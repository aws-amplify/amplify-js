---
---


# React & React Native
This tutorial walks you through how to use AWS Amplify to build a React application. You can use a similar process with a React Native application (omitting hosting).

## Installation

```
$ npm install -g @aws-amplify/cli
$ amplify configure
```

If you're using Windows, we recommend the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

- Ensure you have [Create React App](https://github.com/facebook/create-react-app) installed. 
- Create a new project as follows:<br>
  `yarn create-react-app -g`<br>
  `create-react-app myapp`<br>
  `cd myapp`<br>
  **Note** This example uses `yarn`, but you can use `npm` instead.

***Getting Started with the CLI***
To get started, initialize your project in the new directory:
`amplify init`

After you answer a few questions, you can use `amplify help` at any time to see the overall command structure, and `amplify help <category>` to see actions for a specific category. 

The Amplify CLI uses AWS CloudFormation, and you can add or modify configurations locally before you push them for execution in your account. To see the status of the deployment at any time, run `amplify status`.

***Publishing Your Web App***

Without making any changes to your React application, add web hosting as follows:
```
amplify add hosting
```

You would be prompted next to select the environment setup. Select **DEV (S3 only with HTTP)** for quick prototyping and testing, and once production ready you could run the `amplify update hosting` command to publish your app to Amazon Cloudfront (a CDN service).

**Note:** when using the **PROD** option there could be a 15-20 minute delay for the CDN setup and content replication.

When you're prompted for information, such as the bucket name or application files, you can use the default values by pressing **Enter**.

**Note** You can use an order alias to add or remove category features. You can also run `amplify hosting add`.

Run `amplify status` to see that status (not deployed). Next, build and deploy your site by running `amplify publish` or `amplify publish -invalidate-cache` - for cache invalidation in the distribution network (if Cloudfront is added via the hosting category). After it's complete, your application is available in an S3 hosting bucket for testing. It's also fronted with an Amazon CloudFront distribution. (if it is added via the hosting category in the prior bucket)

## Add Auth

Now that your app is in the cloud, you can add some features like enabling users to register for your site and log in. Run `amplify add auth` and select the **Default configuration**.

Next, add the Amplify library to your application as follows:
```
yarn add aws-amplify aws-amplify-react
```

The `./src/aws-exports.js` file that's created has all of the appropriate cloud resources defined for your application. Edit `./src/App.js` to include the Amplify library, configurations, and [React HOC](https://reactjs.org/docs/higher-order-components.html). Then, initialize the library as follows:

```js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
Amplify.configure(aws_exports);
```

Wrap the default `App` component using `withAuthenticator` at the bottom of the file as follows:

```js
export default withAuthenticator(App, true);
```

You can now use `amplify publish` to build and publish your app again. This time you'll be able to register a new user and sign in before opening the main application.

## Add Analytics and Storage

Next, we'll add some features, like tracking user behavior analytics and uploading/downloading images in the cloud. Start by running `amplify add analytics` in your project. You can enable analytics for authenticated users only, or for users that aren't authenticated. You would be pormpted to ask whether you want to allow guests and unauthenticated users to send analytics events, so you can choose `Yes`. You you an also try a new project without authentication configured to test this feature.

Run `amplify add storage` and then select **Content (Images, audio, video, etc.)**. You'll then be prompted for autorization related questions. Choose **Auth and guest users** to give both authorized and guest users access. In the next prompts, based on your previous selection you would be asked to configure read/write permissions for the authorized and guest users. When complete, run `amplify push` to create the cloud resources.

Edit your `App.js` file in the React project again and modify your imports so that the `Analytics` and `Storage` categories are included in addition to the `S3Album` component, which we'll use to upload and download photos.

```js
import Amplify, { Analytics, Storage } from 'aws-amplify';
import { withAuthenticator, S3Album } from 'aws-amplify-react';
```

The `Analytics` category automatically tracks user session data such as sign-in events. However, you can record custom events or metrics at any time. You can also use the `Storage` category to upload files to a private user location after someone has logged in. First, add the following line after `Amplify.configure()` has been called:

`Storage.configure({ level: 'private' });`

Next, add the following methods before the component's `render` method as follows:

```js
  uploadFile = (evt) => {
    const file = evt.target.files[0];
    const name = file.name;

    Storage.put(name, file).then(() => {
      this.setState({ file: name });
    })
  }

 componentDidMount() {
    Analytics.record('Amplify_CLI');
  }
```

Finally, modify the `render` method so that you can upload files and also view any of the `private` photos that have been added for the logged in user as follows:

```js
  render() {
    return (
      <div className="App">
        <p> Pick a file</p>
        <input type="file" onChange={this.uploadFile} />
        <S3Album level="private" path='' />
      </div>
    );
  }
```

Save your changes and run `amplify publish`. You've already pushed the changes earlier so just the local build is created and uploaded to the hosting bucket. Log in (if necessary) and upload photos, which are protected by the user. You can refresh the page to view the photos after you upload them.

## Add GraphQL Backend

Now that your application is set up, it's time to add a backend API with data that can be persisted in a database. The Amplify CLI comes with a **GraphQL Transformer** that converts annotated GraphQL schema files into the appropriate AWS CloudFormation template based on your data requirements. This includes options such as the following:
- `@model` for storing types in Amazon DynamoDB.
- `@auth` to define different authorization strategies.
- `@connection` for specifying relationships between `@model` object types.
- `@searchable` for streaming the data of an `@model` object type to Amazon Elasticsearch Service.

To get started run `amplify add api` and select `GraphQL`. When prompted, choose `Amazon Cognito User Pool` and the project will leverage your existing authentication setup. For `annotated schema`, choose **No**. For `guided schema creation`, choose **Yes**.

The guided steps provide some default schemas that are pre-annotated to help you learn. The following steps take you through the `Single object with fields` option, but feel free to revisit these steps later in another project. If you choose this option you'll see the following annotated schema in your text editor:

```js
type Todo @model {
  id: ID!
  name: String!
  description: String
}
```

This is the GraphQL schema that you'll deploy to AWS AppSync. If you're familiar with GraphQL you can rename or add fields and types, but you'll need to change the client code too. When you're ready press `Enter` in the CLI and then run `amplify push`.

After the deployment is complete, open your `App.js` again and update the import to include both the `API` category and `graphqlOperation` method as follows:

```js
import Amplify, { Analytics, Storage, API, graphqlOperation } from 'aws-amplify';
```

Add the following query and mutations in your code, *before* the `class App extends Component {...}` definition as follows:

```js
const listTodos = `query listTodos {
  listTodos{
    items{
      id
      name
      description
    }
  }
}`

const addTodo = `mutation createTodo($name:String! $description: String!) {
  createTodo(input:{
    name:$name
    description:$description
  }){
    id
    name
    description
  }
}`

```

Now, inside the `App` component add the following two methods before the `render()` method:

```js
  todoMutation = async () => {
    const todoDetails = {
      name: 'Party tonight!',
      description: 'Amplify CLI rocks!'
    };
    
    const newEvent = await API.graphql(graphqlOperation(addTodo, todoDetails));
    alert(JSON.stringify(newEvent));
  }

  listQuery = async () => {
    console.log('listing todos');
    const allTodos = await API.graphql(graphqlOperation(listTodos));
    alert(JSON.stringify(allTodos));
  }
```

You can now make GraphQL calls from your application. Update the `render()` method so that it has the following buttons to invoke the mutation and query:

```js
  render() {
    return (
      <div className="App">
        <p> Pick a file</p>
        <input type="file" onChange={this.uploadFile} />
        <button onClick={this.listQuery}>GraphQL Query</button>
        <button onClick={this.todoMutation}>GraphQL Mutation</button>
        <S3Album level="private" path='' />
      </div>
    );
  }
```

Save the file and run `amplify publish`. After the backend is deployed, you can choose **GraphQL Mutation** to enter data into the database and **GraphQL Query** to retrieve a list of all entries. You can validate this in the AWS AppSync console too.

## Add REST API Calls to a Database

For this example, we use a REST backend with a NoSQL database. Run `amplify add api` and follow the prompts. Select the **REST** option and provide a friendly name for your API, such as **myapi** or something else that you can remember. Use the default `/items` path and choose **Create a new lambda function**. Choose the option titled **CRUD function for Amazon DynamoDB table (Integration with Amazon API Gateway and Amazon DynamoDB)** when prompted. This creates an architecture using Amazon API Gateway with Express running in an AWS Lambda function that reads and writes to Amazon DynamoDB. You can modify the routes in the Lambda function later to meet your needs and update it in the cloud. 

Since you do not have a database provisioned yet, the CLI workflow prompts you for this information. Alternatively, you can run `amplify add storage` beforehand to create a DynamoDB table and use it in this setup. When the CLI prompts you for the primary key structure, use an attribute named `id` of type `String`. Don't select any other options like sort keys or global secondary indexes (GSIs).

Next, for the API security type questions, choose **Yes** when prompted for Restriction of API access. Similar to the storage category, when prompted for **Who should have access?**, choose **Auth and guest users** to give both authorized and guest users access. In the next prompts, based on your previous selection you would be asked to configure read/write permissions for authorized and guest user.



In the React project, edit your `App.js` file again and modify your imports so that the `API` category is included so that you can make API calls from the app.

```js
import Amplify, { Analytics, Storage, API, graphqlOperation } from 'aws-amplify';
```


In `App.js`, add the following code before the `render()` method and update `myapi` if you used an alternative name during the setup:

```js
  post = async () => {
    console.log('calling api');
    const response = await API.post('myapi', '/items', {
      body: {
        id: '1',
        name: 'hello amplify!'
      }
    });
    alert(JSON.stringify(response, null, 2));
  }
  get = async () => {
    console.log('calling api');
    const response = await API.get('myapi', '/items/object/1');
    alert(JSON.stringify(response, null, 2));
  }
  list = async () => {
    console.log('calling api');
    const response = await API.get('myapi', '/items/1');
    alert(JSON.stringify(response, null, 2));
  }
```

Update the `render()` method to include calls to the following methods:

```js
  render() {
    return (
      <div className="App">
        <p> Pick a file</p>
        <input type="file" onChange={this.uploadFile} />
        <button onClick={this.post}>POST</button>
        <button onClick={this.get}>GET</button>
        <button onClick={this.list}>LIST</button>
        
        <S3Album level="private" path='' />
      </div>
    );
  }
```

Save the file and run `amplify publish`. After the API is deployed along with the Lambda function and database table, your app is built and updated in the cloud. You can then add a record to the database by choosing **POST**, and then using **GET** or **LIST** to retrieve the record, which has been hard coded in this simple example.

In your project directory, open `./amplify/backend/function` and you'll see the Lambda function that you created. The `app.js` file runs the Express function and all of the HTTP method routes are available for you to manipulate. For example, the `API.post()` in your React app corresponded to the `app.post(path, function(req, res){...})` code in this Lambda function. If you choose to customize the Lambda function, you can update it in the cloud using `amplify push`. 


## Testing Serverless Functions

Amplify CLI supports local testing of Lambda functions. Run `amplify status` to get the resource name of the Lambda function created earlier, and then run the following:

```
amplify function invoke <resourcename>
```

In this case, the function runs, but it doesn't exit because this Lambda example starts an Express server which you need to manually close when testing it from the CLI. Use `ctrl-c` to close and open the `./amplify/backend/function/resourcename` directory to see the local structure that is packaged for Lambda invocation from API Gateway. The Lambda function is inside the `src` directory, along with `event.json`, which is used for the `amplify function invoke` command you just ran. `index.js` is also in this directory, which is the main entry point for the Serverless Express library that echoed out the test event and instantiated the server inside `app.js`. Since the Express routes defined in `app.js` don't have a path that's called via the test event, it responded with a 404 message. For more information, see https://github.com/awslabs/aws-serverless-express.
