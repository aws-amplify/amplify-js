Access Your Database
====================

Set Up Your Backend
-------------------

AWS Mobile `database`{.sourceCode} feature enables you to create tables
customized to your needs. The CLI then guides you to create a custom API
to access your database.

### Create a table

**To specify and create a table**

1.  In your app root folder, run:

    ``` {.sourceCode .none}
    awsmobile database enable --prompt
    ```

2.  Design your table when prompted by the CLI.

    The CLI will prompt you for the table and other table configurations
    such as columns.

    ``` {.sourceCode .none}
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

    Choose a [Primary
    Key](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)
    that will uniquely identify each item. Optionally, choose a column
    to be a Sort Key when you will commonly use those values in
    combination with the Primary Key for sorting or searching your data.
    You can additional sort keys by adding a [Secondary
    Index](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.SecondaryIndexes)
    for each column you will want to sort by.

    ``` {.sourceCode .none}
    Before you create the database, you must specify how items in your table are uniquely organized. This is done by specifying a Primary key. The primary key uniquely identifies each item in the table, so that no two items can have the same key.
    This could be and individual column or a combination that has "primary key" and a "sort key".
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

AWS Mobile will create a custom API for your app to perform create,
read, update, and delete (CRUD) actions on your database.

**To create a CRUD API for your table**

1.  In the root folder of your app, run:

    ``` {.sourceCode .bash}
    awsmobile cloud-api enable --prompt
    ```

2.  When prompted, choose
    `Create CRUD API for existing Dynamo table`{.sourceCode}, select the
    table name from the previous steps, choose the access permissions
    for the table. Using the example table from the previous section:

    ``` {.sourceCode .bash}
    ? Select from one of the choices below.
      Create a new API
    ❯ Create CRUD API for an existing Amazon DynamoDB table
    ```

    The prompt response will be:

    ``` {.sourceCode .bash}
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
    To test the api from the command line (after awsmobile push) use this commands
    awsmobile cloud-api invoke NotesCRUD <method> <path> [init]
    Api NotesCRUD saved
    ```

    Copy and keep the path of your API and the JSON for use in your app
    code.

    This feature will create an API using Amazon API Gateway and AWS
    Lambda. You can optionally have the lambda function perform CRUD
    operations against your Amazon DynamoDB table.

3.  Update your backend.

    To create the API you have configured, run:

    ``` {.sourceCode .java}
    awsmobile push
    ```

    Until deployment of API to the cloud the has completed, the CLI
    displays the message:
    `cloud-api update status: CREATE_IN_PROGRESS`{.sourceCode}. Once
    deployed a sucessful creation message
    `cloud-api update status: CREATE_COMPLETE`{.sourceCode} is
    displayed.

    You can view the API that the CLI created by running
    `awmobile console`{.sourceCode} and then choosing Cloud Logic in the
    console.

Connect to Your Backend
-----------------------

**To access to database tables from your app**

1.  In App.js import the following.

    > ``` {.sourceCode .java}
    > import Amplify, { API } from 'aws-amplify';
    > import aws_exports from 'path_to_your_aws-exports';
    > Amplify.configure(aws_exports);
    > ```

2.  Add the following `state`{.sourceCode} to your component.

    > ``` {.sourceCode .java}
    > state = {
    >   apiResponse: null,
    >   noteId: ''
    >      };
    >
    >   handleChangeNoteId = (event) => {
    >         this.setState({noteId: event});
    > }
    > ```

### Save an item (create or update)

**To save an item**

In the part of your app where you access the database, such as an event
handler in your React component, call the `put`{.sourceCode} method. Use
the JSON and the root path (`/Notes`{.sourceCode}) of your API that you
copied from the CLI prompt response earlier.

``` {.sourceCode .java}
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

``` {.sourceCode .none}
awsmobile cloud-api invoke NotesCRUD GET /Notes/object/${noteId}
```

### Get a specific item

**To query for a specific item**

Call the `get`{.sourceCode} method using the API path (copied earlier)
to the item you are querying for.

``` {.sourceCode .java}
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

``` {.sourceCode .javascript}
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

The following is and example of how you might construct UI to excercise
these operations.

``` {.sourceCode .javascript}
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

Next Steps
----------

Learn more about the AWS Mobile NoSQL Database &lt;NoSQL-Database&gt;
feature, which uses [Amazon
DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html).

Learn about AWS Mobile CLI &lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile
Amplify](https://github.com/aws/aws-amplify/tree/master/packages/aws-amplify-react-native).
