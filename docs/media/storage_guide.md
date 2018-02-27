---
---

# Storage

AWS Amplify Storage module gives a simple mechanism for managing user content in public or private storage.

* [Installation and Configuration](#installation-and-configuration)
  - [Manual Setup](#manual-setup)
  - [Automated Setup](#automated-setup)
* [Amazon S3 Bucket CORS Policy](#amazon-s3-bucket-cors-policy)
* [Access Level](#access-level)
* [Call APIs](#call-apis)
* [React Development](#react-development)
  - [Picker](#picker)
  - [S3Image](#s3image)
  - [S3Text](#s3text)
  - [S3Album](#s3album)
  - [Analytics for S3 components](#analytics-for-s3-components)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Analytics specific setup.

The default implementation of the Storage module leverages Amazon S3.

### Manual Setup

```js
import Amplify from 'aws-amplify';

Amplify.configure(
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', //REQUIRED - Amazon Cognito Identity Pool ID
        region: 'XX-XXXX-X', // REQUIRED - Amazon Cognito Region
        userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
    },
    Storage: {
        bucket: '', //REQUIRED -  Amazon S3 bucket
        region: 'XX-XXXX-X', //OPTIONAL -  Amazon service region
    }
);

```
### Automated Setup

To create a project fully functioning with the Storage category.

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init
$ awsmobile enable user-files
```

In your project i.e. App.js:

```js
import Amplify, { Storage } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

## Amazon S3 Bucket CORS Policy

To make calls to your S3 bucket from your App, make sure CORS is turned on:

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) and click on your project's userfiles bucket.
2. Click on the **Permissions** tab for your bucket, and then click on **CORS configuration** tile.
3. Update your bucket's CORS Policy to look like:
```xml
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

## Access Level

Storage has two access levels: `public` and `private`.

Files with public access level can be accessed by all users who are using the app. In S3, they are stored under the `public/` path in your S3 bucket.

Files with private access level are only accessible by the specific authenticated user alone. In S3, they are stored under `private/{user_identity_id}/` where the ID corresponds to a unique Amazon Cognito Identity ID, generated for that user.

The access level can be configured on the Storage object globally. Alternatively it can be set on an individual function call. By default the access level is `public`.

Configuration on the Storage object

```js
Storage.configure({ level: 'private' });

Storage.get('welcome.png'); // Gets the welcome.png belongs to current user
```

Configuration when calling the API

```js
Storage.get('welcome.png', { level: 'public' }); // Gets welcome.png in public space
```

The default access level is `public`:
```js
Storage.get('welcome.png'); // Get welcome.png in public space
```

There is also a shortcut `vault`, which is merely a Storage instance with `private` level set:

```js
Storage.vault.get('welcome.png'); // Get the welcome.png belonging to current user
```

## Tracking

You can enable automatic tracking of events by setting ```track``` to ```true``` when calling the API. (Note: this option is currently only supported in aws-amplify). Enabling this will automatically send 'Storage' events to Amazon Pinpoint and you will be able to see them within the AWS Pinpoint console under Custom Events. The event name will be 'Storage' and within the attributes will be details about the operations that occurred. For example Storage -> method -> put etc.

For example:

Track all the storage apis:

```js
Storage.configure({ track: true })
```

Track specified storage api:

```js
Storage.get('welcome.png', { track: true });
```

You can also use the track property directly on [React components](#analytics-for-s3-components).


## Call APIs

Import Storage from the aws-amplify library:
```js
import { Storage } from 'aws-amplify';
```

If use `aws-exports.js` file, Storage is already configured. To configure Storage separately,
```js
Storage.configure({
    bucket: //Your bucket ARN;
    region: //Specify the region your bucket was created in;
    identityPoolId: //Specify your identityPoolId for Auth and Unauth access to your bucket;
});
```

#### 1. Put
Put data into Amazon S3.

Public
```js
Storage.put('test.txt', 'Hello')
    .then (result => console.log(result))
    .catch(err => console.log(err));
```

Private
```js
Storage.put('test.txt', 'Private Content', {
    level: 'private',
    contentType: 'text/plain'
})
.then (result => console.log(result))
.catch(err => console.log(err));
```

#### 2. Get
Get a public accessible URL for data stored.

Public
```js
Storage.get('test.txt')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Private
```js
Storage.get('test.txt', {level: 'private'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Returns the pre-signed URL that expires in 60 seconds
```js
Storage.get('test.txt', {expires: 60})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

#### 3. Remove
Delete data stored with key specified.

Public
```js
Storage.remove('test.txt')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Private
```js
Storage.remove('test.txt', {level: 'private'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

#### 4. List
List keys under path specified.

Public
```js
Storage.list('photos/')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Private
```js
Storage.list('photos/', {level: 'private'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

## React Development

`aws-amplify-react` package provides the following components:

### Picker

`Picker` is used to pick file from local device. `PhotoPicker` and `TextPicker` are specific to photo and text file picking.

<img src="photo_picker_and_code.png" width="320px"/>

Listen to `PhotoPicker` onPick event:
```jsx
import { PhotoPicker } from 'aws-amplify-react';

    render() {
        <PhotoPicker onPick={data => console.log(data)} />
    }
```

To have a preview

```jsx
<PhotoPicker preview onLoad={dataURL => console.log(dataURL)} />
```

`onLoad` gives dataURL of the image. With that, you may not need the built-in preview. Then just hide it

```jsx
<PhotoPicker preview="hidden" onLoad={dataURL => console.log(dataURL)} />
```

### S3Image

`S3Image` component renders Amazon S3 key as an image:

```jsx
import { S3Image } from 'aws-amplify-react';

    render() {
        return <S3Image imgKey={key} />
    }
```

For private image, supply the `level` property:

```jsx
return <S3Image level="private" imgKey={key} />
```

To upload, set the body property to S3Image:

```jsx
import { S3Image } from 'aws-amplify-react';

    render() {
        return <S3Image imgKey={key} body={this.state.image_body} />
    }
```

To hide the image shown in the S3Image, set ```hidden```

```jsx
import { S3Image } from 'aws-amplify-react';

    render() {
        return <S3Image hidden imgKey={key} />
    }
```

**Image URL**

`S3Image` converts path to actual URL. To get the URL, listen to the `onLoad` event:

```jsx
<S3Image imgKey={key} onLoad={url => console.log(url)} />
```

**Photo Picker**

Set `picker` property to true on `S3Image`. A `PhotoPicker` let user pick photos on his/her device.

```jsx
<S3Image imgKey={key} picker />
```

After pick, the image will be uploaded to `imgKey`. You may just provide `path`, path plus image file name will be the upload key.

```jsx
<S3Image path={path} picker />
```

To have custom key you can provide a callback:

```jsx
function fileToKey(data) {
    const { name, size, type } = data;
    return 'test_' + name;
}

...
<S3Image path={path} picker fileToKey={fileToKey} />
```

`S3Image` will escape all spaces in key to underscore. For example, 'a b' becomes 'a_b'.

### S3Text

`S3Text` has similar behaviors as `S3Image`, only this is for text contents.

### S3Album

`S3Album` holds a list of `S3Image` and `S3Text` objects:

<img src="S3Album_and_code.png" width="320px"/>

```jsx
import { S3Album } from 'aws-amplify-react';

    render() {
        return <S3Album path={path} />
```

For private album, supply the `level` property:

```jsx
return <S3Album level="private" path={path} />
```

You might have files under the path not in album. In this case you can provide a `filter` prop:

```jsx
return (
    <S3Album
        level="private"
        path={path}
        filter={(item) => /jpg/i.test(item.path)}
    />
);
```

**Picker**

Set `picker` property to true on `S3Album`. A `Picker` let user pick photos or text files on his/her device.

```jsx
<S3Album path={path} picker />
```

By default photo picker saves photo on S3 with filename as key. To have custom key you can provide a callback:

```jsx
function fileToKey(data) {
    const { name, size, type } = data;
    return 'test_' + name;
}

...
    <S3Album path={path} picker fileToKey={fileToKey} />
```

`S3Album` will escape all spaces in key to underscore. For example, 'a b' becomes 'a_b'.

### Analytics for S3 components

You can automatically track ```Storage``` operations on the following React components: ```S3Album```, ```S3Text```, ```S3Image``` by providing a ```track``` prop:

```jsx
return <S3Album track />
```

Enabling this will automatically send 'Storage' events to Amazon Pinpoint and you will be able to see them within the AWS Pinpoint console under Custom Events. The event name will be 'Storage' and within the attributes will be details about the operations that occurred. For example Storage -> method -> put etc.
