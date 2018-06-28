Add Storage
===========

The AWS Mobile CLI User Data Storage &lt;user-data-storage&gt; feature
enables apps to store user files in the cloud.

Set Up Your Backend
-------------------

**To configure your app's cloud storage location**

In your app root folder, run:

``` {.sourceCode .shell}
awsmobile user-files enable

awsmobile push
```

Connect to Your Backend
-----------------------

**To add User Data Storage to your app**

In your component where you want to transfer files:

Import the `Storage`{.sourceCode} module from aws-amplify and configure
it to communicate with your backend.

``` {.sourceCode .javacript}
import { Storage } from 'aws-amplify';
```

Now that the Storage module is imported and ready to communicate with
your backend, implement common file transfer actions using the code
below.

### Upload a file

**To upload a file to storage**

Add the following methods to the component where you handle file
uploads.

``` {.sourceCode .javascript}
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

``` {.sourceCode .javascript}
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

``` {.sourceCode .javascript}
async componentDidMount() {
  const path = this.props.path;
  const access = { level: "public" };
  let files = await Storage.list(path, access);
   // use file list to get single files
}
```

Use the following code to fetch file attributes such as the size or time
of last file change.

``` {.sourceCode .javascript}
file.Size; // file size
file.LastModified.toLocaleDateString(); // last modified date
file.LastModified.toLocaleTimeString(); // last modified time
```

### Delete a file

Add the following state to the element where you handle file transfers.

``` {.sourceCode .javascript}
async deleteFile(key) {
  const access = { level: "public" };
  Storage.remove(key, access);
}
```

Next Steps
----------

Learn more about the analytics in AWS Mobile which are part of the
User Data Storage &lt;user-data-storage&gt; feature. This feature uses
[Amazon Simple Storage Service
(S3)](http://docs.aws.amazon.com/s3/latest/developerguide/welcome.html).

Learn about AWS Mobile CLI &lt;aws-mobile-cli-reference&gt;.

Learn about [AWS Mobile Amplify](https://aws.github.io/aws-amplify).
