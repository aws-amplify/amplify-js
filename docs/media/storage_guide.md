# Storage

AWS-Amplify Storage enables you to configure your App with Amazon S3 for easy management of your App's user data files. 

* [Installation](#installation)
* [Configuration](#configuration)
  * [Manual Setup](#manual-setup)
  * [Amazon S3 Bucket CORS Policy](#amazon-s3-bucket-cors-policy)
  * [Automated Setup](#automated-setup)
* [Access Level](#access-level)
* [Integration](#integration)
  - [Call APIs](#call-apis)
  - [React Components](#react-components)


## Installation

For Web development, regardless of framework, `aws-amplify` provides core Auth APIs
```
npm install aws-amplify
```

On React app, we have provided some helpful components in `aws-amplify-react`
```
npm install aws-amplify-react
```

In React Native development, we package core APIs and components into one `aws-amplify-react-native`
```
npm install aws-amplify-react-native
```

## Configuration

You are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. AWS Amplify also require the AWS S3 bucket. Amazon Cognito Identity Pool requires to have access to Amazon S3 using Amazon IAM. You can configure it by yourself or let [AWS Mobile Hub do it for you](#automated-setup)!

### Manual Setup
[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/Introduction.html)

[Amazon IAM](http://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started.html)

### Amazon S3 Bucket CORS Policy

To make calls to your S3 bucket from your App, make sure CORS is turned on:

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) and click on your project's userfiles bucket.
2. Click on the **Permissions** tab for your bucket, and then click on **CORS configuration** tile.
3. Update your bucket's CORS Policy to look like:
 ```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <ExposeHeader>x-amz-server-side-encryption</ExposeHeader>
    <ExposeHeader>x-amz-request-id</ExposeHeader>
    <ExposeHeader>x-amz-id-2</ExposeHeader>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

Note: You can restrict the access to your bucket by updating AllowedOrigin to be more domain specific. 

### Automated Setup

AWS Mobile Hub streamlines the steps above for you. Simply click the button:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/user-files.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

This will create a project that works with Analytics category fully functioning. After the project is created in the Mobile Hub console download aws-exports.js by clicking the **Hosting and Streaming** tile then **Download aws-exports.js**.

![Mobile Hub](mobile_hub_1.png)

Download aws-exports.js

Then copy the file to `/src` folder of the project
![Download](mobile_hub_2.png)

Now you can simply import the file and pass it as the configuration to the Amplify library:

## Access Level

If you used Automated Setup or use AWS Mobile Hub to create your resources, Storage has two access levels: `public` and `private`. 

Files with public access level can be accessed by all users who is using app. In S3, they are stored under `public/` path of your S3 bucket.

Files with private access level is only accessible by the specific authenticated user alone. In S3, they are stored under `private/{user_identity_id}/`

Access level can be configured at Storage object, affects globally. Or at individual function call. By default the access level is `public`

On Storage
```
Storage.configure({ level: 'private' });

Storage.get('welcome.png'); // Gets the welcome.png belongs to current user
```

When calling API
```
Storage.get('welcome.png', { level: 'public' }); // Gets welcome.png in public space
```

By default, the access level is `public`
```
Storage.get('welcome.png'); // Get welcome.png in public space
```

There is a shortcut `vault`, which is merely a Storage instance with `private` level set.
```
Storage.vault.get('welcome.png'); // Get the welcome.png belonging to current user
```

## Integration

1. Import Storage from the aws-amplify library into your App file as follows:
```
import { Storage } from 'aws-amplify';
```

2. Configure Storage with your AWS resources as follows : 

    a. Use aws-exports object (here named awsmobile) to configure Storage (for details on object structure, refer: [Need to add link here]:
    ```
        Storage.configure(awsmobile);
    ``` 

    b. Use your resource values to configure Storage as: 
    ```
    Storage.configure({
        bucket: //Your bucket ARN;
        region: //Specify the region your bucket was created in;
        identityPoolId: //Specify your identityPoolId for Auth and Unauth access to your bucket;
    });
    ```

### Call APIs

* 'public': Objects can be read or written by everyone who uses App.
* 'private': Objects can only be read or written by the current user.

#### 1. Put
Put data into Amazon S3.

Public
```
    const key = 'xyz.ext';
    const fileObj = 'abc'
    Storage.put(key, fileObj)
        .then (result => console.log(result))
        .catch(err => console.log(err));
```

Private
``` 
    Storage.put(key, fileObj, {level: 'private'})
        .then (result => console.log(result))
        .catch(err => console.log(err));
        
    // Stores data with specifying its MIME type
    Storage.put(key, fileObj, {
        level: 'private',
        contentType: 'text/plain'
    })
    .then (result => console.log(result))
    .catch(err => console.log(err));
```

#### 2. Get
Get a public accessible URL for data stored.

Public
``` 
    const key = “abc”
    Storage.get(key)
        .then(result => console.log(result))
        .catch(err => console.log(err));
```

Private
```  
    Storage.get(key, {level: 'private'})
        .then(result => console.log(result))
        .catch(err => console.log(err));
```

#### 3. Remove
Delete data stored with key specified.

Public
```
    const key = “abc”
    Storage.remove(key)
        .then(result => console.log(result))
        .catch(err => console.log(err));
```

Private
```   
    Storage.remove(key, {level: 'private'})
        .then(result => console.log(result))
        .catch(err => console.log(err));
```

#### 4. List
List keys under path specified.

Public
```
    const path = ‘my path’;
    Storage.list(path)
        .then(result => console.log(result))
        .catch(err => console.log(err));
```

Private
```
    Storage.list(path, {level: 'private'})
        .then(result => console.log(result))
        .catch(err => console.log(err));
```

### React Components

`aws-amplify-react` package provides the following components:

#### S3Image

`S3Image` component renders Amazon S3 key to image

```
import { S3Image } from 'aws-amplify-react';

    render() {
        const path = // path of the image;
        return <S3Image path={path} />
    }
```

For private image, supply `level` property
```
        return <S3Image level="private" path={path} />
```

To upload, set the body property to S3Image
```
import { S3Image } from 'aws-amplify-react';

    render() {
        const path = // path of the image;
        return <S3Image path={path} body={this.state.image_body} />
    }
```

**Image URL**
`S3Image` converts path to actual URL. To get the URL, listen to `onReady` event
```
    <S3Imag path={path} onReady={url => console.log(url)}
```

#### S3Album

`S3Album` holds a list of S3Image
```
import { S3Album } from 'aws-amplify-react';

    render() {
        const path = // path of the list;
        return <S3Album path={path} />
```

For private album, supply `level` property
```
        return <S3Album level="private" path={path} />
```

Might have non-image files in album, use `filter`
```
        return <S3Album
                    level="private"
                    path={path}
                    filter={(item) => /jpg/i.test(item.path)}
                />
```

**Photo Picker**

Set `picker` property to true on `S3Album`. A `PhotoPicker` let user pick photos on his/her device.
```
    <S3Album path={path} picker />
```

By default the photo picker saves photo on S3 with filename as key. To have custom key, add a callback
```
function fileToKey(data) {
    const { name, size, type } = data;
    return 'test_' + name;
}

...

    <S3Album path={path} picker fileToKey={fileToKey}/>
```

`S3Album` will escape all spaces in key to underscore. So 'a b' becomes 'a_b'
