Add Storage
===========

The AWS Mobile CLI and AWS Amplify library make it easy to store and
manage files in the cloud from your JavaScript app.

Set Up the Backend
------------------

Enable the User File Storage feature by running the following commands
in the root folder of your app.

``` {.sourceCode .bash}
awsmobile user-files enable

awsmobile push
```

Connect to the Backend
----------------------

The examples in this section show how you would integrate AWS Amplify
library calls using React (see the [AWS Amplify
documentation](https://aws.github.io/aws-amplify) to use other flavors
of Javascript).

The following simple component could be added to a
`create-react-app`{.sourceCode} project to present an interface that
uploads images and download them for display.

### Upload a file

The `Storage`{.sourceCode} module enables you to upload files to the
cloud. All uploaded files are publicly viewable by default.

Import the `Storage`{.sourceCode} module in your component file.

``` {.sourceCode .javascript}
// ./src/ImageViewer.js

import { Storage } from 'aws-amplify';
```

Add the following function to use the `put`{.sourceCode} function on the
`Storage`{.sourceCode} module to upload the file to the cloud, and set
your component’s state to the name of the file.

``` {.sourceCode .javascript}
uploadFile(event) {
  const file = event.target.files[0];
  const name = file.name;

  Storage.put(key, file).then(() => {
    this.setState({ file: name });
  });
}
```

Place a call to the `uploadFile`{.sourceCode} function in the
`input`{.sourceCode} element of the component’s render function, to
start upload when a user selects a file.

``` {.sourceCode .javascript}
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
`S3Image`{.sourceCode} component of the AWS Amplify for React library.

1.  From a terminal, run the following command in the root folder of
    your app.

    ``` {.sourceCode .bash}
    npm install --save aws-amplify-react
    ```

2.  Import the `S3Image`{.sourceCode} module in your component.

    ``` {.sourceCode .javascript}
    import { S3Image } from 'aws-amplify-react';
    ```

Use the S3Image component in the render function. Update your render
function to look like the following:

``` {.sourceCode .javascript}
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

#### Next Steps

-   Learn how to do private file storage and more with the [Storage
    module in AWS
    Amplify](https://aws.github.io/aws-amplify/media/developer_guide.html).
-   Learn how to enable more features for your app with the [AWS Mobile
    CLI](https://aws.github.io/aws-amplify).
-   Learn how to use those features in your app with the [AWS Amplify
    library](https://aws.github.io/aws-amplify).
-   Learn more about the [analytics for the User File Storage
    feature](https://alpha-docs-aws.amazon.com/pinpoint/latest/developerguide/welcome.html).
-   Learn more about how your files are stored on [Amazon Simple Storage
    Service](https://aws.amazon.com/documentation/s3/).

