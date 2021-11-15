# Automatically Generated Snippet Documentation

##### prefix: `Amplify Automated Setup`

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

##### prefix: `Amplify Manual Setup`

```js
import { Analytics } from 'aws-amplify';

Analytics.configure({
	// OPTIONAL - disable Analytics if true
	disabled: false,
	// OPTIONAL - Allow recording session events. Default is true.
	autoSessionRecord: true,

	AWSPinpoint: {
		// OPTIONAL -  Amazon Pinpoint App Client ID
		appId: 'XXXXXXXXXXabcdefghij1234567890ab',
		// OPTIONAL -  Amazon service region
		region: 'XX-XXXX-X',
		// OPTIONAL -  Customized endpoint
		endpointId: 'XXXXXXXXXXXX',
		// OPTIONAL - client context
		clientContext: {
			clientId: 'xxxxx',
			appTitle: 'xxxxx',
			appVersionName: 'xxxxx',
			appVersionCode: 'xxxxx',
			appPackageName: 'xxxxx',
			platform: 'xxxxx',
			platformVersion: 'xxxxx',
			model: 'xxxxx',
			make: 'xxxxx',
			locale: 'xxxxx',
		},

		// Buffer settings used for reporting analytics events.

		// OPTIONAL - The buffer size for events in number of items.
		bufferSize: 1000,

		// OPTIONAL - The interval in milliseconds to perform a buffer check and flush if necessary.
		flushInterval: 5000, // 5s

		// OPTIONAL - The number of events to be deleted from the buffer when flushed.
		flushSize: 100,

		// OPTIONAL - The limit for failed recording retries.
		resendLimit: 5,
	},
});
```

##### prefix: `Amplify Recording A Custom Tracking Event`

```js
import { Analytics } from 'aws-amplify';

Analytics.record({ name: 'albumVisit' });
```

##### prefix: `Amplify Record A Custom Tracking Event With Attributes`

```js
import { Analytics } from 'aws-amplify';

Analytics.record({
	name: 'albumVisit',
	attributes: { genre: '', artist: '' },
});
```

##### prefix: `Amplify Record Engagement Metrics`

```js
import { Analytics } from 'aws-amplify';

Analytics.record({
	name: 'albumVisit',
	attributes: {},
	metrics: { minutesListened: 30 },
});
```

##### prefix: `Amplify Disable/Enable Analytics`

```js
import { Analytics } from 'aws-amplify';

// to disable Analytics
Analytics.disable();

// to enable Analytics
Analytics.enable();
```

##### prefix: `Amplify Record Authentication Events`

```js
import { Analytics } from 'aws-amplify';

// Sign-in event
Analytics.record({
	name: '_userauth.sign_in',
});

// Sign-up event
Analytics.record({
	name: '_userauth.sign_up',
});

// Authentication failure event
Analytics.record({
	name: '_userauth.auth_fail',
});
```

##### prefix: `Amplify Update User Attributes`

```js
import { Analytics } from 'aws-amplify';

Analytics.updateEndpoint({
	// Customized userId
	UserId: 'XXXXXXXXXXXX',
	// User attributes
	Attributes: {
		interests: ['football', 'basketball', 'AWS'],
		// ...
	},
	// Custom user attributes
	UserAttributes: {
		hobbies: ['piano', 'hiking'],
		// ...
	},
});
```

##### prefix: `Amplify Installation And Configuration`

```js
import { Analytics, AWSKinesisProvider } from 'aws-amplify';
Analytics.addPluggable(new AWSKinesisProvider());
```

##### prefix: `Amplify Installation And Configuration 2`

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": ["kinesis:PutRecord", "kinesis:PutRecords"],
			"Resource": "*"
		}
	]
}
```

##### prefix: `Amplify Installation And Configuration 3`

```js
// Configure the plugin after adding it to the Analytics module
Analytics.configure({
	AWSKinesis: {
		// OPTIONAL -  Amazon Kinesis service region
		region: 'XX-XXXX-X',

		// OPTIONAL - The buffer size for events in number of items.
		bufferSize: 1000,

		// OPTIONAL - The number of events to be deleted from the buffer when flushed.
		flushSize: 100,

		// OPTIONAL - The interval in milliseconds to perform a buffer check and flush if necessary.
		flushInterval: 5000, // 5s

		// OPTIONAL - The limit for failed recording retries.
		resendLimit: 5,
	},
});
```

##### prefix: `Amplify Working With The Api`

```js
Analytics.record(
	{
		data: {
			// The data blob to put into the record
		},
		// OPTIONAL
		partitionKey: 'myPartitionKey',
		streamName: 'myKinesisStream',
	},
	'AWSKinesis'
);
```

##### prefix: `Amplify Using A Custom Plugin`

```typescript
import { Analytics, AnalyticsProvider } from 'aws-amplify';

export default class MyAnalyticsProvider implements AnalyticsProvider {
	// category and provider name
	static category = 'Analytics';
	static providerName = 'MyAnalytics';

	// you need to implement these four methods
	// configure your provider
	configure(config: object): object;

	// record events and returns true if succeeds
	record(params: object): Promise<boolean>;

	// return 'Analytics';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;
}
```

##### prefix: `Amplify Using A Custom Plugin 2`

```js
// add the plugin
Analytics.addPluggable(new MyAnalyticsProvider());

// get the plugin
Analytics.getPluggable(MyAnalyticsProvider.providerName);

// remove the plulgin
Analytics.removePluggable(MyAnalyticsProvider.providerName);

// send configuration into Amplify
Analytics.configure({
	YOUR_PLUGIN_NAME: {
		// My Analytics provider configuration
	},
});
```

##### prefix: `Amplify Using Modularized Module`

```js
import Analytics from '@aws-amplify/analytics';

Analytics.configure();
```

##### prefix: `Amplify Setup`

```js
"scripts": {
    "start": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng serve; ng serve",
    "build": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng build --prod; ng build --prod"
}
```

##### prefix: `Amplify Setup 2`

```js
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
Amplify.configure(awsmobile);
```

##### prefix: `Amplify Setup 3`

```json
"compilerOptions": {
    "types" : ["node"]
}
```

##### prefix: `Amplify Setup 4`

```js
"defaults": {
    "styleExt": "css",
    "component": {},
    "build": {
        "preserveSymlinks": true
    }
  }
```

##### prefix: `Amplify Importing Amplify`

```js
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

@NgModule({
  ...
  imports: [
    ...
    AmplifyAngularModule
  ],
  ...
  providers: [
    ...
    AmplifyService
  ]
  ...
});
```

##### prefix: `Amplify Using Dependency Injection`

```js
import { AmplifyService } from 'aws-amplify-angular';

...
constructor(
    public navCtrl:NavController,
    public amplifyService: AmplifyService,
    public modalCtrl: ModalController
) {
    this.amplifyService = amplifyService;
}
...
```

##### prefix: `Amplify Using Aws Amplify Categories`

```js
import { Component } from '@angular/core';
import { AmplifyService }  from 'aws-amplify-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor( public amplify:AmplifyService ) {

      this.amplifyService = amplify;

      /** now you can access category APIs:
       * this.amplifyService.auth();          // AWS Amplify Auth
       * this.amplifyService.analytics();     // AWS Amplify Analytics
       * this.amplifyService.storage();       // AWS Amplify Storage
       * this.amplifyService.api();           // AWS Amplify API
       * this.amplifyService.cache();         // AWS Amplify Cache
       * this.amplifyService.pubsub();        // AWS Amplify PubSub
     **/
  }

}
```

##### prefix: `Amplify Usage Example: Subscribe To Authentication State Changes`

```js
import { AmplifyService }  from 'aws-amplify-angular';

  // ...
constructor( public amplifyService: AmplifyService ) {

    this.amplifyService = amplifyService;

    this.amplifyService.authStateChange$
        .subscribe(authState => {
        this.signedIn = authState.state === 'signedIn';
        if (!authState.user) {
            this.user = null;
        } else {
            this.user = authState.user;
            this.greeting = "Hello " + this.user.username;
        }
        });

}
```

##### prefix: `Amplify Photo Picker`

```js
onImagePicked( file ) {

    let key = `pics/${file.name}`;

    this.amplify.storage().put( key, file, {
      'level': 'private',
      'contentType': file.type
    })
    .then (result => console.log('uploaded: ', result))
    .catch(err => console.log('upload error: ', err));

}
```

##### prefix: `Amplify S3 Album`

```js
onAlbumImageSelected( event ) {
      window.open( event, '_blank' );
}
```

##### prefix: `Amplify Automated Setup`

```js
import Amplify, { API } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

##### prefix: `Amplify Manual Setup`

```js
import Amplify, { API } from 'aws-amplify';

Amplify.configure({
	Auth: {
		// REQUIRED - Amazon Cognito Identity Pool ID
		identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
		// REQUIRED - Amazon Cognito Region
		region: 'XX-XXXX-X',
		// OPTIONAL - Amazon Cognito User Pool ID
		userPoolId: 'XX-XXXX-X_abcd1234',
		// OPTIONAL - Amazon Cognito Web Client ID
		userPoolWebClientId: 'XX-XXXX-X_abcd1234',
	},
	API: {
		endpoints: [
			{
				name: 'MyAPIGatewayAPI',
				endpoint: 'https://1234567890-abcdefgh.amazonaws.com',
			},
			{
				name: 'MyCustomCloudFrontApi',
				endpoint: 'https://api.my-custom-cloudfront-domain.com',
			},
			{
				name: 'MyCustomLambdaApi',
				endpoint:
					'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/yourFuncName/invocations',
				service: 'lambda',
				region: 'us-east-1',
			},
		],
	},
});
```

##### prefix: `Amplify Aws Regional Endpoints`

```js
API: {
	endpoints: [
		{
			name: 'MyCustomLambdaApi',
			endpoint:
				'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/yourFuncName/invocations',
			service: 'lambda',
			region: 'us-east-1',
		},
	];
}
```

##### prefix: `Amplify Get**`

```js
let apiName = 'MyApiName';
let path = '/path';
let myInit = { // OPTIONAL
    headers: {} // OPTIONAL
    response: true // OPTIONAL (return entire response object instead of response.data)
    queryStringParameters: {} // OPTIONAL
}
API.get(apiName, path, myInit).then(response => {
    // Add your code here
}).catch(error => {
    console.log(error.response)
});
```

##### prefix: `Amplify Get** 2`

```js
async function getData() {
	let apiName = 'MyApiName';
	let path = '/path';
	let myInit = {
		// OPTIONAL
		headers: {}, // OPTIONAL
	};
	return await API.get(apiName, path, myInit);
}

getData();
```

##### prefix: `Amplify Get** 3`

```js
let items = await API.get('myCloudApi', '/items', {
	queryStringParameters: {
		order: 'byPrice',
	},
});
```

##### prefix: `Amplify Get** 4`

```js
exports.handler = function (event, context, callback) {
	console.log(event.queryStringParameters);
};
```

##### prefix: `Amplify Get** 5`

```js
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
app.use(awsServerlessExpressMiddleware.eventContext());
```

##### prefix: `Amplify Get** 6`

```js
app.get('/items', function (req, res) {
	// req.apiGateway.event.queryStringParameters
	res.json(req.apiGateway.event);
});
```

##### prefix: `Amplify Get** 7`

```js
API.get('sampleCloudApi', '/items?q=test');
```

##### prefix: `Amplify Post**`

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = {
	body: {}, // replace this with attributes you need
	headers: {}, // OPTIONAL
};

API.post(apiName, path, myInit)
	.then((response) => {
		// Add your code here
	})
	.catch((error) => {
		console.log(error.response);
	});
```

##### prefix: `Amplify Post** 2`

```js
async function postData() {
	let apiName = 'MyApiName';
	let path = '/path';
	let myInit = {
		// OPTIONAL
		body: {}, // replace this with attributes you need
		headers: {}, // OPTIONAL
	};
	return await API.post(apiName, path, myInit);
}

postData();
```

##### prefix: `Amplify Put**`

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; // replace this with the path you have configured on your API
let myInit = {
	body: {}, // replace this with attributes you need
	headers: {}, // OPTIONAL
};

API.put(apiName, path, myInit)
	.then((response) => {
		// Add your code here
	})
	.catch((error) => {
		console.log(error.response);
	});
```

##### prefix: `Amplify Put** 2`

```js
async function putData() {
	let apiName = 'MyApiName';
	let path = '/path';
	let myInit = {
		// OPTIONAL
		body: {}, // replace this with attributes you need
		headers: {}, // OPTIONAL
	};
	return await API.put(apiName, path, myInit);
}

putData();
```

##### prefix: `Amplify Put** 3`

```js
const params = {
	body: {
		itemId: '12345',
		itemDesc: ' update description',
	},
};
const apiResponse = await API.put('MyTableCRUD', '/manage-items', params);
```

##### prefix: `Amplify Delete**`

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = {
	// OPTIONAL
	headers: {}, // OPTIONAL
};

API.del(apiName, path, myInit)
	.then((response) => {
		// Add your code here
	})
	.catch((error) => {
		console.log(error.response);
	});
```

##### prefix: `Amplify Delete** 2`

```js
async function deleteData() {
	let apiName = 'MyApiName';
	let path = '/path';
	let myInit = {
		// OPTIONAL
		headers: {}, // OPTIONAL
	};
	return await API.del(apiName, path, myInit);
}

deleteData();
```

##### prefix: `Amplify Head**`

```js
let apiName = 'MyApiName'; // replace this with your api name.
let path = '/path'; //replace this with the path you have configured on your API
let myInit = {
	// OPTIONAL
	headers: {}, // OPTIONAL
};
API.head(apiName, path, myInit).then((response) => {
	// Add your code here
});
```

##### prefix: `Amplify Head** 2`

```js
async function head() {
	let apiName = 'MyApiName';
	let path = '/path';
	let myInit = {
		// OPTIONAL
		headers: {}, // OPTIONAL
	};
	return await API.head(apiName, path, myInit);
}

head();
```

##### prefix: `Amplify Custom Request Headers`

```js
Amplify.configure({
	API: {
		endpoints: [
			{
				name: 'sampleCloudApi',
				endpoint: 'https://xyz.execute-api.us-east-1.amazonaws.com/Development',
				custom_header: async () => {
					return { Authorization: 'token' };
					// Alternatively, with Cognito User Pools use this:
					// return { (await Auth.currentSession()).idToken.jwtToken }
				},
			},
		],
	},
});
```

##### prefix: `Amplify Configuration For Graphql Server`

```js
import Amplify, { API } from 'aws-amplify';
import aws_config from './aws-exports';

// Considering you have an existing aws-exports.js configuration file
Amplify.configure(aws_config);

// Configure a custom GraphQL endpoint
Amplify.configure({
	API: {
		graphql_endpoint: 'https:/www.example.com/my-graphql-endpoint',
	},
});
```

##### prefix: `Amplify Set Custom Request Headers For Graphql`

```js
Amplify.configure({
	API: {
		graphql_headers: async () => ({
			'My-Custom-Header': 'my value',
		}),
	},
});
```

##### prefix: `Amplify Automated Configuration With Cli`

```js
import aws_config from './aws-exports';
Amplify.configure(aws_config);
```

##### prefix: `Amplify Using Api_Key`

```js
let myAppConfig = {
	// ...
	aws_appsync_graphqlEndpoint:
		'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxxxxxx',
	// ...
};

Amplify.configure(myAppConfig);
```

##### prefix: `Amplify Using Aws_Iam`

```js
let myAppConfig = {
	// ...
	aws_appsync_graphqlEndpoint:
		'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'AWS_IAM',
	// ...
};

Amplify.configure(myAppConfig);
```

##### prefix: `Amplify Using Amazon_Cognito_User_Pools`

```js
let myAppConfig = {
	// ...
	aws_appsync_graphqlEndpoint:
		'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS', // You have configured Auth with Amazon Cognito User Pool ID and Web Client Id
	// ...
};

Amplify.configure(myAppConfig);
```

##### prefix: `Amplify Using Openid_Connect`

```js
let myAppConfig = {
	// ...
	aws_appsync_graphqlEndpoint:
		'https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'OPENID_CONNECT', // Before calling API.graphql(...) is required to do Auth.federatedSignIn(...) check authentication guide for details.
	// ...
};

Amplify.configure(myAppConfig);
```

##### prefix: `Amplify Query Declarations`

```js
const ListEvents = `query ListEvents {
  listEvents {
    items {
      id
      where
      description
    }
  }
}`;
```

##### prefix: `Amplify Query Declarations 2`

```js
const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
    getEvent(id: $id) {
        id
        name
        description
        comments(nextToken: $nextToken) {
            items {
                content
            }
        }
    }
}`;
```

##### prefix: `Amplify Simple Query`

```js
import Amplify, { API, graphqlOperation } from 'aws-amplify';

const ListEvents = `query ListEvents {
  listEvents {
    items {
      id
      where
      description
    }
  }
}`;

const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
    getEvent(id: $id) {
        id
        name
        description
        comments(nextToken: $nextToken) {
            items {
                content
            }
        }
    }
}`;

// Simple query
const allEvents = await API.graphql(graphqlOperation(ListEvents));

// Query using a parameter
const oneEvent = await API.graphql(
	graphqlOperation(GetEvent, { id: 'some id' })
);
console.log(oneEvent);
```

##### prefix: `Amplify Mutations`

```js
import Amplify, { API, graphqlOperation } from 'aws-amplify';

const CreateEvent = `mutation CreateEvent($name: String!, $when: String!, $where: String!, $description: String!) {
  createEvent(name: $name, when: $when, where: $where, description: $description) {
    id
    name
    where
    when
    description
  }
}`;

// Mutation
const eventDetails = {
	name: 'Party tonight!',
	when: '8:00pm',
	where: 'Ballroom',
	description: 'Coming together as a team!',
};

const newEvent = await API.graphql(graphqlOperation(CreateEvent, eventDetails));
console.log(newEvent);
```

##### prefix: `Amplify Subscriptions`

```js
import Amplify, { API, graphqlOperation } from 'aws-amplify';

const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
  subscribeToEventComments(eventId: $eventId) {
    eventId
    commentId
    content
  }
}`;

// Subscribe with eventId 123
const subscription = API.graphql(
	graphqlOperation(SubscribeToEventComments, { eventId: '123' })
).subscribe({
	next: (eventData) => console.log(eventData),
});

// Stop receiving data updates from the subscription
subscription.unsubscribe();
```

##### prefix: `Amplify Subscriptions 2`

```js
Amplify.configure({
	Auth: {
		identityPoolId: 'xxx',
		region: 'xxx',
		cookieStorage: {
			domain: 'xxx',
			path: 'xxx',
			secure: true,
		},
	},
	aws_appsync_graphqlEndpoint: 'xxxx',
	aws_appsync_region: 'xxxx',
	aws_appsync_authenticationType: 'xxxx',
	aws_appsync_apiKey: 'xxxx',
});
```

##### prefix: `Amplify Signing Request With Iam`

```js
Amplify.configure({
	API: {
		graphql_endpoint: 'https://www.example.com/my-graphql-endpoint',
		graphql_endpoint_iam_region: 'my_graphql_apigateway_region',
	},
});
```

##### prefix: `Amplify Connect`

```js
import React from 'react';
import Amplify, { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';

class App extends React.Component {
	render() {
		const ListView = ({ events }) => (
			<div>
				<h3>All events</h3>
				<ul>
					{events.map((event) => (
						<li key={event.id}>
							{event.name} ({event.id})
						</li>
					))}
				</ul>
			</div>
		);

		const ListEvents = `query ListEvents {
            listEvents {
                items {
                id
                name
                description
                }
            }
        }`;

		return (
			<Connect query={graphqlOperation(ListEvents)}>
				{({ data: { listEvents } }) => <ListView events={listEvents.items} />}
			</Connect>
		);
	}
}

export default App;
```

##### prefix: `Amplify Connect 2`

```js
<Connect
	query={graphqlOperation(GetEvent, { id: currEventId })}
	subscription={graphqlOperation(SubscribeToEventComments, {
		eventId: currEventId,
	})}
	onSubscriptionMsg={(prev, { subscribeToEventComments }) => {
		console.log(subscribeToEventComments);
		return prev;
	}}
>
	{({ data: { listEvents } }) => (
		<AllEvents events={listEvents ? listEvents.items : []} />
	)}
</Connect>
```

##### prefix: `Amplify Connect 3`

```js
class CreateEvent extends React.Component {
	// ...
	// This component calls its onCreate prop to trigger the mutation
	// ...
}
<Connect mutation={graphqlOperation(Operations.CreateEvent)}>
	{({ mutation }) => <CreateEvent onCreate={mutation} />}
</Connect>;
```

##### prefix: `Amplify Using Modularized Module`

```js
import API from '@aws-amplify/api';

API.configure();
```

##### prefix: `Amplify Automated Setup`

```js
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);
```

##### prefix: `Amplify Manual Setup`

```js
import Amplify from 'aws-amplify';

Amplify.configure({
	Auth: {
		// REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
		identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',

		// REQUIRED - Amazon Cognito Region
		region: 'XX-XXXX-X',

		// OPTIONAL - Amazon Cognito User Pool ID
		userPoolId: 'XX-XXXX-X_abcd1234',

		// OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
		userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',

		// OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
		mandatorySignIn: false,

		// OPTIONAL - Configuration for cookie storage
		cookieStorage: {
			// REQUIRED - Cookie domain (only required if cookieStorage is provided)
			domain: '.yourdomain.com',
			// OPTIONAL - Cookie path
			path: '/',
			// OPTIONAL - Cookie expiration in days
			expires: 365,
			// OPTIONAL - Cookie secure flag
			secure: true,
		},

		// OPTIONAL - customized storage object
		storage: new MyStorage(),

		// OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
		authenticationFlowType: 'USER_PASSWORD_AUTH',
	},
});
```

##### prefix: `Amplify Node.Js Support`

```js
global.fetch = require('node-fetch');
```

##### prefix: `Amplify Sign In`

```js
import { Auth } from 'aws-amplify';

Auth.signIn(username, password)
	.then((user) => console.log(user))
	.catch((err) => console.log(err));

// If MFA is enabled, sign-in should be confirmed with the congirmation code
// `user` : Return object from Auth.signIn()
// `code` : Confirmation code
// `mfaType` : MFA Type e.g. SMS, TOTP.
Auth.confirmSignIn(user, code, mfaType)
	.then((data) => console.log(data))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Sign Up`

```js
import { Auth } from 'aws-amplify';

Auth.signUp({
	username,
	password,
	attributes: {
		email, // optional
		phone_number, // optional - E.164 number convention
		// other custom attributes
	},
	validationData: [], //optional
})
	.then((data) => console.log(data))
	.catch((err) => console.log(err));

// After retrieveing the confirmation code from the user
Auth.confirmSignUp(username, code, {
	// Optional. Force user confirmation irrespective of existing alias. By default set to True.
	forceAliasCreation: true,
})
	.then((data) => console.log(data))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Sign Out`

```js
import { Auth } from 'aws-amplify';

Auth.signOut()
	.then((data) => console.log(data))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Change Password`

```js
import { Auth } from 'aws-amplify';

Auth.currentAuthenticatedUser()
	.then((user) => {
		return Auth.changePassword(user, 'oldPassword', 'newPassword');
	})
	.then((data) => console.log(data))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Forgot Password`

```js
import { Auth } from 'aws-amplify';

Auth.forgotPassword(username)
	.then((data) => console.log(data))
	.catch((err) => console.log(err));

// Collect confirmation code and new password, then
Auth.forgotPasswordSubmit(username, code, new_password)
	.then((data) => console.log(data))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Retrieve Current Session`

```js
let session = Auth.currentSession();
// CognitoUserSession => { idToken, refreshToken, accessToken }
```

##### prefix: `Amplify Managing Security Tokens`

```js
var data = { UserPoolId: 'us-east-1_resgd', ClientId: 'xyz' };
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

if (cognitoUser != null) {
	cognitoUser.getSession(function (err, session) {
		if (err) {
			alert(err);
			return;
		}

		// Get refresh token before refreshing session
		refresh_token = session.getRefreshToken();

		if (AWS.config.credentials.needsRefresh()) {
			cognitoUser.refreshSession(refresh_token, (err, session) => {
				if (err) {
					console.log(err);
				} else {
					AWS.config.credentials.params.Logins[
						'cognito-idp.<YOUR-REGION>.amazonaws.com/<YOUR_USER_POOL_ID>'
					] = session.getIdToken().getJwtToken();
					AWS.config.credentials.refresh((err) => {
						if (err) {
							console.log(err);
						} else {
							console.log('TOKEN SUCCESSFULLY UPDATED');
						}
					});
				}
			});
		}
	});
}
```

##### prefix: `Amplify Using Withauthenticator Hoc`

```js
import { withAuthenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native';
...
export default withAuthenticator(App);
```

##### prefix: `Amplify Enabling Federated Identities`

```js
const AppWithAuth = withAuthenticator(App);

const federated = {
	google_client_id: '',
	facebook_app_id: '',
	amazon_client_id: '',
};

ReactDOM.render(
	<AppWithAuth federated={federated} />,
	document.getElementById('root')
);
```

##### prefix: `Amplify Enabling Federated Identities 2`

```js
import { Auth } from 'aws-amplify';

// Retrieve active Google user session
const ga = window.gapi.auth2.getAuthInstance();
ga.signIn().then((googleUser) => {
	const { id_token, expires_at } = googleUser.getAuthResponse();
	const profile = googleUser.getBasicProfile();
	const user = {
		email: profile.getEmail(),
		name: profile.getName(),
	};

	return Auth.federatedSignIn(
		// Initiate federated sign-in with Google identity provider
		'google',
		{
			// the JWT token
			token: id_token,
			// the expiration time
			expires_at,
		},
		// a user object
		user
	).then(() => {
		// ...
	});
});
```

##### prefix: `Amplify Enabling Federated Identities 3`

```js
import { Cache } from 'aws-amplify';

// Run this after the sign-in
Cache.getItem('federatedInfo').then((federatedInfo) => {
	const { token } = federatedInfo;
});
```

##### prefix: `Amplify Enabling Federated Identities 4`

```js
import { Auth } from 'aws-amplify';

function refreshToken() {
	// refresh the token here and get the new token info
	// ......

	return new Promise((res, rej) => {
		const data = {
			token, // the token from the provider
			expires_at, // the timestamp for the expiration
			identity_id, // optional, the identityId for the credentials
		};
		res(data);
	});
}

Auth.configure({
	refreshHandlers: {
		developer: refreshToken,
	},
});
```

##### prefix: `Amplify Rendering A Sign Out Button`

```js
export default withAuthenticator(App, { includeGreetings: true });
```

##### prefix: `Amplify Wrapping Your Component`

```js
import { Authenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native'
...

class AppWithAuth extends Component {
  render(){
    return (
      <div>
      <Authenticator>
        <App />
      </Authenticator>
      </div>
    );
  }
}

export default AppWithAuth;
```

##### prefix: `Amplify Show Your App After Sign-In`

```js
this._validAuthStates = ['signedIn'];
```

##### prefix: `Amplify Federated Identities (Social Sign-In)`

```js
import Expo from 'expo';
import Amplify, { Auth } from 'aws-amplify';
import { Authenticator } from 'aws-amplify-react-native';

export default class App extends React.Component {
	async signIn() {
		const { type, token, expires } =
			await Expo.Facebook.logInWithReadPermissionsAsync(
				'YOUR_FACEBOOK_APP_ID',
				{
					permissions: ['public_profile'],
				}
			);
		if (type === 'success') {
			// sign in with federated identity
			Auth.federatedSignIn(
				'facebook',
				{ token, expires_at: expires },
				{ name: 'USER_NAME' }
			)
				.then((credentials) => {
					console.log('get aws credentials', credentials);
				})
				.catch((e) => {
					console.log(e);
				});
		}
	}

	// ...

	render() {
		return (
			<View style={styles.container}>
				<Authenticator></Authenticator>
				<Button title="FBSignIn" onPress={this.signIn.bind(this)} />
			</View>
		);
	}
}
```

##### prefix: `Amplify Configuring The Hosted Ui`

```js
import Amplify from 'aws-amplify';

const oauth = {
    // Domain name
    domain : 'your-domain-prefix.auth.us-east-1.amazoncognito.com',

    // Authorized scopes
    scope : ['phone', 'email', 'profile', 'openid','aws.cognito.signin.user.admin'],

    // Callback URL
    redirectSignIn : 'http://www.example.com/signin',

    // Sign out URL
    redirectSignOut : 'http://www.example.com/signout',

    // 'code' for Authorization code grant,
    // 'token' for Implicit grant
    responseType: 'code'

    // optional, for Cognito hosted ui specified options
    options: {
        // Indicates if the data collection is enabled to support Cognito advanced security features. By default, this flag is set to true.
        AdvancedSecurityDataCollectionFlag : true
    }
}

Amplify.configure({
    Auth: {
        // other configurations...
        // ....
        oauth: oauth
    },
    // ...
});
```

##### prefix: `Amplify Launching The Hosted Ui`

```js
const config = Auth.configure();
const { domain, redirectSignIn, redirectSignOut, responseType } = config.oauth;

const clientId = config.userPoolWebClientId;
const url =
	'https://' +
	domain +
	'/login?redirect_uri=' +
	redirectSignIn +
	'&response_type=' +
	responseType +
	'&client_id=' +
	clientId;

// Launch hosted UI
window.location.assign(url);
```

##### prefix: `Amplify Launching The Hosted Ui In React`

```js
import { withOAuth } from 'aws-amplify-react';

class MyApp extends React.Component {
	// ...
	render() {
		return <button onClick={this.props.OAuthSignIn}>Sign in with AWS</button>;
	}
}

export default withOAuth(MyApp);
```

##### prefix: `Amplify Enabling Totp`

```js
import { Auth } from 'aws-amplify';

// To setup TOTP, first you need to get a `authorization code` from Amazon Cognito
// `user` is the current Authenticated user
Auth.setupTOTP(user).then((code) => {
	// You can directly display the `code` to the user or convert it to a QR code to be scanned.
	// E.g., use following code sample to render a QR code with `qrcode.react` component:
	//      import QRCode from 'qrcode.react';
	//      const str = "otpauth://totp/AWSCognito:"+ username + "?secret=" + code + "&issuer=" + issuer;
	//      <QRCode value={str}/>
});

// ...

// Then you will have your TOTP account in your TOTP-generating app (like Google Authenticator)
// Use the generated one-time password to verify the setup
Auth.verifyTotpToken(user, challengeAnswer)
	.then(() => {
		// don't forget to set TOTP as the preferred MFA method
		Auth.setPreferredMFA(user, 'TOTP');
		// ...
	})
	.catch((e) => {
		// Token is not verified
	});
```

##### prefix: `Amplify Setup Mfa Type`

```js
import { Auth } from 'aws-amplify';

// You can select preferred mfa type, for example:
// Select TOTP as preferred
Auth.setPreferredMFA(user, 'TOTP')
	.then((data) => {
		console.log(data);
		// ...
	})
	.catch((e) => {});

// Select SMS as preferred
Auth.setPreferredMFA(user, 'SMS');

// Select no-mfa
Auth.setPreferredMFA(user, 'NOMFA');
```

##### prefix: `Amplify Letting User Select Mfa Type`

```js
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import { SelectMFAType } from 'aws-amplify-react';

Amplify.configure(awsmobile);

// Please have at least TWO types
// Please make sure you set it properly according to your Cognito User pool
const MFATypes = {
    SMS: true, // if SMS enabled in your user pool
    TOTP: true, // if TOTP enabled in your user pool
    Optional: true, // if MFA is set to optional in your user pool
}

class App extends Component {
    // ...
    render() {
        return (
            // ...
            <SelectMFAType authData={this.props.authData} MFATypes={MFATypes}>
        )
    }
}

export default withAuthenticator(App, true);
```

##### prefix: `Amplify Switching Authentication Flow Type`

```js
Auth.configure({
	// other configurations...
	// ...
	authenticationFlowType: 'USER_PASSWORD_AUTH',
});
```

##### prefix: `Amplify Creating A Captcha`

```js
export const handler = async (event) => {
	if (!event.request.session || event.request.session.length === 0) {
		event.response.publicChallengeParameters = {
			captchaUrl: 'url/123.jpg',
		};
		event.response.privateChallengeParameters = {
			answer: '5',
		};
		event.response.challengeMetadata = 'CAPTCHA_CHALLENGE';
	}
	return event;
};
```

##### prefix: `Amplify Defining A Custom Challenge`

```js
export const handler = async (event) => {
	if (!event.request.session || event.request.session.length === 0) {
		// If we don't have a session or it is empty then send a CUSTOM_CHALLENGE
		event.response.challengeName = 'CUSTOM_CHALLENGE';
		event.response.failAuthentication = false;
		event.response.issueTokens = false;
	} else if (
		event.request.session.length === 1 &&
		event.request.session[0].challengeResult === true
	) {
		// If we passed the CUSTOM_CHALLENGE then issue token
		event.response.failAuthentication = false;
		event.response.issueTokens = true;
	} else {
		// Something is wrong. Fail authentication
		event.response.failAuthentication = true;
		event.response.issueTokens = false;
	}

	return event;
};
```

##### prefix: `Amplify Defining A Custom Challenge 2`

```js
export const handler = async (event, context) => {
	if (
		event.request.privateChallengeParameters.answer ===
		event.request.challengeAnswer
	) {
		event.response.answerCorrect = true;
	} else {
		event.response.answerCorrect = false;
	}

	return event;
};
```

##### prefix: `Amplify Using A Custom Challenge`

```js
import { Auth } from 'aws-amplify';
let challengeResponse = 'the answer for the challenge';

Auth.signIn(username)
	.then((user) => {
		if (user.challengeName === 'CUSTOM_CHALLENGE') {
			Auth.sendCustomChallengeAnswer(user, challengeResponse)
				.then((user) => console.log(user))
				.catch((err) => console.log(err));
		} else {
			console.log(user);
		}
	})
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Working With User Attributes`

```js
Auth.signUp({
	username: 'jdoe',
	password: 'mysecurerandompassword#123',
	attributes: {
		email: 'me@domain.com',
		phone_number: '+12128601234', // E.164 number convention
		given_name: 'Jane',
		family_name: 'Doe',
		nickname: 'Jane',
	},
});
```

##### prefix: `Amplify Working With User Attributes 2`

```js
let user = await Auth.currentAuthenticatedUser();
```

##### prefix: `Amplify Working With User Attributes 3`

```js
let result = await Auth.updateUserAttributes(user, {
	email: 'me@anotherdomain.com',
	family_name: 'Lastname',
});
console.log(result); // SUCCESS
```

##### prefix: `Amplify Working With User Attributes 4`

```js
let result = await Auth.verifyCurrentUserAttributeSubmit('email', 'abc123');
```

##### prefix: `Amplify Working With Aws Service Objects`

```js
import Route53 from 'aws-sdk/clients/route53';

Auth.currentCredentials().then((credentials) => {
	const route53 = new Route53({
		apiVersion: '2013-04-01',
		credentials: Auth.essentialCredentials(credentials),
	});

	// more code working with route53 object
	// route53.changeResourceRecordSets();
});
```

##### prefix: ``` Amplify Customize `Withauthenticator ``

```js
import React, { Component } from 'react';
import { ConfirmSignIn, ConfirmSignUp, ForgotPassword, SignIn, SignUp, VerifyContact, withAuthenticator } from 'aws-amplify-react';

class App extends Component {
  render() {
    ...
  }
}

// This is my custom Sign in component
class MySignIn extends SignIn {
  render() {
    ...
  }
}

export default withAuthenticator(App, false, [
  <MySignIn/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <SignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>
]);
```

##### prefix: `Amplify Using Modularized Module`

```js
import Auth from '@aws-amplify/auth';

Auth.configure();
```

##### prefix: `Amplify Working With The Api`

```js
import { Cache } from 'aws-amplify';
```

##### prefix: `Amplify Setitem()`

```js
Cache.setItem(key, value, [options]);
```

##### prefix: `Amplify Setitem() 2`

```js
// Standard case
Cache.setItem('key', 'value');

// Set item with priority. Priority should be between 1 and 5.
Cache.setItem('key', 'value', { priority: 3 });

// Set item with an expiration time
const expiration = new Date(2018, 1, 1);
Cache.setItem('key', 'value', { expires: expiration.getTime() });
```

##### prefix: `Amplify Setitem() 3`

```js
Cache.setItem('mothersBirthday', 'July 18th', { priority: 1 });
Cache.setItem('breakfastFoodOrder', 'Pancakes', { priority: 3 });
```

##### prefix: `Amplify Getitem()`

```js
Cache.getItem(key[, options]);
```

##### prefix: `Amplify Getitem() 2`

```js
// Standard case
Cache.getItem('key');

// Get item with callback function.
// The callback function will be called if the item is not in the cache.
// After the callback function returns, the value will be set into cache.
Cache.getItem('key', { callback: callback });
```

##### prefix: `Amplify Removeitem()`

```js
Cache.removeItem(key);
```

##### prefix: `Amplify Clear()`

```js
Cache.clear();
```

##### prefix: `Amplify Getallkeys()`

```js
Cache.getAllKeys();
```

##### prefix: `Amplify Getcachecursize()`

```js
const size = Cache.getCacheCurSize();
```

##### prefix: `Amplify Configure()`

```js
const config = {
	itemMaxSize: 3000, // 3000 bytes
	defaultPriority: 4,
	// ...
};
const myCacheConfig = Cache.configure(config);

// You can modify parameters such as cache size, item default ttl and etc.
// But don't try to modify keyPrefix which is the identifier of Cache.
```

##### prefix: `Amplify Createinstance()`

```js
const config = {
	itemMaxSize: 3000, // 3000 bytes
	storage: window.sessionStorage, // switch to sessionStorage
	// ...
};
const newCache = Cache.createInstance(config);
// Please provide a new keyPrefix which is the identifier of Cache.
```

##### prefix: `Amplify Using Modularized Module`

```js
import Cache from '@aws-amplify/cache';

Cache.configure();
```

##### prefix: `Amplify Installation`

```js
import { Hub } from 'aws-amplify';
```

##### prefix: `Amplify Dispatch()`

```js
Hub.dispatch('auth', { event: 'signIn', data: user }, 'Auth');
```

##### prefix: `Amplify Listen()`

```js
import { Hub, Logger } from 'aws-amplify';

const logger = new Logger('MyClass');

class MyClass {
	constructor() {
		Hub.listen('auth', this, 'MyListener');
	}

	// Default handler for listening events
	onHubCapsule(capsule) {
		const { channel, payload } = capsule;
		if (channel === 'auth') {
			onAuthEvent(payload);
		}
	}
}
```

##### prefix: `Amplify Listening Authentication Events`

```js
import { Hub, Logger } from 'aws-amplify';

const alex = new Logger('Alexander_the_auth_watcher');

alex.onHubCapsule = (capsule) => {
	switch (capsule.payload.event) {
		case 'signIn':
			alex.error('user signed in'); //[ERROR] Alexander_the_auth_watcher - user signed in
			break;
		case 'signUp':
			alex.error('user signed up');
			break;
		case 'signOut':
			alex.error('user signed out');
			break;
		case 'signIn_failure':
			alex.error('user sign in failed');
			break;
	}
};

Hub.listen('auth', alex);
```

##### prefix: `Amplify Installation`

```js
import { I18n } from 'aws-amplify';
```

##### prefix: `Amplify Setlanguage()`

```js
I18n.setLanguage('fr');
```

##### prefix: `Amplify Putvocabularies()`

```js
const dict = {
	fr: {
		'Sign In': 'Se connecter',
		'Sign Up': "S'inscrire",
	},
	es: {
		'Sign In': 'Registrarse',
		'Sign Up': 'Regístrate',
	},
};

I18n.putVocabularies(dict);
```

##### prefix: `Amplify Get()`

```js
I18n.get('Sign In');
```

##### prefix: `Amplify Automated Setup`

```js
import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);
```

##### prefix: `Amplify Manual Setup`

```js
import Amplify from 'aws-amplify';

Amplify.configure({
	Auth: {
		identityPoolId: 'us-east-1:xxx-xxx-xxx-xxx-xxx',
		region: 'us-east-1',
	},
	Interactions: {
		bots: {
			BookTripMOBILEHUB: {
				name: 'BookTripMOBILEHUB',
				alias: '$LATEST',
				region: 'us-east-1',
			},
		},
	},
});
```

##### prefix: `Amplify Working With The Api`

```js
import { Interactions } from 'aws-amplify';
```

##### prefix: `Amplify Send() Method`

```js
import { Interactions } from 'aws-amplify';

let userInput = 'I want to reserve a hotel for tonight';

// Provide a bot name and user input
const response = await Interactions.send('BookTripMOBILEHUB', userInput);

// Log chatbot response
console.log(response.message);
```

##### prefix: `Amplify Oncomplete() Method`

```js
var handleComplete = function (err, confirmation) {
	if (err) {
		alert('bot conversation failed');
		return;
	}
	alert('done: ' + JSON.stringify(confirmation, null, 2));

	return 'Trip booked. Thank you! what would you like to do next?';
};

Interactions.onComplete(botName, handleComplete);
```

##### prefix: `Amplify Using With React`

```js
import React, { Component } from 'react';
import Amplify, { Interactions } from 'aws-amplify';
import { ChatBot, AmplifyTheme } from 'aws-amplify-react';

// Imported default theme can be customized by overloading attributes
const myTheme = {
	...AmplifyTheme,
	sectionHeader: {
		...AmplifyTheme.sectionHeader,
		backgroundColor: '#ff6600',
	},
};

Amplify.configure({
	Auth: {
		// Use your Amazon Cognito Identity Pool Id
		identityPoolId: 'us-east-1:xxx-xxx-xxx-xxx-xxx',
		region: 'us-east-1',
	},
	Interactions: {
		bots: {
			BookTripMOBILEHUB: {
				name: 'BookTripMOBILEHUB',
				alias: '$LATEST',
				region: 'us-east-1',
			},
		},
	},
});

class App extends Component {
	handleComplete(err, confirmation) {
		if (err) {
			alert('Bot conversation failed');
			return;
		}

		alert('Success: ' + JSON.stringify(confirmation, null, 2));
		return 'Trip booked. Thank you! what would you like to do next?';
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to ChatBot Demo</h1>
				</header>
				<ChatBot
					title="My Bot"
					theme={myTheme}
					botName="BookTripMOBILEHUB"
					welcomeMessage="Welcome, how can I help you today?"
					onComplete={this.handleComplete.bind(this)}
					clearOnComplete={true}
				/>
			</div>
		);
	}
}

export default App;
```

##### prefix: `Amplify Using With React Native`

```js
import React from 'react';
import { StyleSheet, Text, SafeAreaView, Alert, StatusBar } from 'react-native';
import Amplify from 'aws-amplify';
import { ChatBot } from 'aws-amplify-react-native';

Amplify.configure({
	Auth: {
		identityPoolId: 'us-east-1:xxx-xxx-xxx-xxx-xxx',
		region: 'us-east-1',
	},
	Interactions: {
		bots: {
			BookTripMOBILEHUB: {
				name: 'BookTripMOBILEHUB',
				alias: '$LATEST',
				region: 'us-east-1',
			},
		},
	},
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: StatusBar.currentHeight,
	},
});

export default class App extends React.Component {
	state = {
		botName: 'BookTripMOBILEHUB',
		welcomeMessage: 'Welcome, what would you like to do today?',
	};

	constructor(props) {
		super(props);
		this.handleComplete = this.handleComplete.bind(this);
	}

	handleComplete(err, confirmation) {
		if (err) {
			Alert.alert('Error', 'Bot conversation failed', [{ text: 'OK' }]);
			return;
		}

		Alert.alert('Done', JSON.stringify(confirmation, null, 2), [
			{ text: 'OK' },
		]);

		this.setState({
			botName: 'BookTripMOBILEHUB',
		});

		return 'Trip booked. Thank you! what would you like to do next?';
	}

	render() {
		const { botName, showChatBot, welcomeMessage } = this.state;

		return (
			<SafeAreaView style={styles.container}>
				<ChatBot
					botName={botName}
					welcomeMessage={welcomeMessage}
					onComplete={this.handleComplete}
					clearOnComplete={false}
					styles={StyleSheet.create({
						itemMe: {
							color: 'red',
						},
					})}
				/>
			</SafeAreaView>
		);
	}
}
```

##### prefix: `Amplify Installation`

```js
import { Logger } from 'aws-amplify';
```

##### prefix: `Amplify Working With The Api`

```js
const logger = new Logger('foo');

logger.info('info bar');
logger.debug('debug bar');
logger.warn('warn bar');
logger.error('error bar');
```

##### prefix: `Amplify Working With The Api 2`

```js
try {
    ...
} catch(e) {
    logger.error('error happened', e);
}
```

##### prefix: `Amplify Setting Logging Levels`

```js
const logger = new Logger('foo', 'INFO');

logger.debug('callback data', data); // this will not write the message
```

##### prefix: `Amplify Setting Logging Levels 2`

```js
Amplify.Logger.LOG_LEVEL = 'DEBUG';

const logger = new Logger('foo', 'INFO');

logger.debug('callback data', data); //  this will write the message since the global log level is 'DEBUG'
```

##### prefix: `Amplify Setting Logging Levels 3`

```js
window.LOG_LEVEL = 'DEBUG';
```

##### prefix: `Amplify Aws Iot`

```js
import Amplify, { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from 'aws-amplify/lib/PubSub/Providers';
```

##### prefix: `Amplify Aws Iot 2`

```js
// Apply plugin with configuration
Amplify.addPluggable(
	new AWSIoTProvider({
		aws_pubsub_region: '<YOUR-AWS-REGION>',
		aws_pubsub_endpoint:
			'wss://xxxxxxxxxxxxx.iot.<YOUR-AWS-REGION>.amazonaws.com/mqtt',
	})
);
```

##### prefix: `Amplify Aws Iot 3`

```js
Auth.currentCredentials().then((info) => {
	const cognitoIdentityId = info._identityId;
});
```

##### prefix: `Amplify Third Party Mqtt Providers`

```js
import { PubSub } from 'aws-amplify';
import { MqttOverWSProvider } from 'aws-amplify/lib/PubSub/Providers';
```

##### prefix: `Amplify Third Party Mqtt Providers 2`

```js
// Apply plugin with configuration
Amplify.addPluggable(
	new MqttOverWSProvider({
		aws_pubsub_endpoint: 'wss://iot.eclipse.org:443/mqtt',
	})
);
```

##### prefix: `Amplify Subscribe To A Topic`

```js
PubSub.subscribe('myTopic').subscribe({
	next: (data) => console.log('Message received', data),
	error: (error) => console.error(error),
	close: () => console.log('Done'),
});
```

##### prefix: `Amplify Subscribe To Multiple Topics`

```js
PubSub.subscribe(['myTopic1', 'myTopic1']).subscribe({
	// ...
});
```

##### prefix: `Amplify Publish To A Topic`

```js
await PubSub.publish('myTopic1', { msg: 'Hello to all subscribers!' });
```

##### prefix: `Amplify Publish To A Topic 2`

```js
await PubSub.publish(['myTopic1', 'myTopic2'], {
	msg: 'Hello to all subscribers!',
});
```

##### prefix: `Amplify Unsubscribe From A Topic`

```js
const sub1 = PubSub.subscribe('myTopicA').subscribe({
	next: (data) => console.log('Message received', data),
	error: (error) => console.error(error),
	close: () => console.log('Done'),
});

sub1.unsubscribe();
// You will no longer get messages for 'myTopicA'
```

##### prefix: `Amplify Using Modularized Module`

```js
import Pubsub from '@aws-amplify/pubsub';

Pubsub.configure();
```

##### prefix: `Amplify Setup For Ios`

```js
$ react-native init myapp
$ cd myapp
$ npm install
$ npm install aws-amplify --save
$ npm install aws-amplify-react-native --save
$ react-native link aws-amplify-react-native
```

##### prefix: `Amplify Configure Your App`

```js
import { PushNotificationIOS } from 'react-native';
import Analytics from '@aws-amplify/analytics';
import PushNotification from '@aws-amplify/pushnotification';

// PushNotification need to work with Analytics
Analytics.configure({
	// You configuration will come here...
});

PushNotification.configure({
	appId: 'XXXXXXXXXXabcdefghij1234567890ab',
});
```

##### prefix: `Amplify Configure Your App 2`

```js
import { PushNotificationIOS } from 'react-native';
import Analytics from '@aws-amplify/analytics';
import PushNotification from '@aws-amplify/pushnotification';
import aws_exports from './aws_exports';

// PushNotification need to work with Analytics
Analytics.configure(aws_exports);

PushNotification.configure(aws_exports);
```

##### prefix: `Amplify Working With The Api`

```js
// get the notification data
PushNotification.onNotification((notification) => {
	// Note that the notification object structure is different from Android and IOS
	console.log('in app notification', notification);

	// required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
	notification.finish(PushNotificationIOS.FetchResult.NoData);
});

// get the registration token
PushNotification.onRegister((token) => {
	console.log('in app registration', token);
});
```

##### prefix: `Amplify Installation`

```js
import { ServiceWorker } from 'aws-amplify';
const myServiceWorker = new ServiceWorker();
```

##### prefix: `Amplify Register()`

```js
// Register the service worker with `service-worker.js` with service worker scope `/`.
myServiceWorker = await this.serviceWorker.register('/service-worker.js', '/');
```

##### prefix: `Amplify Register() 2`

```js
myServiceWorker.enablePush('BLx__NGvdasMNkjd6VYPdzQJVBkb2qafh');
```

##### prefix: `Amplify Handling A Push Notification`

```js
/**
 * Listen for incoming Push events
 */

addEventListener('push', (event) => {
	var data = {};
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	if (!(self.Notification && self.Notification.permission === 'granted'))
		return;

	if (event.data) data = event.data.json();

	// Customize the UI for the message box
	var title = data.title || 'Web Push Notification';
	var message = data.message || 'New Push Notification Received';
	var icon = 'images/notification-icon.png';
	var badge = 'images/notification-badge.png';
	var options = {
		body: message,
		icon: icon,
		badge: badge,
	};

	event.waitUntil(self.registration.showNotification(title, options));
});
```

##### prefix: `Amplify Send()`

```js
myServiceWorker.send({
	message: 'CleanAllCache',
});
```

##### prefix: `Amplify Receiving Messages`

```js
/**
 * The message will receive messages sent from the application.
 * This can be useful for updating a service worker or messaging
 * other clients (browser restrictions currently exist)
 * https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
 */
addEventListener('message', (event) => {
	console.log('[Service Worker] Message Event: ', event.data);
});
```

##### prefix: `Amplify Using Modularized Module`

```js
import { ServiceWorker } from '@aws-amplify/core';
```

##### prefix: `Amplify Automated Setup`

```js
import Amplify, { Storage } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

##### prefix: `Amplify Manual Setup`

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
	},
});
```

##### prefix: `Amplify File Access Levels`

```js
Storage.configure({ level: 'private' });

Storage.get('welcome.png'); // Gets the welcome.png belongs to current user
```

##### prefix: `Amplify File Access Levels 2`

```js
Storage.get('welcome.png', { level: 'public' }); // Gets welcome.png in public space
```

##### prefix: `Amplify File Access Levels 3`

```js
Storage.get('welcome.png'); // Get welcome.png in public space
```

##### prefix: `Amplify File Access Levels 4`

```js
Storage.vault.get('welcome.png'); // Get the welcome.png belonging to current user
```

##### prefix: `Amplify Working With The Api`

```js
import { Storage } from 'aws-amplify';
```

##### prefix: `Amplify Working With The Api 2`

```js
Storage.configure({
    bucket: //Your bucket ARN;
    region: //Specify the region your bucket was created in;
    identityPoolId: //Specify your identityPoolId for Auth and Unauth access to your bucket;
});
```

##### prefix: `Amplify Put`

```js
Storage.put('test.txt', 'Hello')
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Put 2`

```js
Storage.put('test.txt', 'Protected Content', {
	level: 'protected',
	contentType: 'text/plain',
})
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Put 3`

```js
Storage.put('test.txt', 'Private Content', {
	level: 'private',
	contentType: 'text/plain',
})
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Put 4`

```js
class S3ImageUpload extends React.Component {
	onChange(e) {
		const file = e.target.files[0];
		Storage.put('example.png', file, {
			contentType: 'image/png',
		})
			.then((result) => console.log(result))
			.catch((err) => console.log(err));
	}

	render() {
		return (
			<input
				type="file"
				accept="image/png"
				onChange={(e) => this.onChange(e)}
			/>
		);
	}
}
```

##### prefix: `Amplify Put 5`

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

##### prefix: `Amplify Get`

```js
Storage.get('test.txt')
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Get 2`

```js
Storage.get('test.txt', { level: 'protected' })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Get 3`

```js
Storage.get('test.txt', {
	level: 'protected',
	identityId: 'xxxxxxx', // the identityId of that user
})
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Get 4`

```js
Storage.get('test.txt', { level: 'private' })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Get 5`

```js
Storage.get('test.txt', { expires: 60 })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Remove`

```js
Storage.remove('test.txt')
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Remove 2`

```js
Storage.remove('test.txt', { level: 'protected' })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Remove 3`

```js
Storage.remove('test.txt', { level: 'private' })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify List`

```js
Storage.list('photos/')
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify List 2`

```js
Storage.list('photos/', { level: 'protected' })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify List 3`

```js
Storage.list('photos/', {
	level: 'protected',
	identityId: 'xxxxxxx', // the identityId of that user
})
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify List 4`

```js
Storage.list('photos/', { level: 'private' })
	.then((result) => console.log(result))
	.catch((err) => console.log(err));
```

##### prefix: `Amplify Tracking Events`

```js
Storage.configure({ track: true });
```

##### prefix: `Amplify Tracking Events 2`

```js
Storage.get('welcome.png', { track: true });
```

##### prefix: `Amplify Customize Upload Path`

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

##### prefix: `Amplify Using Modularized Module`

```js
import Storage from '@aws-amplify/storage';

Storage.configure();
```
