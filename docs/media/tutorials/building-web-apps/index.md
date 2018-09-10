<html>
  <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->     <script async src="https://www.googletagmanager.com/gtag/js?id=UA-115615468-1"></script>     <script>         window.dataLayer = window.dataLayer || [];         function gtag(){dataLayer.push(arguments);}         gtag('js', new Date());         gtag('config', 'UA-115615468-1',{             'linker': {             'domains': ['aws-amplify.github.io']             }         });         var navigateToNextPage = function (elem) {             var path = "{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start";             location.replace( path + location.search);         };       gtag('event', 'page_view', {         'event_callback': navigateToNextPage         });     </script> <meta http-equiv="refresh" content="5; url={% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start" />
  </head>
  <body>
    <p>Redirecting to <a href="{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start">https://aws-amplify.github.io/amplify-js/media/quick_start</a></p>
  </body>
</html> 
Building Web Apps with AWS Amplify
===========

Overview
--------

The AWS Amplify library and the AWS Amplify CLI provides a developer experience that allows frontend JavaScript developers to create and integrate backend resources into their apps quickly.

In this tutorial, you will learn how to build a cloud-enabled web app with React and AWS Amplify.

**By completing this tutorial, you will be able to;**
- Use Amplify CLI to create your backend
- Configure and integrate your backend into your JavaScript app 
- Deploy your web app for delivery

## Create a new React App

Use [Create React App](https://github.com/facebookincubator/create-react-app) to create a new React application. Through the tutorial, you will add cloud features to this application using Amplify CLI and Amplify JavaScript library.

```bash
$ npm install -g create-react-app
$ create-react-app my-app
$ cd my-app
$ npm start
```

## Install and Configure AWS Amplify

Before start, please be sure that you have installed the Amplify CLI and client libraries by visiting [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/install_n_config??platform=react&ref_url=/amplify-js/media/tutorials/building-web-apps&ref_content={{"Tutorial: Building Web Apps with AWS Amplify" | uri_escape }}&ref_content_section=configure-your-app).
{: .callout .callout--action}

**When you are done with the installation**, you can continue with the next step in the tutorial.

#### Configure Your App

When you have installed AWS Amplify packages and initialized your project with *amplify init* command, the next step is to configure your app to work with AWS Amplify.

**To connect the app to your configured AWS features**

In index.js (or in other code that runs at launch-time), add the
following imports.

```js
import Amplify from 'aws-amplify';
import amplify from './YOUR-PATH-TO/aws-exports';
```

Then add the following code.

```js
Amplify.configure(amplify);
```

### Run Your App Locally

Your app, which for now consists of a default blank home page, is now ready to launch.

**To launch your app locally in a browser**

In the root folder of your app, run:

```bash
amplify run
```

Behind the scenes, this command pushes any backend configuration
changes to AWS and runs your app. To run your app locally without pushing backend
changes you can choose to run `npm install` and then
run `npm start`.

### Deploy your app to the cloud

Using a simple command, you can publish your app's frontend to hosting
on a robust content distribution network (CDN) and view it in a browser.

**To deploy your app to the cloud and launch it in a browser**

In the root folder of your app, run:

```bash
$ amplify hosting add
```

and select *DEV* for environment setup:

```bash
? Select the environment setup: DEV (S3 only with HTTP)
```

After you successfully add hosting to your project, you can use *publish* command to deploy your project for hosting:

```bash
$ amplify publish
```

To push any backend configuration changes to AWS and view content
locally, run `amplify run`. In both cases, any pending
changes you made to your backend configuration are made to your backend
resources.

The CLI configures hosting feature via [Amazon CloudFront](https://aws.amazon.com/cloudfront/) CDN
endpoints. These locations make your app highly available to the public
on the Internet and support [media file streaming](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/url-cf-dev;Tutorials.html).

You can also use a custom domain for your hosting location.

### Retrieve your App's Backend Status

You can retrieve the status of your app's backend anytime by using *status* command:

```bash
$ amplify status
```

Remember that, when adding a new cloud feature with *amplify add* command, the added functionality is configured locally and it won't be available on your backend until you use *amplify push* command.

## Add Auth / User Sign-in

The Amplify CLI components for user authentication include a rich, configurable UI for sign-up and sign-in.

**To enable the Auth features**

In the root folder of your app, run the following commands and select *default configuration* when prompted by *add* command:

```bash
$ amplify add auth
$ amplify push
```

### Connect to Your Backend

The Amplify React package enables you to integrate ready-to-use sign-up/sign-in/sign-out UI in your app.

**To add user auth UI to your app**

1.  In case you haven't done already, install AWS Amplify for React library.

    ```bash
    npm install --save aws-amplify-react
    ```

2.  Add the following import in App.js (or another file that runs upon app
    startup):

    ```js
    import { withAuthenticator } from 'aws-amplify-react';
    ```

3.  Then change `export default App;` to the following.

    ```js
    export default withAuthenticator(App);
    ```

To test, run `npm start`, `amplify run`, or
`amplify publish`.

Learn more about [Amazon
Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/welcome.html) which is the underlying service for AWS Amplify Authentication category.

## Add Cloud Storage

The Amplify CLI and AWS Amplify library make it easy to store and manage files in the cloud from your JavaScript app.

### Set Up the Backend

Enable the User File Storage feature by running the following commands in the root folder of your app. Select 'Content' when promoted for storage service type:

```bash
amplify add storage
amplify push
```

### Connect to Your Backend

You have enabled your storage backend in the previous step. Now you will use AWS Amplify library to upload files to storage.

### Upload a file

The `Storage` module enables you to upload files to the cloud. All uploaded files are publicly viewable by default.

Import the `Storage` module in your component file.

```js
import { Storage } from 'aws-amplify';
```

Add the following function to use the `put` function on the `Storage` module to upload the file to the cloud, and set your component’s state to the name of the file.

```js
uploadFile(event) {
  const file = event.target.files[0];
  const name = file.name;

  Storage.put(key, file).then(() => {
    this.setState({ file: name });
  });
}
```

Place a call to the `uploadFile` function in the
`input` element of the component’s render function, to
start upload when a user selects a file.

```js
render() {
  return (
    <div>
      <p>Pick a file</p>
      <input type="file" onChange={this.uploadFile.bind(this)} />
    </div>
  );
}
```

### Display an image

To display an image, this example shows the use of the
`S3Image` component of the AWS Amplify for React library.

1.  From a terminal, run the following command in the root folder of
    your app.

    ```bash
    npm install --save aws-amplify-react
    ```

2.  Import the `S3Image` module in your component.

    ```js
    import { S3Image } from 'aws-amplify-react';
    ```

Use the S3Image component in the render function. Update your render
function to look like the following:

```js
render() {
  return (
     <div>
       <p>Pick a file</p>
       <input type="file" onChange={this.handleUpload.bind(this)} />
       { this.state && <S3Image path={this.state.path} /> }
     </div>
  );
}
```

### Learn More

-   Learn more about the [analytics for the User File Storage
    feature](https://alpha-docs-aws.amazon.com/pinpoint/latest/developerguide/welcome.html).
-   Learn more about how your files are stored on [Amazon Simple Storage
    Service](https://aws.amazon.com/documentation/s3/).

## Add Cloud APIs

The Amplify CLI and Amplify library make it easy to create and call cloud APIs and their handler logic from your JavaScript code.

### Set Up Your Backend

#### Create Your API

In the following examples, you will create an API that is part of a cloud-enabled number guessing app. The CLI will create a serverless handler for the API behind the scenes.

**To enable and configure an API**

1.  In the root folder of your app, run the following command and select *REST* as the service type:

    ```bash
    $ amplify add api
    ```

2.  When prompted, name the API Guesses.

    ```terminal
    ? Provide a friendly name for your resource to be used as a label for this category in the project: Guesses
    ```

3.  Name an HTTP path /number. This maps to a method call in the API
    handler.

    ```terminal
    ? Provide a path (e.g., /items): /number
    ```

4.  Crate a new Lambda function and name your Lambda API handler function as 'guesses'.

    ```terminal
    ? Choose a Lambda source Create a new Lambda function
    ? Provide a friendly name for your resource to be used as a label for this category in the project: myfunctions
    ? Provide the AWS Lambda function name: guesses
    ```

5.  Select 'Serverless express function' as the template for your new Lambda function.

    ```terminal
    ? Choose the function template that you want to use:
    CRUD function for Amazon DynamoDB table (Integration with Amazon API Gateway and Amazon DynamoDB)
    ❯ Serverless express function (Integration with Amazon API Gateway)
    ```

6.  Select 'Yes' when prompted for restricting API access. This will enable only authenticated users to access your API. 

    ```terminal
    Successfully added the Lambda function locally
    ? Restrict API access (Y/n) Y
    ? Who should have access? Authenticated users only
    ? What kind of access do you want for Authenticated users read/write
    ```

7.  When prompted to add another HTTP path, type No.

    ```terminal
    ? Do you want to add another path? No
    ```

8.  The configuration for your Guesses API is now saved locally. Push
    your configuration to the cloud.

    ```bash
    $ amplify push
    ```

The Cloud API endpoint for the `Guesses` API is now created.

### Customize Your API Handler Logic

The Amplify CLI has generated a Lambda function to handle calls to the `Guesses` API. It is saved locally in
*amplify/backend/function/guesses/src* file. The `app.js` file in that directory contains the definitions and functional code for all of the paths that are handled for your API.

**To customize your API handler**

1.  In app.js, find the handler for POST requests on the `/number` path. That line starts with `app.post('number',`. Replace the callback function’s body with the following:

    ```js
    // amplifyjs/backend/cloud-api/guesses/app.js

    app.post('/number', function(req, res) {
      const correct = 12;
      let guess = req.body.guess
      let result = ""

      if (guess === correct) {
        result = "correct";
      } else if (guess > correct) {
        result = "high";
      } else if (guess < correct) {
        result = "low";
      }

      res.json({ result })
    });
    ```

2.  Push your changes to the cloud.

    ```bash
    $ amplify push
    ```

The `Guesses` API handler logic that implements your new number guessing functionality is now deployed to the cloud.

### Connect to Your Backend

You will now use a simple component could be added to connect your API backend in your app to play the number guessing
game.

#### Make a Guess

The `API` module from AWS Amplify allows you to send requests to your Cloud APIs from your JavaScript application.

**To make a RESTful API call**

1.  Import the `API` module from `aws-amplify` in the `GuessNumber` component file.

    ```js
    import { API } from 'aws-amplify';
    ```

2.  Add the `makeGuess` function. This function uses the `API` module’s `post` function to submit a guess to the Cloud Logic API.

    ```js
    async makeGuess() {
      const guess = parseInt(this.refs.guess.value);
      const body = { guess }
      const { result } = await API.post('Guesses', '/number', { body });
      this.setState({
        guess: result
      });
    }
    ```

3.  Change the Guess button in the component’s `render` function to invoke the `makeGuess` function when it is
    clicked.

    ```html
    <button type="submit" onClick={this.makeGuess.bind(this)}>Guess</button>
    ```

Open your app locally and test guessing the number by running
`amplify run`.

Your entire component should look like the following:

#### Learn More

-   Learn how to retrieve specific items and more with the [API module in AWS Amplify](https://aws-amplify.github.io/amplify-js/media/api_guide.html).
-   Learn more about what happens behind the scenes, see [Set up Lambda and API Gateway](https://alpha-docs-aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html).

## Add Cloud Database

The Amplify CLI and Amplify library make it easy to perform create, read, update, and delete ("CRUD") actions against data stored in the cloud through simple API calls in your JavaScript app.

### Set Up Your Backend

**To create a database**

1.  Enable the NoSQL database feature and configure your table.

    In the root folder of your app, run the following command and select *NoSQL Database* as the service type:

    ```bash
    $ amplify add storage
    ```

2.  Choose `Open` to make the data in this table viewable by all users of your application.

    ```terminal
    ? Should the data of this table be open or restricted by user?
    ❯ Open
      Restricted
    ```

3.  For this example type in todos as your `Table name`.

    ```terminal
    ? Please provide table name:  todos
    ```

### Add columns and queries

You are creating a table in a [NoSQL database](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.html) and adding an initial set of columns, each of which has a name and a data type. NoSQL lets you add a column any time you store data that contains a new column. NoSQL tables must have one column defined as the Primary Key, which is a unique identifier for each row.

1.  For this example, follow the prompts to add three columns: team (string), todoId (number), and text (string).

    ```terminal
    ? What would you like to name this column: team
    ? Choose the data type: string
    ```

2.  When prompted to `? Add another column`, type Y and then choose enter. Repeat the steps to create *todoId* and *text*
    columns.

3.  Select `team` as the primary key.

    ```terminal
    ? Please choose partition key for the table:
    ❯ team
      todoId
      text
    ```

4.  Choose `(todoId)` as the sort key and then `no` to adding any more indexes, to keep the example simple.

    ```terminal
    ? Please choose sort key for the table: 
    ❯ todoId
      text
      (No Sort Key)

    ? Do you want to add global secondary indexes to your table? (Y/n) n
    Table todos saved.
    ```

    The `todos` table is now created.

### Use a cloud API to do CRUD operations

To access your NoSQL database, you will create an API that can be called from your app to perform CRUD operations.

**To create a CRUD API**

1.  Create a new API with the following command, and select 'REST' as the service type.

    ```bash
    $ amplify add api
    ```
    
    When prompted, provide friendly names for your resources and Choose `CRUD function for Amazon DynamoDB table` template to create your new API.

    ```terminal
    ? Provide a friendly name for your resource to be used as a label for this category in the project: todosCRUD
    ? Provide a path (e.g., /items) /todos
    ? Choose a Lambda source Create a new Lambda function
    ? Provide a friendly name for your resource to be used as a label for this category in the project: todosCRUD
    ? Provide the AWS Lambda function name: todosCRUD
    ? Choose the function template that you want to use:
    ❯ CRUD function for Amazon DynamoDB table (Integration with Amazon API Gateway and Amazon DynamoDB)
    ```

3.  Select the `todos` table created in the previous steps, and choose enter.

    ```terminal
    ? Choose a DynamoDB data source option Use DynamoDB table configured in the current Amplify project
    ? Choose from one of the already configured DynamoDB tables (Use arrow keys)
    ❯ todos
    ```

4.  Push your configuration to the cloud. 

    ```bash
    $ amplify push
    ```

The required DynamoDB tables, API Gateway endpoints, and Lambda functions will now be created.

### Create your first Todo

The Amplify CLI enables you to test your API from the command line. Run the following command to create your first todo.

```bash
$ amplify function invoke todosCRUD POST /todos '{"body": {"team": "React", "todoId": 1, "text": "Learn more Amplify"}}'
```

The CLI utilizes [AWS Serverless Express](https://github.com/awslabs/aws-serverless-express) to invoke your backend APIs locally. When you run an *invoke* command, the CLI starts an Express server which you need to manually close after testing your API (Use Ctrl-c to close the server).
{: .callout .callout--info}

### Connect to Your Backend

The following component is a simple Todo list that you will add to your project. The Todos component currently adds and displays `todos` to and from an in-memory array.

### Displaying todos from the cloud

The `API` module from AWS Amplify allows you to connect to
DynamoDB through endpoints.

**To retrieve and display items in a database**

1.  Import the `API` module from `aws-amplify`
    at the top of the Todos component file.

    ```js
    import { API } from 'aws-amplify';
    ```

2.  Add the following `componentDidMount` to the
    `Todos` component to fetch all of the
    `todos`.

    ```js
    async componentDidMount() {
      let todos = await API.get('todosCRUD', `/todos/${this.state.team}`);
      this.setState({ todos });
    }
    ```

When the `Todos` component mounts it will fetch all of the
`todos` stored in your database and display them.

### Saving todos to the cloud

The following fragment shows the `saveTodo` function for
the Todo app.

```js
async saveTodo(event) {
  event.preventDefault();

  const { team, todos } = this.state;
  const todoId = todos.length + 1;
  const text = this.refs.newTodo.value;

  const newTodo = {team, todoId, text};
  await API.post('todosCRUD', '/todos', { body: newTodo });
  todos.push(newTodo);
  this.refs.newTodo.value = '';
  this.setState({ todos, team });
}
```

Update the `form` element in the component's render
function to invoke the `saveTodo` function when the form is
submitted.

```js
<form onSubmit={this.saveTodo.bind(this)}>
```

## Add Analytics

To add analytics to your app, run the following command and name your Amazon Pinpoint resource when prompted:

```bash
$ amplify add analytics
$ amplify push
```

When you enable analytics and launch your app, session and device demographics data will flow to Amazon Pinpoint analytics backend.

**To send basic app usage analytics to AWS**

Launch your app locally by running:

```bash
npm start
```

When you use your app the [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/) service gathers and visualizes analytics data.

**To view the analytics using the Amazon Pinpoint console**

1.  Run `npm start`, `amplify run`, or `amplify publish --test` at least once.
2.  Run the following command to open Amazon Pinpoint console:

    ```bash
    amplify console analytics
    ```

3.  Choose the Analytics icon on the left, to navigate to your project in the [Amazon Pinpoint console](https://console.aws.amazon.com/pinpoint/).

4.  Choose Analytics on the left.

You should see an uptick in several graphs.

### Add Custom Analytics to Your App

You can configure your app so that [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/) gathers data for custom events that you register within the flow of your code.

**To instrument custom analytics in your app**

In the file containing the event you want to track, add the following
import:

```js
import { Analytics } from 'aws-amplify';
```

Add a call like the following to the spot in your JavaScript where the tracked event should be fired:

```js
componentDidMount() {
   Analytics.record('FIRST-EVENT-NAME');
}
```

Or to relevant page elements:

```js
handleClick = () => {
     Analytics.record('SECOND-EVENT-NAME');
}

<button onClick={this.handleClick}>Call request</button>
```

**To test:**

1.  Save the changes and run `npm start`,
    `amplify run`, or
    `amplify publish` to launch your app. Use your app so that tracked events are triggered.
2.  In the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/), choose Events
    near the top.
3.  Select an event in the Event drop-down menu on the left.

Custom event data may take a few minutes to become visible in the
console.

### Learn More

Learn more about [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/welcome.html).

## Deploy your App

AWS Amplify provides hosting for your Web app or static website with Amplify CLI.  

Amplify CLI provides a one-line deploy command that pushes your app’s static assets to the Content Delivery Network (CDN). Using a CDN dramatically increases your app’s loading performance by serving your content to your users from the nearest edge location.

```bash
$ amplify publish
```

**About Hosting and Streaming**

The AWS Mobile Hosting and Streaming feature are especially useful to web developers. It uses the capabilities of [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Introduction.html) buckets to host the content, and the [Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) content distribution network (CDN) to deliver content globally. 

Amazon CloudFront endpoints can also stream media content. If you configure [CloudFront
streaming](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Tutorials.html), then media content you upload to your bucket can be streamed from those endpoints.

### Configure a Custom Domain for Your Web App

To use your custom domain for linking to your Web app, use the service to configure DNS routing.

For a web app hosted in a single location, see [Routing Traffic to a Website that Is Hosted in an Amazon S3 Bucket](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/RoutingToS3Bucket.html).

For a web app distributed through a global CDN, see [Routing Traffic to an Amazon CloudFront Web Distribution by Using Your Domain Name](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html).
