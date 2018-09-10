---
---

# Storage

AWS Amplify Storage module provides a simple mechanism for managing user content for your app in public, protected or private storage buckets.

Ensure you have [installed and configured the Amplify CLI and library]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/quick_start).
{: .callout .callout--info}

### Automated Setup

AWS Mobile CLI helps you to create and configure the storage buckets for your app. The default implementation of the Storage module leverages [Amazon S3](https://aws.amazon.com/s3).

##### Create Your Backend with the CLI

To create a project fully functioning with the Storage category, run the following command:

```bash
$ amplify add storage
```

and select *Content* in prompted options:

```bash
? Please select from one of the below mentioned services (Use arrow keys)
❯ Content (Images, audio, video, etc.)
  NoSQL Database
```

The CLI will walk you though the options to enable Auth, if not enabled previously, and name your S3 bucket. To update your backend run:

```bash
$ amplify push
```

When your backend is successfully updated, your new configuration file `aws-exports.js` is copied under your source directory, e.g. '/src'.

##### Configure Your App

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

1. Go to [Amazon S3 Console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) and click on your project's `userfiles` bucket, which is normally named as [Project Name]-userfiles-mobilehub-[App Id]. 
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

Storage module can manage files with three different access levels; `public`, `protected` and `private`.

Files with public access level can be accessed by all users who are using your app. In S3, they are stored under the `public/` path in your S3 bucket.

Files with protected access level are readable by all users but writable only by the creating user. In S3, they are stored under `protected/{user_identity_id}/` where the **user_identity_id** corresponds to a unique Amazon Cognito Identity ID for that user.

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

Public level:

```js
Storage.put('test.txt', 'Hello')
    .then (result => console.log(result))
    .catch(err => console.log(err));
```

Protected level:

```js
Storage.put('test.txt', 'Protected Content', {
    level: 'protected',
    contentType: 'text/plain'
})
.then (result => console.log(result))
.catch(err => console.log(err));
```

Private level:

```js
Storage.put('test.txt', 'Private Content', {
    level: 'private',
    contentType: 'text/plain'
})
.then (result => console.log(result))
.catch(err => console.log(err));
```

Upload an image in the browser:

```js
class S3ImageUpload extends React.Component {
  onChange(e) {
      const file = e.target.files[0];
      Storage.put('example.png', file, {
          contentType: 'image/png'
      })
      .then (result => console.log(result))
      .catch(err => console.log(err));
  }

  render() {
      return (
          <input
              type="file" accept='image/png'
              onChange={(e) => this.onChange(e)}
          />
      )
  }
}
```

Upload an image in React Native app:

```js
import RNFetchBlob from 'react-native-fetch-blob';

readFile(filePath) {
    return RNFetchBlob.fs.readFile(filePath, 'base64').then(data => new Buffer(data, 'base64'));
}

readFile(imagePath).then(buffer => {
    Storage.put(key, buffer, {
        contentType: imageType
    })
}).catch(e => {
    console.log(e);
});
```

When a networking error happens during the upload, Storage module retries upload for a maximum of  4 attempts. If the upload fails after all retries, you will get an error.
{: .callout .callout--info}

#### Get

Retrieves a publicly accessible URL for data stored.

Public level:
```js
Storage.get('test.txt')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Protected level:
To get current user's objects
```js
Storage.get('test.txt', { level: 'protected' })
    .then(result => console.log(result))
    .catch(err => console.log(err));
```
To get other users' objects
```js
Storage.get('test.txt', { 
    level: 'protected', 
    identityId: 'xxxxxxx' // the identityId of that user
})
.then(result => console.log(result))
.catch(err => console.log(err));
```

Private level:
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

Public level: 
```js
Storage.remove('test.txt')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Protected level: 
```js
Storage.remove('test.txt', {level: 'protected'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Private level:
```js
Storage.remove('test.txt', {level: 'private'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

#### List

List keys under path specified.

Public level:
```js
Storage.list('photos/')
    .then(result => console.log(result))
    .catch(err => console.log(err));
```

Protected level:
To list current user's objects
```js
Storage.list('photos/', { level: 'protected' })
    .then(result => console.log(result))
    .catch(err => console.log(err));
```
To get other users' objects
```js
Storage.list('photos/', { 
    level: 'protected', 
    identityId: 'xxxxxxx' // the identityId of that user
})
.then(result => console.log(result))
.catch(err => console.log(err));
```

Private level:
```js
Storage.list('photos/', {level: 'private'})
    .then(result => console.log(result))
    .catch(err => console.log(err));
```


#### API Reference

For the complete API documentation for Storage module, visit our [API Reference]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/api/classes/storageclass.html)
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

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/images/photo_picker_and_code.png" width="100%"/>

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

<img src="{%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/images/S3Album_and_code.png" width="100%"/>

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

## UI Components for Angular

`aws-amplify-angular` provides similar storage ui components.

### Photo Picker

Add a photo picker to your components template:

```html

<amplify-photo-picker 
    (loaded)="onImagePreviewLoaded($event)"
    (picked)="onImageSelected($event)">
</amplify-photo-picker>

```

### S3 Album

Add an S3 album component to your template:

```html

<amplify-s3-album 
    path="{{s3ListPath}}"
    (selected)="onAlbumImageSelected($event)">  			
</amplify-s3-album>

```

See the [Angular Guide](https://aws-amplify.github.io/amplify-js/media/angular_guide) for usage.

## Customization 

### Customize Upload Path 

You can customize your upload path by defining prefixes:

```js
const customPrefix: {
    public: 'myPublicPrefix/',
    protected: 'myProtectedPrefix/',
    private: 'myPrivatePrefix/'
};

Storage.put('test.txt', 'Hello', {
    customPrefix: customPrefix,
    // ...
})
.then (result => console.log(result))
.catch(err => console.log(err));
```

For example, if you want to enable read, write and delete operation for all the objects under path *myPublicPrefix/*,  declare it in your IAM policy:

```xml
"Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject"
        ],
        "Resource": [
            "arn:aws:s3:::your-s3-bucket/myPublicPrefix/*",
        ]
    }
]
```

If you want to have custom *private* path prefix like *myPrivatePrefix/*, you need to add it into your IAM policy:
```xml
"Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject"
        ],
        "Resource": [
            "arn:aws:s3:::your-s3-bucket/myPrivatePrefix/${cognito-identity.amazonaws.com:sub}/*"
        ]
    }
]
```
This ensures only the authenticated users has the access to the objects under the path.

## Using Modular Imports

If you only need to use Storage, you can do: `npm install @aws-amplify/storage` which will only install the Storage module for you.
Note: if you're using Cognito Federated Identity Pool to get AWS credentials, please also install `@aws-amplify/auth`.

Then in your code, you can import the Storage module by:
```js
import Storage from '@aws-amplify/storage';

Storage.configure();

```
