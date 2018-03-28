---
---

# Storage

AWS Amplify Storage module provides a simple mechanism for managing user content for your app in public or private storage buckets.

## Installation and Configuration

Please refer to [AWS Amplify Installation Guide]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/install_n_config) for general setup. Here is how you can enable Storage category for your app.

The default implementation of the Storage module leverages [Amazon S3](https://aws.amazon.com/s3).
{: .callout .callout--info}

### Automated Setup

To create a project fully functioning with the Storage category.

```bash
$ npm install -g awsmobile-cli
$ cd my-app #Change to your project's root folder
$ awsmobile init
$ awsmobile user-files 
$ awsmobile push #Update your backend 
```

In your app's entry point *i.e. App.js*, import and load the configuration file `aws-exports.js` which has been created and replaced into `/src` folder in the previous step.

```js
import Amplify, { Storage } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

### Manual Setup

Manual setup enables you to use your existing Amazon Cognito and Amazon S3 credentials in your app:

```js
import Amplify from 'aws-amplify';

Amplify.configure({
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
});

```

### Setup Amazon S3 Bucket CORS Policy

To make calls to your S3 bucket from your App, you need to setup CORS Policy for your S3 bucket.
{: .callout .callout--warning}

Following steps will enable your CORS Policy: 

1. Go to [Amazon S3 Console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) and click on your project's `userfiles` bucket, which is normally named as [Project Name]-userfiles-mobilehub-[App Id]. If you are using an S3 Bucket that is not created by Mobile Hub, that will your upload bucket for your app.
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

Note: You can restrict the access to your bucket by updating AllowedOrigin to include individual domains.
{: .callout .callout--info}

### File Access Levels

Storage module can manage files in two different access levels; `public` and `private`.

Files with public access level can be accessed by all users who are using your app. In S3, they are stored under the `public/` path in your S3 bucket.

Files with private access level are only accessible for specific authenticated users only. In S3, they are stored under `private/{user_identity_id}/` where the **user_identity_id** corresponds to a unique Amazon Cognito Identity ID for that user.

The access level can be configured on the Storage object globally. Alternatively, the access levels can be set in individual function calls. 

Default access level for Storage module is `public`. Unless you configure Storage otherwise, all uploaded files will be publicly available for all users.
{: .callout .callout--info}

Access level configuration on the Storage object:

```js
Storage.configure({ level: 'private' });

Storage.get('welcome.png'); // Gets the welcome.png belongs to current user
```

Configuration when calling the API:

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

## Working with the API

Import *Storage* from the aws-amplify library:
```js
import { Storage } from 'aws-amplify';
```

If you use `aws-exports.js` file, Storage is already configured. To configure Storage manually,
```js
Storage.configure({
    bucket: //Your bucket ARN;
    region: //Specify the region your bucket was created in;
    identityPoolId: //Specify your identityPoolId for Auth and Unauth access to your bucket;
});
```

#### Put

Puts data into Amazon S3.

Public bucket:
```js
Storage.put('test.txt', 'Hello')
    .then (result => console.log(result))
    .catch(err => console.log(err));
```

Private bucket:
```js
Storage.put('test.txt', 'Private Content', {
    level: 'private',
    contentType: 'text/plain'
})
.then (result => console.log(result))
.catch(err => console.log(err));
```

#### Get

Retrieves a publicly accessible URL for data stored.

Public bucket:
```js
Storage.get('test.txt')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Private bucket:
```js
Storage.get('test.txt', {level: 'private'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

You can use `expires` option to limit the availability of your URLs. This configuration returns the pre-signed URL that expires in 60 seconds:
```js
Storage.get('test.txt', {expires: 60})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

#### Remove

Delete stored data from the storage bucket.

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

#### List

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

#### API Reference

For the complete API documentation for Storage module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/api/classes/storageclass.html)
{: .callout .callout--info}

## Tracking Events

You can enable automatic tracking of storage events such as uploads and downloads, by setting `{ track: true }` when calling the Storage API. 

(Note: this option is currently only supported in aws-amplify). Enabling this will automatically send Storage events to Amazon Pinpoint and you will be able to see them within the AWS Pinpoint console under Custom Events. The event name will be 'Storage' and in *Event Attributes*, you can see details about the event, e.g. *Storage > Method > Put*.

Track all the Storage events:

```js
Storage.configure({ track: true })
```

Track a specific storage action:

```js
Storage.get('welcome.png', { track: true });
```

You can also use the track property directly on [React components](#analytics-for-s3-components).


## UI Components for React

`aws-amplify-react` package provides React UI components for common usecases such as picking a file and image previews. 

### Picker

`Picker` is used to pick a file from local device storage. `PhotoPicker` and `TextPicker` components are specific to image and text file types .

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/photo_picker_and_code.png" width="100%"/>

Listen to `PhotoPicker` onPick event:
```jsx
import { PhotoPicker } from 'aws-amplify-react';

render() {
    <PhotoPicker onPick={data => console.log(data)} />
}
```

To display a preview, you can use `preview` directive:

```jsx
<PhotoPicker preview onLoad={dataURL => console.log(dataURL)} />
```

You can retrieve the URL of the image by implementing `onLoad` action. In this case, you may also want to hide the preview:  

```jsx
<PhotoPicker preview="hidden" onLoad={dataURL => console.log(dataURL)} />
```

### S3Image

`S3Image` component renders an *Amazon S3 object key* as an image:

```jsx
import { S3Image } from 'aws-amplify-react';

render() {
    return <S3Image imgKey={key} />
}
```

For private images, supply the `level` property:

```jsx
return <S3Image level="private" imgKey={key} />
```

To initiate an upload, set the `body` property:

```jsx
import { S3Image } from 'aws-amplify-react';

render() {
    return <S3Image imgKey={key} body={this.state.image_body} />
}

```

To hide the image shown in the S3Image, set `hidden`:

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

Set `picker` property to true on `S3Image`. A `PhotoPicker` let the user pick a picture from the device. After users picks an image, the image will be uploaded with `imgKey`.

```jsx
<S3Image imgKey={key} picker />
```

When you set `path`, the *key* for the image will be the combination of `path` and image file name.

```jsx
<S3Image path={path} picker />
```

To generate a custom key value, you can provide a callback:

```jsx
function fileToKey(data) {
    const { name, size, type } = data;
    return 'test_' + name;
}

...
<S3Image path={path} picker fileToKey={fileToKey} />
```

`S3Image` will escape all spaces in key values to underscore. For example, 'a b' will ve converted to 'a_b'.
{: .callout .callout--info}

### S3Text

`S3Text` is similar to `S3Image`. The only difference is `S3Text` is used for text content.

### S3Album

`S3Album` renders a list of `S3Image` and `S3Text` objects:

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.baseurl}}{%endif%}/media/images/S3Album_and_code.png" width="100%"/>

```jsx
import { S3Album } from 'aws-amplify-react';

render() {
    return <S3Album path={path} />
```

For display private objects, supply the `level` property:

```jsx
return <S3Album level="private" path={path} />
```

You can use `filter` property customize the path for your album:

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

Set `picker` property to true on `S3Album`. A `Picker` let user select photos or text files from the device. The selected files will be automatically uploaded to the `path`. 

```jsx
<S3Album path={path} picker />
```

By default, photo picker saves images on S3 with filename as the key. To have custom keys, you can provide a callback:

```jsx
function fileToKey(data) {
    const { name, size, type } = data;
    return 'test_' + name;
}

...
    <S3Album path={path} picker fileToKey={fileToKey} />
```

`S3Album` will escape all spaces in key value to underscore. For example, 'a b' will be converted to 'a_b'.
{: .callout .callout--info}

### Tracking Events for UI Components

You can automatically track `Storage` operations on the following React components: `S3Album`, `S3Text`, `S3Image` by providing a `track` prop:

```jsx
return <S3Album track />
```

Enabling tracking will automatically send 'Storage' events to Amazon Pinpoint, and you will be able to see the results in AWS Pinpoint console under *Custom Events*. The event name will be *Storage*, and event details will be displayed in *attributes* , e.g. Storage -> Method -> Put.

