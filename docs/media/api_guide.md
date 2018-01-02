# API

AWS Amplify API module provides a simple solution when making HTTP request to Amazon API Gateway. 

* [Installation](#installation)
* [Configuration](#configuration)
  * [Manual Setup](#manual-setup)
  * [Automated Setup](#automated-setup)
* [Integration](#integration)
  * [GET](#get)
  * [POST](#post)
  * [PUT](#put)
  * [DELETE](#delete)
  * [HEAD](#head)

## Installation

For Web development, regardless of framework, `aws-amplify` provides core functionality

```
npm install aws-amplify
```

## Configuration

You are required to pass in an Amazon Cognito Identity Pool ID so that the library can retrieve base credentials for a user even in an UnAuthenticated state. AWS Amplify also require a list of your API, you must provide a name for identify it later and the endpoint. Amazon Cognito Identity Pool requires to have access to the API using Amazon IAM. You can configure it by yourself or let [AWS Mobile Hub do it for you](#automated-setup)!

### Manual Setup

[Amazon Cognito Identity](http://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html)

[Amazon IAM](http://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started.html)

[Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html)

After configuring this resources you can add these lines to your source code.
```
import Amplify, { API } from 'aws-amplify';

Amplify.configure(
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

AWS Mobile Hub streamlines the steps above for you. Simply click the button:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/aws/aws-amplify/blob/master/media/backend/import_mobilehub/api.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

This will create a project that works with API category fully functioning. Before proceeding further, in the Mobile Hub console click the Cloud Logic tile and ensure that the API deployment status at the bottom shows CREATE_COMPLETE (this can take a few moments). After the project is created in the Mobile Hub console download aws-exports.js by clicking the **Hosting and Streaming** tile then **Download aws-exports.js**.

![Mobile Hub](console.gif)

Then copy the file to a visible folder of your project

Now you can simply import the file and pass it as the configuration to the Amplify library:

Add these lines to your source.
```
import Amplify, { API } from 'aws-amplify';
import aws_exports from './PATH_TO_EXPORTS/aws-exports.js';

Amplify.configure(aws_exports);
```


## Integration

First check the name of the API that you want to invoke. In case you manually configure the API you already know the API name. If you use Automated Setup or configure your API on AWS Mobile Hub you can check the API name in the Mobile Hub console by clicking Cloud Logic tile. You can use the below code as is if you use Automated Setup.

Now you can invoke your API with GET, POST, PUT, DELETE and HEAD methods.

Each method of Amplify's API module returns a Promise which is seen in the below examples on different HTTP verbs. Configure the apiName, path and headers according to your settings.

### **GET**

```
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

```
async getData() { 
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
To use custom headers on your HTTP request you need to add this on Amazon API Gateway first. For more info about configuring headers go [here](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

If you use one click import or AWS Mobile Hub to create your API, you can do the following:
1. Go to your project on AWS Mobile Hub console.
2. Go to resources and click the link on Amazon API Gateway section. This will redirect you to Amazon API Gateway console.
3. On Amazon API Gateway console, click on the path you want to configure (e.g. /{proxy+})
4. Then click on Actions and select Enable CORS
5. You can add your custom header (e.g. my-custom-header) on the text field Access-Control-Allow-Headers like this: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,my-custom-header'
6. Click on 'Enable CORS and replace existing CORS headers' and confirm.
7. Last step, on the same path you click on step 3, click on Actions and select Deploy API. Select 'Development' on deployment stage and click Deploy. (Deployment could take a couple of minutes).

### **POST**

```
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

```
async postData() { 
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

```
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

```
async putData() { 
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

```
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

```
async deleteData() { 
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

```
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

```
async head() { 
    let apiName = 'MyApiName';
    let path = '/path';
    let myInit = { // OPTIONAL
        headers: {} // OPTIONAL
    }
    return await API.head(apiName, path, myInit);
}

head();
```
