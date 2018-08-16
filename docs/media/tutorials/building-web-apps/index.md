Building Web Apps with AWS Amplify
===========

Overview
--------

The AWS Amplify and the CLI provides a developer experience that allows frontend JavaScript developers to create and integrate backend resources into their apps quickly. In this tutorial, you will learn how to build a cloud-enabled web app with React and AWS Amplify.

**By completing this tutorial, you will be able to;**
- Use Amplify CLI to create your backend
- Configure and integrate your backend into your JavaScript app 
- Deploy your web app for delivery

## Set Up and Installation 

### Prerequisites

1.  [Sign up for the AWS Free Tier](https://aws.amazon.com/free/).
2.  Install [Node.js](https://nodejs.org/en/download/) with NPM.
3.  Install Amplify CLI

    ```bash
    npm install -g @aws-amplify/cli
    ```

4.  Configure the CLI with your AWS credentials

    To set up permissions for the toolchain used by the CLI, run:

    ```bash
    amplify configure
    ```

    If prompted for credentials, follow the steps provided by the CLI.

### Set Up Your Backend

**To configure backend features for your app**

1.  In the root folder of your app, run:

    ```bash
    amplify init
    ```

    The `init` command creates a backend project for your
    app. By default, analytics and web hosting are enabled in your
    backend, and this configuration is automatically pulled into your app
    when you initialize.

2.  When prompted, provide the source directory for your project. The
    CLI will generate aws-exports.js in this location. This file
    contains the configuration and endpoint metadata used to link your
    frontend to your backend services.

    ```bash
    ? Where is your project's source directory:  src
    ```

3.  Respond to further prompts with the following values.

    ```bash
    ? Where is your project's distribution directory to store build artifacts:  build
    ? What is your project's build command:  npm run-script build
    ? What is your project's start command for local test run:  npm run-script start
    ? What amplify project name would you like to use:  YOUR-APP-NAME-2017-11-10-15-17-48
    ```

After the project is created, you will get a success message which also
includes details on the path where the *aws-exports.js* is copied.

```bash
> amplify project's details logged at: amplifyjs/#current-backend-info/backend-details.json
> amplify project's access information logged at: amplifyjs/#current-backend-info/aws-exports.js
> amplify project's access information copied to: src/aws-exports.js
> amplify project's specifications logged at: amplifyjs/#current-backend-info/mobile-hub-project.yml
> contents in #current-backend-info/ is synchronized with the latest information in the aws cloud
```

Your project is now initialized.

#### Connect to Your Backend

AWS Mobile uses the open source [AWS Amplify
library](https://aws.github.io/aws-amplify) to link your code to the AWS
features configured for your app.

This section of the guide shows examples using a React application of
the kind output by `create-react-app` or a similar tool.

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

Your app is now ready to launch and use the default features configured
by AWS Mobile.

**To launch your app locally in a browser**

In the root folder of your app, run:

```bash
amplify run
```

Behind the scenes, this command runs `npm install` to
install the Amplify library and also pushes any backend configuration
changes to AWS Mobile. To run your app locally without pushing backend
changes you can choose to run `npm install` and then
run `npm start`.

Anytime you launch your app,
app analytics are gathered and can be visualized 
in the AWS console.

### Deploy your app to the cloud

Using a simple command, you can publish your app's frontend to hosting
on a robust content distribution network (CDN) and view it in a browser.

**To deploy your app to the cloud and launch it in a browser**

In the root folder of your app, run:

```bash
amplify publish
```

To push any backend configuration changes to AWS and view content
locally, run `amplify run`. In both cases, any pending
changes you made to your backend configuration are made to your backend
resources.

By default, the CLI configures AWS Mobile
Hosting and Streaming feature, that hosts
your app on [Amazon CloudFront](https://aws.amazon.com/cloudfront/) CDN
endpoints. These locations make your app highly available to the public
on the Internet and support [media file
streaming](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/url-cf-dev;Tutorials.html)

You can also use a custom domain for your
hosting location.

### Test Your App on Our Mobile Devices

Invoke a free remote test of your app on a variety of real devices and
see results, including screenshots.

**To invoke a remote test of your app**

In the root folder of your app, run:

```bash
amplify publish --test
```

The CLI will open the reporting page for your app in the console to show
the metrics gathered from the test devices. The device that runs the
remote test you invoke resides in [AWS Device
Farm](https://aws.amazon.com/device-farm/) which provides flexible
configuration of tests and reporting.

## Add Auth / User Sign-in

The Amplify CLI components for user authentication include a rich,
configurable UI for sign-up and sign-in.

**To enable the Auth features**

In the root folder of your app, run:

```bash
amplify add auth
amplify push
```

### Connect to Your Backend

The Amplify CLI enables you to integrate ready-made
sign-up/sign-in/sign-out UI from the command line.

**To add user auth UI to your app**

1.  Install AWS Amplify for React library.

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
`amplify publish --test`.

Learn more about the AWS Mobile User Sign-in feature, which uses [Amazon
Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/welcome.html).

## Add Cloud Storage

The Amplify CLI and AWS Amplify library make it easy to store and
manage files in the cloud from your JavaScript app.

### Set Up the Backend

Enable the User File Storage feature by running the following commands
in the root folder of your app.

```bash
amplify add storage

amplify push
```

### Connect to the Backend

The examples in this section show how you would integrate AWS Amplify
library calls using React (see the [AWS Amplify
documentation](https://aws.github.io/aws-amplify) to use other flavors
of Javascript).

The following simple component could be added to a
`create-react-app` project to present an interface that
uploads images and download them for display.

### Upload a file

The `Storage` module enables you to upload files to the
cloud. All uploaded files are publicly viewable by default.

Import the `Storage` module in your component file.

```js
// ./src/ImageViewer.js

import { Storage } from 'aws-amplify';
```

Add the following function to use the `put` function on the
`Storage` module to upload the file to the cloud, and set
your component’s state to the name of the file.

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

### Next Steps

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

1.  In the root folder of your app, run:

    ```bash
    amplify cloud-api enable --prompt
    ```

2.  When prompted, name the API Guesses.

    ```bash
    ? API name: Guesses
    ```

3.  Name an HTTP path /number. This maps to a method call in the API
    handler.

    ```bash
    ? HTTP path name (/items): /number
    ```

4.  Name your Lambda API handler function guesses.

    ```bash
    ? Lambda function name (This will be created if it does not already exist): guesses
    ```

5.  When prompted to add another HTTP path, type N.

    ```bash
    ? Add another HTTP path (y/N): N
    ```

6.  The configuration for your Guesses API is now saved locally. Push
    your configuration to the cloud.

    ```bash
    amplify push
    ```

**To test your API and handler**

From the command line, run:

```bash
amplify cloud-api invoke Guesses GET /number
```

The Cloud Logic API endpoint for the `Guesses` API is now created.

### Customize Your API Handler Logic

The Amplify CLI has generated a Lambda function to handle calls to the `Guesses` API. It is saved locally in
YOUR-APP-ROOT-FOLDER/amplifyjs/backend/cloud-api/guesses. The app.js file in that directory contains the definitions and functional code for all of the paths that are handled for your API.

**To customize your API handler**

1.  Find the handler for POST requests on the `/number` path. That line starts with `app.post('number',`. Replace the callback function’s body with the following:

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
    amplify push
    ```

The `Guesses` API handler logic that implements your new number guessing functionality is now deployed to the cloud.

### Connect to Your Backend

The examples in this section show how you would integrate AWS Amplify library calls using React (see the [AWS Amplify
documentation](https://aws.github.io/aws-amplify/) to use other flavors of Javascript).

The following simple component could be added to a `create-react-app` project to present the number guessing
game.

#### Make a Guess

The `API` module from AWS Amplify allows you to send requests to your Cloud Logic APIs right from your JavaScript application.

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

#### Next Steps

-   Learn how to retrieve specific items and more with the [API module in AWS Amplify](https://aws.github.io/aws-amplify/media/api_guide.html).
-   Learn more about what happens behind the scenes, see [Set up Lambda and API Gateway](https://alpha-docs-aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html).

## Add Cloud Database

The Amplify CLI and Amplify library make it easy to perform create, read, update, and delete ("CRUD") actions against data stored in the cloud through simple API calls in your JavaScript app.

### Set Up Your Backend

**To create a database**

1.  Enable the NoSQL database feature and configure your table.

    In the root folder of your app, run:

    ```bash
    amplify database enable --prompt
    ```

2.  Choose `Open` to make the data in this table viewable by all users of your application.

    ```bash
    ? Should the data of this table be open or restricted by user?
    ❯ Open
      Restricted
    ```

3.  For this example type in todos as your `Table name`.

    ```bash
    ? Table name: todos
    ```

### Add columns and queries

You are creating a table in a [NoSQL database](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.html) and adding an initial set of columns, each of which has a name and a data type. NoSQL lets you add a column any time you store data that
contains a new column. NoSQL tables must have one column defined as the Primary Key, which is a unique identifier for each row.

1.  For this example, follow the prompts to add three columns: team (string), todoId (number), and text (string).

    ```bash
    ? What would you like to name this column: team
    ? Choose the data type: string
    ```

2.  When prompted to `? Add another column`, type Y and then choose enter. Repeat the steps to create todoId and text
    columns.

3.  Select `team` as the primary key.

    ```bash
    ? Select primary key
    ❯ team
      todoId
      text
    ```

4.  Choose `(todoId)` as the sort key and then `no` to adding any more indexes, to keep the example simple.

    ```bash
    ? Select sort key
    ❯ todoId
      text
      (No Sort Key)

    ? Add index (Y/n): n
    Table todos saved.
    ```

    The `todos` table is now created.

### Use a cloud API to do CRUD operations

To access your NoSQL database, you will create an API that can be called from your app to perform CRUD operations.

**To create a CRUD API**

1.  Enable and configure the Cloud Logic feature

    ```bash
    amplify cloud-api enable --prompt
    ```

2.  Choose `Create CRUD API for an existing Amazon DynamoDB table` API for an existing Amazon DynamoDB table" and then choose enter.

    ```bash
    ? Select from one of the choices below. (Use arrow keys)
      Create a new API
    ❯ Create CRUD API for an existing Amazon DynamoDB table
    ```

3.  Select the `todos` table created in the previous steps, and choose enter.

    ```bash
    ? Select Amazon DynamoDB table to connect to a CRUD API
    ❯ todos
    ```

4.  Push your configuration to the cloud. Without this step, the configuration for your database and API is now in place only on your local machine.

    ```bash
    amplify push
    ```

The required DynamoDB tables, API Gateway endpoints, and Lambda functions will now be created.

### Create your first Todo

The Amplify CLI enables you to test your API from the command line.

Run the following command to create your first todo.

```bash
amplify cloud-api invoke todosCRUD POST /todos '{"body": {"team": "React", "todoId": 1, "text": "Learn more Amplify"}}'
```

### Connect to Your Backend

The examples in this section show how you would integrate AWS Amplify
library calls using React (see the [AWS Amplify
documentation](https://aws.github.io/aws-amplify/) to use other flavors
of Javascript).

The following component is a simple Todo list that you might add to a
`create-react-app` project. The Todos component currently
adds and displays `todos` to and from an in-memory array.

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

When you complete the Amplify CLI setup and launch your app, anonymized session and device demographics data flow to the AWS analytics backend.

**To send basic app usage analytics to AWS**

Launch your app locally by running:

```bash
npm start
```

When you use your app the [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/) service gathers and visualizes analytics data.

**To view the analytics using the Amazon Pinpoint console**

1.  Run `npm start`, `amplify run`, or `amplify publish --test` at least once.
2.  Open your project in the [AWS Mobile Hub console](https://console.aws.amazon.com/mobilehub/).

    ```bash
    amplify console
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
    `amplify publish --test` to launch your app. Use your app so that tracked events are triggered.
2.  In the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/), choose Events
    near the top.
3.  Select an event in the Event drop-down menu on the left.

Custom event data may take a few minutes to become visible in the
console.

### Next Steps

Learn more about the analytics in AWS Mobile which is a part of the
Messaging and Analytics feature. This feature uses [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/welcome.html).

## Deploy your App

AWS Amplify provides hosting for your Web app or static website with Amplify CLI.  

Amplify CLI provides a one-line deploy command that pushes your app’s static assets to the Content Delivery Network (CDN). Using a CDN dramatically increases your app’s loading performance by serving your content to your users from the nearest edge location.

```bash
amplify publish
```

**About Hosting and Streaming**

The AWS Mobile Hosting and Streaming feature are especially useful to web developers. It uses the ability of [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Introduction.html) buckets to statically host content and the [Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) content distribution network (CDN) to host on an endpoint close to every user globally. Amazon CloudFront endpoints can also stream media content.

When you enable Hosting and Streaming an global content delivery network (CDN) distribution is created and associated with your bucket. When propagates the sample web app content to the bucket, the content is then
propagated to the CDN and becomes available from local endpoints around the globe. If you configure [CloudFront
streaming](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Tutorials.html), then media content you upload to your bucket can be streamed from those endpoints.

**To view the Hosting and Streaming Sample App**

The Hosting and Streaming feature creates a sample JavaScript web app that demonstrates connecting to the AWS resources of your project.

The sample app web assets are deployed to a bucket. The bucket is configured to host static web content for public access.

1.  In the [Mobile Hub console](https://console.aws.amazon.com/mobilehub/home/), open your
    project and then choose the Hosting and Streaming tile.
2.  Choose View from S3.
    This opens a browser and displays the index.html of the sample web app from the bucket.

### Configure a Custom Domain for Your Web App

To use your custom domain for linking to your Web app, use the service to configure DNS routing.

For a web app hosted in a single location, see [Routing Traffic to a Website that Is Hosted in an Amazon S3 Bucket](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/RoutingToS3Bucket.html).

For a web app distributed through a global CDN, see [Routing Traffic to an Amazon CloudFront Web Distribution by Using Your Domain Name](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html).
