# aws-amplify-angular
AWS Amplify Angular Components

## Getting Started

Install `aws-amplify` and `aws-amplify-angular` into your angular app, then configure the Amplify library. You then have access to a provider that provides authentication state and several UI components.

### Install package

```bash
$ yarn add aws-amplify
$ yarn add aws-amplify-angular
```

### Configure library

Retrieve your `aws_exports.js`, (see [awsmobile-cli](https://github.com/aws/awsmobile-cli)).

NOTE: You will need to rename `aws_exports.js` with a `.ts` extension, or you can use the following for a `yarn start` command:

```js
// package.json
  "start": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng serve; ng serve",
  "build": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng build --prod; ng build --prod"
```

Modify your apps `src/app/main/ts`:

```
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
Amplify.configure(aws_exports);
```

Note: When working with `aws-sdk`, node types need to be declared in `src/tsconfig.app.json`. Modify this compiler option:

NOTE: make sure you change your src/tsconfig.app.json **not the root tsconfig.app.json**:

```
    "types": ["node"]
```

If you are developing locally using a `yarn link` you will need to modify your projects `.angular-cli.json`:

```js
"defaults": {
    "styleExt": "css",
    "component": {},
    "build": {
        "preserveSymlinks": true
    }
  }
```

### Import module

Modify `src/app/app.module.ts`

```
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

## AmplifyService

AmplifyService is a provider in Angular app, provides AWS Amplify core functions through dependency injection.

### Inject to a page

```
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

### Get AWS Amplify Functionalities

You can access and work directly with Amplify Categories via the provider:

```
  this.amplifyService.auth();      // AWS Amplify Auth
  this.amplifyService.analytics(); // AWS Amplify Analytics
  this.amplifyService.storage();   // AWS Amplify Storage
  this.amplifyService.api();       // AWS Amplify API
  this.amplifyService.cache();     // AWS Amplify Cache
  this.amplifyService.pubsub();    // AWS Amplify PubSub 
```

You can access all [AWS Amplify Category APIs](https://aws.github.io/aws-amplify) from the provider.

### Subscribe to authentication state changes:

Import the service into your component and listen for auth state changes:

```
  ...
  constructor(public amplifyService: AmplifyService) {
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

## Authenticator Components

### Add Authenticator to a template

```
  ...
  <amplify-authenticator></amplify-authenticator>
  ...
```

## Storage Components

### Styles

You can override the default styling with css.

For example,

```css

  .amplify-authenticator {
    width: 300px !important;
    padding: 0px !important;
  }

```
