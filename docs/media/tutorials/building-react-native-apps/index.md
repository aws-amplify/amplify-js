<html>
  <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->     <script async src="https://www.googletagmanager.com/gtag/js?id=UA-115615468-1"></script>     <script>         window.dataLayer = window.dataLayer || [];         function gtag(){dataLayer.push(arguments);}         gtag('js', new Date());         gtag('config', 'UA-115615468-1',{             'linker': {             'domains': ['aws-amplify.github.io']             }         });         var navigateToNextPage = function (elem) {             var path = "{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start";             location.replace( path + location.search);         };       gtag('event', 'page_view', {         'event_callback': navigateToNextPage         });     </script> <meta http-equiv="refresh" content="5; url={% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start" />
  </head>
  <body>
    <p>Redirecting to <a href="{% if jekyll.environment == 'production' %}{{ site.amplify.docs_baseurl }}{% endif %}/media/quick_start">https://aws-amplify.github.io/amplify-js/media/quick_start</a></p>
  </body>
</html>
Building React Native Apps with AWS Amplify
===========

Overview
--------

The AWS Amplify and the CLI provides a developer experience that allows frontend JavaScript developers to quickly create React Native apps and integrate backend resources into their apps. In this tutorial, you will learn how to build a cloud-enabled mobile app with React Native and AWS Amplify.

**By completing this tutorial, you will be able to;**
- Use Amplify CLI to create your backend
- Configure and integrate your backend into your React Native app 
- Deploy your mobile app for delivery

## Create a new React App

Use [Create React Native App](https://github.com/react-community/create-react-native-app) to create a new React Native application. Through the tutorial, you will add cloud features to this application using Amplify CLI and Amplify JavaScript library.

```bash
$ npm install -g create-react-native-app
$ create-react-native-app my-app
$ cd my-app
$ npm start
```

## Install and Configure AWS Amplify 

Before start, please be sure that you have installed the Amplify CLI and client libraries by visiting [AWS Amplify JavaScript Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/install_n_config??platform=react-native&ref_url=/amplify-js/media/tutorials/building-react-native-apps&ref_content={{"Tutorial: Building React Native Apps with AWS Amplify" | uri_escape }}&ref_content_section=configure-your-app).
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

**To launch your app locally**

Use following commands to open your app in the Create React Native App tooling:

```bash
npm run android

# OR

npm run ios
```

## Add Auth / User Sign-in

The Amplify UI components for user authentication include a rich, configurable UI for sign-up and sign-in.

**To enable the Auth features**

In the root folder of your app, run the following commands and select *default configuration* when prompted by *add* command:

```bash
$ amplify add auth
$ amplify push
```

#### Connect to Your Backend

The Amplify React Native package enables you to integrate ready-to-use sign-up/sign-in/sign-out UI in your app.

**To add user auth UI to your app**

1.  In case you haven't done already, install following libraries:

    ```bash
    npm install --save aws-amplify
    npm install --save aws-amplify-react-native
    ```

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

Learn more about [Amazon
Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/welcome.html) which is the underlying service for AWS Amplify Authentication category.

## Add Cloud APIs

The AWS Amplify API category lets you create and call APIs in the cloud. Your serverless Lambda functions handle API calls.

**To enable cloud APIs in your app**

```bash
amplify add api
```

When prompted, select following options to create a REST API that triggers a new AWS Lambda function.

```terminal
? Please select from one of the below mentioned services REST
? Provide a friendly name for your resource to be used as a label for this category in the project: theListApi
? Provide a path (e.g., /items) /items
? Choose a Lambda source Create a new Lambda function
? Provide a friendly name for your resource to be used as a label for this category in the project: theListFunction
? Provide the AWS Lambda function name: theListFunction
? Choose the function template that you want to use: Serverless express function (Integration with Amazon API Gateway)
? Do you want to edit the local lambda function now? false
```

When you add the API feature, a boilerplate code for your Lambda function `theListFunction` is copied in *amplify/backend/function/theListFunction/src/app.js* file. You can find the sample handler for the */items* path here:

```js
app.get('/items', function(req, res) {
  // Add your code here
  // Return the API Gateway event and query string parameters for example
  res.json(req.apiGateway.event);
});
```

Edit your handler as you with and run the following command to deploy your backend Lambda function:

```bash
amplify push
```

The CLI will preview the list of actions to be done at your backend, and will prompt for your approval:

```terminal
| Category | Resource name   | Operation | Provider plugin   |
| -------- | --------------- | --------- | ----------------- |
| Function | theListFunction | Create    | awscloudformation |
| Api      | theListApi      | Create    | awscloudformation |
? Are you sure you want to continue? true
```

### Connect to Your Backend

Once you have created your own Cloud APIs and Lambda functions, you can call them from your app.

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
  const apiResponse = await API.get("theListApi" , path); //replace the API name
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

To test, save the changes, run `npm run android` or `npm run ios` to launch your app. Then try the UI element that calls your API.

Learn more about the AWS Amplify API feature uses [Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) and [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html).
{: .callout .callout--info}

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

3.  For this example type in *Notes* as your `Table name`.

    ```bash
    ? Please provide table name:  Notes
    ```

### Add columns and queries

You are creating a table in a [NoSQL database](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.html) and adding an initial set of columns, each of which has a name and a data type. NoSQL lets you add a column any time you store data that contains a new column. NoSQL tables must have one column defined as the Primary Key, which is a unique identifier for each row.

1.  For this example, follow the prompts to add three columns: NoteId (string), NoteTitle (string), and NoteContent (string).

    ```terminal
    ? What would you like to name this column: NoteId
    ? Choose the data type: string
    ```

2.  When prompted to `? Add another column`, type Y and then choose enter. Repeat the steps to create *NoteTitle* and *NoteContent* columns.

3.  Select `team` as the primary key.

    ```terminal
    ? Please choose partition key for the table:
    ❯ NoteId
      NoteTitle
      NoteContent
    ```

4.  Choose `(No Sort Key)` as the sort key and then `no` to adding any more indexes, to keep the example simple.

    ```terminal
    ? Please choose sort key for the table: 
      todoId
      text
    ❯ (No Sort Key)

    ? Do you want to add global secondary indexes to your table? (Y/n) n
    Table Notes saved.
    ```

    The `Notes` table is now created.

### Use a cloud API to do CRUD operations

To access your NoSQL database, you will create an API that can be called from your app to perform CRUD operations.

**To create a CRUD API**

1.  Create a new API with the following command, and select 'REST' as the service type.

    ```bash
    $ amplify add api
    ```
    
    When prompted, provide friendly names for your resources and Choose `CRUD function for Amazon DynamoDB table` template to create your new API.

    ```terminal
    ? Provide a friendly name for your resource to be used as a label for this category in the project: NotesCRUD
    ? Provide a path (e.g., /items) /Notes
    ? Choose a Lambda source Create a new Lambda function
    ? Provide a friendly name for your resource to be used as a label for this category in the project: NotesCRUD
    ? Provide the AWS Lambda function name: NotesCRUDFunction
    ? Choose the function template that you want to use:
    ❯ CRUD function for Amazon DynamoDB table (Integration with Amazon API Gateway and Amazon DynamoDB)
    ```

3.  Select the `Notes` table created in the previous steps, and choose enter.

    ```bash
    ? Choose a DynamoDB data source option Use DynamoDB table configured in the current Amplify project
    ? Choose from one of the already configured DynamoDB tables (Use arrow keys)
    ❯ Notes
    ```

4.  Push your configuration to the cloud. 

    ```bash
    amplify push
    ```

The required DynamoDB tables, API Gateway endpoints, and Lambda functions will now be created.


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

```bash
$ amplify function invoke NotesCRUD GET /Notes/object/${noteId}
```

The CLI utilizes [AWS Serverless Express](https://github.com/awslabs/aws-serverless-express) to invoke your backend APIs locally. When you run an *invoke* command, the CLI starts an Express server which you need to manually close after testing your API (Use Ctrl-c to close the server).
{: .callout .callout--info}

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

The Amplify CLI User Data Storage feature enables apps to store user files in the cloud.

### Set Up Your Backend

Enable the User File Storage feature by running the following commands in the root folder of your app. Select 'Content' when promoted for storage service type:

```bash
$ amplify add storage
$ amplify push
```

### Connect to Your Backend

You have enabled your storage backend in the previous step. Now you will use AWS Amplify library to upload files to storage.

**To add User Data Storage to your app**

In your component where you want to transfer files:

Import the `Storage` module from aws-amplify and configure
it to communicate with your backend.

```js
import { Storage } from 'aws-amplify';
```

Now, the Storage module is imported and ready to communicate with
your backend. Implement common file transfer actions using the code
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

To add analytics to your app, run the following command and name your Amazon Pinpoint resource when prompted:

```bash
$ amplify add analytics
$ amplify push
```

When you enable analytics and launch your app, session and device demographics data will flow to Amazon Pinpoint analytics backend.

**To send basic app usage analytics to AWS**

Launch your app locally by running:

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
2.  Navigate to your project in the [Amazon Pinpoint
    console](https://console.aws.amazon.com/pinpoint/).
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

Learn more about [Amazon Pinpoint](http://docs.aws.amazon.com/pinpoint/latest/developerguide/welcome.html).

