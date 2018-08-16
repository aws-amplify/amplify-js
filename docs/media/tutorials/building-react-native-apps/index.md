Building a React Native App with AWS Amplify
===========

Overview
--------

The AWS Amplify and the CLI provides a developer experience that allows frontend JavaScript developers to quickly create React Native apps and integrate backend resources into their apps. In this tutorial, you will learn how to build a cloud-enabled mobile app with React Native and AWS Amplify.

**By completing this tutorial, you will be able to;**
- Use Amplify CLI to create your backend
- Configure and integrate your backend into your React Native app 
- Deploy your mobile app for delivery

## Set Up and Installation 

### Prerequisites

1.  [Sign up for the AWS Free Tier](https://aws.amazon.com/free/) to
    learn and prototype at little or no cost.
2.  Install [Node.js](https://nodejs.org/en/download/) with NPM.
3.  Install the Amplify CLI

    ```bash
    npm install --global @aws-amplify/cli
    ```

4.  Configure the CLI with your AWS credentials

    To set up permissions for the toolchain used by the CLI, run:

    ```bash
    amplify configure
    ```

    If prompted for credentials, follow the steps provided by the CLI.
    For more information, see
    Provide IAM credentials to Amplify CLI &lt;aws-mobile-cli-credentials&gt;.

### Set Up Your Backend

**To configure backend features for your app**

1.  In the root folder of your app, run:

    ```bash
    amplify init
    ```

    The `init` command creates a backend project for your
    app. By default, analytics and web hosting are enabled in your
    backend and this configuration is automatically pulled into your app
    when you initialize.

2.  When prompted, provide the source directory for your project. The
    CLI will generate aws-exports.js in this location. This file
    contains the configuration and endpoint metadata used to link your
    frontend to your backend services.

    ```bash
    ? Where is your project's source directory:  /
    ```

    Then respond to further prompts with the following values.

    ```bash
    Please tell us about your project:
    ? Where is your project's source directory:  /
    ? Where is your project's distribution directory that stores build artifacts:  build
    ? What is your project's build command:  npm run-script build
    ? What is your project's start command for local test run:  npm run-script start
    ```

### Connect to Your Backend

AWS Mobile uses the open source [AWS Amplify
library](https://github.com/aws/aws-amplify) to link your code to the
AWS features configured for your app.

**To connect the app to your configured AWS services**

1.  Install AWS Amplify for React Native library.

    ```bash
    npm install --save aws-amplify
    ```

2.  In App.js (or in other code that runs at launch-time), add the
    following imports.

    ```js
    import Amplify from 'aws-amplify';

    import aws_exports from './YOUR-PATH-TO/aws-exports';
    ```

3.  Then add the following code.

    ```js
    Amplify.configure(aws_exports);
    ```

### Run Your App Locally

Your app is now ready to launch and use the default services configured
by AWS Mobile.

**To launch your app locally**

Use the command native to the React Native tooling you are using. For
example, if you made your app using
`create-react-native-app` then run:

```bash
npm run android

# OR

npm run ios
```

Anytime you launch your app,
app usage analytics are gathered and can be visualized
in an AWS console.

To learn more about the commands and usage of the Amplify CLI, see
the [Amplify CLI reference](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html).
{: .callout .callout--info}

## Add Auth / User Sign-in

The Amplify CLI components for user authentication include a rich,
configurable UI for sign-up and sign-in.

**To enable the Auth features**

In the root folder of your app, run:

```js
$ amplify add auth
$ amplify push
```

#### Connect to Your Backend

The Amplify CLI enables you to integrate ready-made
sign-up/sign-in/sign-out UI from the command line.

**To add user auth UI to your app**

1.  Install AWS Amplify for React Native library.

    ```bash
    npm install --save aws-amplify
    npm install --save aws-amplify-react-native
    ```

<!-- -->

1.  Add the following import in App.js (or another file that runs upon app
    startup):

    ```js
    import { withAuthenticator } from 'aws-amplify-react-native';
    ```

2.  Then change `export default App;` to the following.

    ```js
    export default withAuthenticator(App);
    ```

To test, run `npm start` or `amplify run`.

Learn more about the AWS Mobile User Sign-in feature, which uses [Amazon Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/welcome.html).
{: .callout .callout--info}


## Add Cloud APIs

The AWS Mobile Cloud Logic feature lets you call APIs in the cloud. Your serverless Lambda functions handle API calls.

**To enable cloud APIs in your app**

```bash
amplify cloud-api enable
amplify push
```

Enabling Cloud Logic in your app adds a sample API,
`sampleCloudApi` to your project that can be used for
testing.

You can find the sample handler function for the API by running
`amplify console` in your app root folder, and then
choosing the Cloud Logic feature in your project.

![View your sample cloud API and its lambda function handler.]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/web-view-cloud-api.png)

### Quickly Test Your API From the CLI

The `sampleCloudApi` and its handler function allow you to
make end-to-end API calls.

**To test invocation of your unsigned APIs in the development
environment**

```bash
amplify cloud-api invoke <apiname> <method> <path> [init]
```

For the `sampleCloudApi` you may use the following examples
to test the `post` method

```bash
amplify cloud-api invoke sampleCloudApi post /items '{"body": {"testKey":"testValue"}}'
```

This call will return a response similar to the following.

```js
{   success: 'post call succeed!',
    url: '/items',
    body: {
        testKey: 'testValue' 
    } 
}
```

**To test the :get method**

```bash
$ amplify cloud-api invoke sampleCloudApi get /items
```

This will return a response as follows.

```js
{ success: 'get call succeed!', url: '/items' }
```

### Connect to Your Backend

Once you have created your own Cloud Logic APIs and
Lambda functions, you can call them from your app.

**To call APIs from your app**

In App.js (or other code that runs at launch-time), add the following
import.

```js
import Amplify, { API } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

Then add this to the component that calls your API.

```js
state = { apiResponse: null };

async getSample() {
 const path = "/items"; // you can specify the path
  const apiResponse = await API.get("sampleCloudApi" , path); //replace the API name
  console.log('response:' + apiResponse);
  this.setState({ apiResponse });
}
```

To invoke your API from a UI element, add an API call from within your
component's `render()` method.

```html
<View>
   <Button title="Send Request" onPress={this.getSample.bind(this)} />
   <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
</View>
```

To test, save the changes, run `npm run android` or
`npm run ios` to launch your app. Then try the UI element
that calls your API.

Learn more about the AWS Mobile Cloud Logic feature which uses [Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) and [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html).
{: .callout .callout--info}

To be guided through creation of an API and it's handler, run
`amplify console` to open your app in the console, and
choose Cloud Logic.

## Add Cloud Database

AWS Mobile `database` feature enables you to create tables
customized to your needs. The CLI then guides you to create a custom API
to access your database.

### Create a table

**To create a table:**

1.  In your app root folder, run:

    ```
    amplify database enable --prompt
    ```

2.  Design your table when prompted by the CLI.

    The CLI will prompt you for the table and other table configurations
    such as columns.

    ```
    Welcome to NoSQL database wizard
    You will be asked a series of questions to help determine how to best construct your NoSQL database table.

    ? Should the data of this table be open or restricted by user? Open
    ? Table name Notes

    You can now add columns to the table.

    ? What would you like to name this column NoteId
    ? Choose the data type string
    ? Would you like to add another column Yes
    ? What would you like to name this column NoteTitle
    ? Choose the data type string
    ? Would you like to add another column Yes
    ? What would you like to name this column NoteContent
    ? Choose the data type string
    ? Would you like to add another column No
    ```

    **Primary Key and Sort Key**

    Choose a [Primary Key](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)
    that will uniquely identify each item. Optionally, choose a column
    to be a Sort Key when you will commonly use those values in
    combination with the Primary Key for sorting or searching your data.
    You can additional sort keys by adding a [Secondary
    Index](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.SecondaryIndexes)
    for each column you will want to sort by.

    ```
    Before you create the database, you must specify how items in your table are uniquely organized. This is done by specifying a Primary key. The primary key uniquely identifies each item in the table, so that no two items can have the same key.
    This could be an individual column or a combination that has "primary key" and a "sort key."
    To learn more about primary key:
    http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey

    ? Select primary key NoteId
    ? Select sort key (No Sort Key)

    You can optionally add global secondary indexes for this table. These are useful when running queries defined by a different column than the primary key.

    To learn more about indexes:
    http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.SecondaryIndexes

    ? Add index No
    Table Notes added
    ```

### Create a CRUD API

Amplify CLI will create a custom API for your app to perform create,
read, update, and delete (CRUD) actions on your database.

**To create a CRUD API for your table**

1.  In the root folder of your app, run:

    ```bash
    amplify cloud-api enable --prompt
    ```

2.  When prompted, choose
    `Create CRUD API for existing Dynamo table`, select the
    table name from the previous steps, choose the access permissions
    for the table. Using the example table from the previous section:

    ```bash
    ? Select from one of the choices below.
      Create a new API
    ❯ Create CRUD API for an existing Amazon DynamoDB table
    ```

    The prompt response will be:

    ```bash
    Path to be used on API for get and remove an object should be like:
    /Notes/object/:NoteId

    Path to be used on API for list objects on get method should be like:
    /Notes/:NoteId

    JSON to be used as data on put request should be like:
    {
      "NoteTitle": "INSERT VALUE HERE",
      "NoteContent": "INSERT VALUE HERE",
      "NoteId": "INSERT VALUE HERE"
    }
    To test the api from the command line (after amplify push) use this commands
    amplify cloud-api invoke NotesCRUD <method> <path> [init]
    Api NotesCRUD saved
    ```

    Copy and keep the path of your API and the JSON for use in your app
    code.

    This feature will create an API using Amazon API Gateway and AWS
    Lambda. You can optionally have the lambda function perform CRUD
    operations against your Amazon DynamoDB table.

3.  Update your backend.

    To create the API you have configured, run:

    ```js
    amplify push
    ```

    Until deployment of API to the cloud the has completed, the CLI
    displays the message:
    `cloud-api update status: CREATE_IN_PROGRESS`. Once
    deployed a successful creation message
    `cloud-api update status: CREATE_COMPLETE` is
    displayed.

    You can view the API that the CLI created by running
    `amplify console` and then choosing Cloud Logic in the
    console.

### Connect to Your Backend

**To access database tables from your app**

1.  In App.js import the following.

    ```js
    import Amplify, { API } from 'aws-amplify';
    import aws_exports from 'path_to_your_aws-exports';
    Amplify.configure(aws_exports);
    ```

2.  Add the following `state` to your component.

    ```js
    state = {
      apiResponse: null,
      noteId: ''
    };
    
    handleChangeNoteId = (event) => {
        this.setState({noteId: event});
    }
    ```

### Save an item (create or update)

**To save an item**

In the part of your app where you access the database, such as an event
handler in your React component, call the `put` method. Use
the JSON and the root path (`/Notes`) of your API that you
copied from the CLI prompt response earlier.

```js
// Create a new Note according to the columns we defined earlier
  async saveNote() {
    let newNote = {
      body: {
        "NoteTitle": "My first note!",
        "NoteContent": "This is so cool!",
        "NoteId": this.state.noteId
      }
    }
    const path = "/Notes";

    // Use the API module to save the note to the database
    try {
      const apiResponse = await API.put("NotesCRUD", path, newNote)
      console.log("response from saving note: " + apiResponse);
      this.setState({apiResponse});
    } catch (e) {
      console.log(e);
    }
  }
```

To use the command line to see your saved items in the database run:

```
amplify cloud-api invoke NotesCRUD GET /Notes/object/${noteId}
```

### Get a specific item

**To query for a specific item**

Call the `get` method using the API path (copied earlier)
to the item you are querying for.

```js
// noteId is the primary key of the particular record you want to fetch
    async getNote() {
      const path = "/Notes/object/" + this.state.noteId;
      try {
        const apiResponse = await API.get("NotesCRUD", path);
        console.log("response from getting note: " + apiResponse);
        this.setState({apiResponse});
      } catch (e) {
        console.log(e);
      }
    }
```

### Delete an item

**To delete an item**

Add this method to your component. Use your API path (copied earlier).

```js
// noteId is the NoteId of the particular record you want to delete
    async deleteNote() {
      const path = "/Notes/object/" + this.state.noteId;
      try {
        const apiResponse = await API.del("NotesCRUD", path);
        console.log("response from deleteing note: " + apiResponse);
        this.setState({apiResponse});
      } catch (e) {
        console.log(e);
      }
    }
```

### UI to exercise CRUD calls

The following is an example of how you might construct UI to exercise
these operations.

```js
<View style={styles.container}>
        <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
        <Button title="Save Note" onPress={this.saveNote.bind(this)} />
        <Button title="Get Note" onPress={this.getNote.bind(this)} />
        <Button title="Delete Note" onPress={this.deleteNote.bind(this)} />
        <TextInput style={styles.textInput} autoCapitalize='none' onChangeText={this.handleChangeNoteId}/>
</View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
      margin: 15,
      height: 30,
      width: 200,
      borderWidth: 1,
      color: 'green',
      fontSize: 20,
      backgroundColor: 'black'
   }
});
```

Learn more about the AWS Mobile NoSQL Database feature, which uses [Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html).
{: .callout .callout--info}

## Add Cloud Storage

The Amplify CLI User Data Storage feature
enables apps to store user files in the cloud.

### Set Up Your Backend

**To configure your app's cloud storage location**

In your app root folder, run:

```bash
amplify add storage
amplify push
```

### Connect to Your Backend

**To add User Data Storage to your app**

In your component where you want to transfer files:

Import the `Storage` module from aws-amplify and configure
it to communicate with your backend.

```js
import { Storage } from 'aws-amplify';
```

Now that the Storage module is imported and ready to communicate with
your backend, implement common file transfer actions using the code
below.

### Upload a file

**To upload a file to storage**

Add the following methods to the component where you handle file
uploads.

```js
async uploadFile() {
  let file = 'My upload text';
  let name = 'myFile.txt';
  const access = { level: "public" }; // note the access path
  Storage.put(name, file, access);
}
```

### Get a specific file

**To download a file from cloud storage**

Add the following code to a component where you display files.

```js
async getFile() {
  let name = 'myFile.txt';
  const access = { level: "public" };
  let fileUrl = await Storage.get(name, access);
  // use fileUrl to get the file
}
```

### List all files

**To list the files stored in the cloud for your app**

Add the following code to a component where you list a collection of
files.

```js
async componentDidMount() {
  const path = this.props.path;
  const access = { level: "public" };
  let files = await Storage.list(path, access);
   // use file list to get single files
}
```

Use the following code to fetch file attributes such as the size or time
of last file change.

```js
file.Size; // file size
file.LastModified.toLocaleDateString(); // last modified date
file.LastModified.toLocaleTimeString(); // last modified time
```

### Delete a file

Add the following statement to the element where you handle file transfers.

```js
async deleteFile(key) {
  const access = { level: "public" };
  Storage.remove(key, access);
}
```

## Add Analytics

When you complete the Amplify CLI setup and launch your app,
anonymized session and device demographics data flows to the AWS
analytics backend.

**To send basic app usage analytics to AWS**

Launch your app locally, for instance, if you created your app using
`create-react-native-app`, by running:

```bash
npm run android

# Or

npm run ios
```

When you use your app the [Amazon
Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/)
service gathers and visualizes analytics data.

**To view the analytics using the Amazon Pinpoint console**

1.  Launch your app at least once.
2.  Open your project in the [AWS Mobile Hub
    console](https://console.aws.amazon.com/mobilehub/).

    ```bash
    amplify console
    ```

3.  Choose the Analytics icon on the left, to navigate to your project
    in the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/).
4.  Choose Analytics on the left.

You should see an uptick in several graphs.

### Add Custom Analytics to Your App

You can configure your app so that [Amazon
Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/)
gathers data for custom events that you register within the flow of your
code.

**To instrument custom analytics in your app**

In the file containing the event you want to track, add the following
import:

```js
import { Analytics } from 'aws-amplify';
```

Add a call like the following to the spot in your JavaScript where
the tracked event should be fired:

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

<Button title="Record event" onPress={this.handleClick}/>
```

To test:

1.  Save the changes and launch your app. Use your app, so that tracked
    events are triggered.
2.  In the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/), choose Events
    near the top.
3.  Select an event in the Event drop-down menu on the left.

Custom event data may take a few minutes to become visible in the
console.

Learn more about the analytics in AWS Mobile which is part of the Messaging and Analytics feature. This
feature uses [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/welcome.html).
{: .callout .callout--info}

