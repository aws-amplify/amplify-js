Access Your Database
====================

The AWS Mobile CLI and Amplify library make it easy to perform create,
read, update, and delete ("CRUD") actions against data stored in the
cloud through simple API calls in your JavaScript app.

Set Up Your Backend
-------------------

**To create a database**

1.  Enable the NoSQL database feature and configure your table.

    In the root folder of your app, run:

    ``` {.sourceCode .bash}
    awsmobile database enable --prompt
    ```

2.  Choose `Open`{.sourceCode} to make the data in this table viewable
    by all users of your application.

    ``` {.sourceCode .bash}
    ? Should the data of this table be open or restricted by user?
    ❯ Open
      Restricted
    ```

3.  For this example type in todos as your `Table name`{.sourceCode}.

    ``` {.sourceCode .bash}
    ? Table name: todos
    ```

### Add columns and queries

You are creating a table in a [NoSQL
database](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.html)
and adding an initial set of columns, each of which has a name and a
data type. NoSQL lets you add a column any time you store data that
contains a new column. NoSQL tables must have one column defined as the
Primary Key, which is a unique identifier for each row.

1.  For this example, follow the prompts to add three columns: team
    (string), todoId (number), and text (string).

    ``` {.sourceCode .bash}
    ? What would you like to name this column: team
    ? Choose the data type: string
    ```

2.  When prompted to `? Add another column`{.sourceCode}, type Y and
    then choose enter. Repeat the steps to create todoId and text
    columns.
3.  Select `team`{.sourceCode} as the primary key.

    ``` {.sourceCode .bash}
    ? Select primary key
    ❯ team
      todoId
      text
    ```

4.  Choose `(todoId)`{.sourceCode} as the sort key and then
    `no`{.sourceCode} to adding any more indexes, to keep the example
    simple.

    ``` {.sourceCode .bash}
    ? Select sort key
    ❯ todoId
      text
      (No Sort Key)

    ? Add index (Y/n): n
    Table todos saved.
    ```

    The `todos`{.sourceCode} table is now created.

### Use a cloud API to do CRUD operations

To access your NoSQL database, you will create an API that can be called
from your app to perform CRUD operations.

**To create a CRUD API**

1.  Enable and configure the Cloud Logic feature\*\*

    ``` {.sourceCode .bash}
    awsmobile cloud-api enable --prompt
    ```

2.  Choose
    `Create CRUD API for an existing Amazon DynamoDB table`{.sourceCode}
    API for an exisitng Amazon DynamoDB table" and then choose enter.

    ``` {.sourceCode .bash}
    ? Select from one of the choices below. (Use arrow keys)
      Create a new API
    ❯ Create CRUD API for an existing Amazon DynamoDB table
    ```

3.  Select the `todos`{.sourceCode} table created in the previous steps,
    and choose enter.

    ``` {.sourceCode .bash}
    ? Select Amazon DynamoDB table to connect to a CRUD API
    ❯ todos
    ```

4.  Push your configuration to the cloud. Without this step, the
    configuration for your database and API is now in place only on your
    local machine.

    ``` {.sourceCode .bash}
    awsmobile push
    ```

    The required DynamoDB tables, API Gateway endpoints, and Lambda
    functions will now be created.

### Create your first Todo

The AWS Mobile CLI enables you to test your API from the command line.

Run the following command to create your first todo.

``` {.sourceCode .bash}
awsmobile cloud-api invoke todosCRUD POST /todos '{"body": {"team": "React", "todoId": 1, "text": "Learn more Amplify"}}'
```

Connect to Your Backend
-----------------------

The examples in this section show how you would integrate AWS Amplify
library calls using React (see the [AWS Amplify
documentation](https://aws.github.io/aws-amplify/) to use other flavors
of Javascript).

The following component is a simple Todo list that you might add to a
`create-react-app`{.sourceCode} project. The Todos component currently
adds and displays `todos`{.sourceCode} to and from an in memory array.

### Displaying todos from the cloud

The `API`{.sourceCode} module from AWS Amplify allows you connect to
DynamoDB through endpoints.

**To retrieve and display items in a database**

1.  Import the `API`{.sourceCode} module from `aws-amplify`{.sourceCode}
    at the top of the Todos component file.

    ``` {.sourceCode .javascript}
    import { API } from 'aws-amplify';
    ```

2.  Add the following `componentDidMount`{.sourceCode} to the
    `Todos`{.sourceCode} component to fetch all of the
    `todos`{.sourceCode}.

    ``` {.sourceCode .javascript}
    async componentDidMount() {
      let todos = await API.get('todosCRUD', `/todos/${this.state.team}`);
      this.setState({ todos });
    }
    ```

When the `Todos`{.sourceCode} component mounts it will fetch all of the
`todos`{.sourceCode} stored in your database and display them.

### Saving todos to the cloud

The following fragment shows the `saveTodo`{.sourceCode} function for
the Todo app.

``` {.sourceCode .javascript}
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

Update the `form`{.sourceCode} element in the component's render
function to invoke the `saveTodo`{.sourceCode} function when the form is
submitted.

``` {.sourceCode .javascript}
<form onSubmit={this.saveTodo.bind(this)}>
```

Your entire component should look like the following:

#### Next Steps

-   Learn how to retrieve specific items and more with the [API module
    in AWS
    Amplify](https://aws.github.io/aws-amplify/media/developer_guide.html).
-   Learn how to enable more features for your app with the [AWS Mobile
    CLI](https://aws.github.io/aws-amplify).

