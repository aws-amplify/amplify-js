# API

AWS Amplify API module provides a simple solution when making HTTP requests. It provides an automatic, lightweight signing process which complies with [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html). 

* [Installation and Configuration](#installation-and-configuration)
  - [Manual Setup](#manual-setup)
  - [Automated Setup](#automated-setup)
* [Integration](#integration)
  * [GET](#get)
  * [POST](#post)
  * [PUT](#put)
  * [DELETE](#delete)
  * [HEAD](#head)

## Installation and Configuration

Please refer to this [Guide](install_n_config.md) for general setup. Here are Analytics specific setup.

The API module can be used out of the box for signed requests against Amazon API Gateway when the API Authorization is set to **AWS_IAM**. 

You are required to pass in an Amazon Cognito Identity Pool ID, allowing the library to retrieve base credentials for a user even in an UnAuthenticated state. AWS Amplify also requires a list of your APIs, comprised of a friendly name for the API and the endpoint URL. 

Amazon Cognito Identity Pool requires to have access to the API using Amazon IAM. You can configure it by yourself or let [AWS Mobile Hub do it for you](#automated-setup)!

[Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html)

### Manual Setup

After configuring this resources you can add these lines to your source code.
```js
import Amplify, { API } from 'aws-amplify';

Amplify.configure({
    Auth: {
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab', //REQUIRED - Amazon Cognito Identity Pool ID
        region: 'XX-XXXX-X', // REQUIRED - Amazon Cognito Region
        userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
        userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
    },
    API: {
        endpoints: [
            {
                name: "ApiName1",
                endpoint: "https://1234567890-abcdefgh.amazonaws.com"
            },
            {
                name: "ApiName2",
                endpoint: "https://1234567890-abcdefghijkl.amazonaws.com"
            }
        ]
    }
});

```

### Automated Setup

To create a project fully functioning with the API category.

```
$ npm install -g awsmobile-cli
$ cd my-app
$ awsmobile init
$ awsmobile enable cloud-api
```

In your project i.e. App.js:

```
import Amplify, { API } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

This will create a project that works with API category fully functioning. Your lambda function will be in the awsmobilejs folder within your project. You can edit your lambda code and then upload the changes with:

```
$ awsmobile push
```

## Integration

First note the name of the API that you want to invoke. If you manually configured the API, you most likely already know the API name. If you use Automated Setup or configure your API on AWS Mobile Hub you can check the API name in the Mobile Hub console by clicking Cloud Logic tile. 

The below code assumes use of the Automated Setup.

Each method of Amplify's API module returns a Promise which is seen in the below examples with different HTTP verbs. Configure the `apiName`, `path` and `headers` according to your settings.

### **GET**

```js
let apiName = 'MyApiName';
let path = '/path'; 
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
}
API.get(apiName, path, myInit).then(response => {
    // Add your code here
});

```

Example with async/await

```js
async function getData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.get(apiName, path, myInit);
}

getData();
```
### Note about headers

To use custom headers on your HTTP request you need to add these to Amazon API Gateway first. For more info about configuring headers go [here](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

If you used one click import or AWS Mobile Hub to create your API, you can do the following:

1. Go to your project on AWS Mobile Hub console.
2. Go to resources and click the link on Amazon API Gateway section. This will redirect you to Amazon API Gateway console.
3. On Amazon API Gateway console, click on the path you want to configure (e.g. /{proxy+})
4. Then click the Actions dropdown and select **Enable CORS**
5. Add your custom header (e.g. my-custom-header) on the text field Access-Control-Allow-Headers, separated by commas, like so: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,my-custom-header'
6. Click on 'Enable CORS and replace existing CORS headers' and confirm.
7. Finally, similar to step 3, click the Actions dropdown and then **Deploy API**. Select **Development** on deployment stage and then **Deploy**. (Deployment could take a couple of minutes).

### **POST**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = {
    body: {}, // replace this with attributes you need
    headers: {} // OPTIONAL
}

API.post(apiName, path, myInit).then(response => {
    // Add your code here
});

```

Example with async/await

```js
async function postData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        body: {}, // replace this with attributes you need
        headers: {} // OPTIONAL
    }
    return await API.post(apiName, path, myInit);
}

postData();
```

### **PUT**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; // replace this with the path you have configured on your API
let myInit = {
    body: {}, // replace this with attributes you need
    headers: {} // OPTIONAL
}

API.put(apiName, path, myInit).then(response => {
    // Add your code here
});

```

Example with async/await

```js
async function putData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        body: {}, // replace this with attributes you need
        headers: {} // OPTIONAL
    }
    return await API.put(apiName, path, myInit);
}

putData();
```

### **DELETE**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
}

API.del(apiName, path, myInit).then(response => {
    // Add your code here
});

```

Example with async/await

```js
async function deleteData() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.delete(apiName, path, myInit);
}

deleteData();
```

### **HEAD**

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
}
API.head(apiName, path, myInit).then(response => {
    // Add your code here
});

```

Example with async/await

```js
async function head() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.head(apiName, path, myInit);
}

head();
```
