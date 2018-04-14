# aws-amplify-angular
AWS Amplify Angular Components

## Getting Started

Prepare for integrate with AWS Amplify Angular has three steps: install, configure, and import

### Install package

```
npm install --save-dev aws-amplify
npm install --save-dev aws-amplify-angular
```

### Configure library

Get `aws_exports.js`, then modify `src/app/main/ts`

```
import Amplify from 'aws-amplify';
import aws_exports from '../aws-exports';

Amplify.configure(aws_exports);
```

Note: When working with `aws-sdk`, node types need to be declared in `src/tsconfig.app.json`. Modify this compiler option:

```
    "types": ["node"]
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

```
  this.amplifyService.auth();      // AWS Amplify Auth
  this.amplifyService.analytics(); // AWS Amplify Analytics
  this.amplifyService.storage();   // AWS Amplify Storage
  this.amplifyService.api();       // AWS Amplify API
```


### Subscribe auth state change.

```
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
```

## Authenticator

### Add Authenticator to a template

```
  ...
  <amplify-authenticator></amplify-authenticator>
  ...
```

### UI Theme

You may change AWS Amplify UI through theme.

For example,

```
import { AmplifyTheme } from 'aws-amplify-angular'

export class HomePage {
  ...
  theme: any = AmplifyTheme;

  constructor(...) {
    ...
    this.theme.form.errorMessage['background-color'] = 'orangered';
  }
  ...
}
```
