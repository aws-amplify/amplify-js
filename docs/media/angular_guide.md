---
---

# Angular

AWS Amplify provides Angular Components with `aws-amplify-angular` npm package.

## Installation and Configuration

Install `aws-amplify` and `aws-amplify-angular` npm packages into your Angular app.

```bash
$ npm install --save aws-amplify # or yarn add aws-amplify
$ npm install --save aws-amplify-angular # or yarn add aws-amplify-angular
```

### Setup

To configure your app for AWS Amplify, you need to create a backend configuration with AWS Mobile CLI and import the auto-generated configuration file into your project. 

Following commands will enable Auth category and will create `aws-exports.js` configuration file under your projects `/src` folder. 

```bash
$ npm install -g awsmobile-cli
$ awsmobile init
$ awsmobile user-signin enable
$ awsmobile user-files enable
$ awsmobile push # Update your backend
```

After creating your backend, the configuration file is copied to `/awsmobilejs/#current-backend-info/aws-exports.js`, and the source folder you have identified in the `awmobile init` command.

To import the configuration file to your Angular app, you will need to rename `aws_exports.js` to `aws_exports.ts`. Alternatively, you can create a `yarn start` command in your `package.json`.
```js
"scripts": {
    "start": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng serve; ng serve",
    "build": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng build --prod; ng build --prod"
}
```

Import the configuration file and load it in your `main.ts`, which is the entry point of your Angular application. 

```js
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
Amplify.configure(awsmobile);
```

When working with underlying `aws-js-sdk`, the "node" package should be included in *types* compiler option. Please make sure that you edit `tsconfig.app.json` file in your source file folder, e.g. *src/tsconfig.app.json*.
```json
"compilerOptions": {
    "types" : ["node"]
}
```

NOTE: If you are developing locally (not with npm packages, using a `yarn link`), you will need to modify `.angular-cli.json` :

```js
"defaults": {
    "styleExt": "css",
    "component": {},
    "build": {
        "preserveSymlinks": true
    }
  }
```

## Importing Amplify

In your [root module](https://angular.io/guide/bootstrapping) `src/app/app.module.ts`, you can import Amplify modules as following:

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

NOTE: the service provider is optional. You can import the core categories normally i.e. `import { Analytic } from 'aws-amplify'` or create your own provider. The service provider does some work for you and exposes the categories as methods. The provider also manages and dispatches authentication state changes using observables which you can subscribe to within your components (see below).

## Using Amplify Service

AmplifyService is a provider in your Angular app, and it provides AWS Amplify core categories through dependency injection.

### Using Dependency Injection

To use *AmplifyService* with [dependency injection](https://angular.io/guide/dependency-injection-in-action), inject it into the constructor of any component or service, anywhere in your application.

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

### Using AWS Amplify Categories

You can access and work directly with AWS Amplify Categories via the built-in service provider:

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

You can access all [AWS Amplify Category APIs](https://aws.github.io/aws-amplify/media/developer_guide) with *AmplifyService*. 

### Usage Example: Subscribe to Authentication State Changes

Import AmplifyService into your component and listen for auth state changes:

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

## Using View Components

AWS Amplifies provides components that you can use in your Angular view templates. 

### Authenticator

Authenticator component creates an out-of-the-box signing/sign-up experience for your Angular app. 

Before using this component, please be sure that you have activated [Authentication category](https://aws.github.io/aws-amplify/media/authentication_guide):
```bash
$ awsmobile user-signin enable
```


To use Authenticator, just add the `amplify-authenticator` directive in your .html view:
```html
  ...
  <amplify-authenticator></amplify-authenticator>
  ...
```

### Photo Picker

Photo Picker component will render a file upload control that will allow choosing a local image and uploading it to Amazon S3. Once an image is selected, a base64 encoded image preview will be displayed automatically.

Before using this component, please be sure that you have activated [*user-files* with AWS Mobile CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html):

```bash
$ awsmobile user-files enable
```

To render photo picker in an Angular view, use *amplify-photo-picker* component:

```html
<amplify-photo-picker 
    (picked)="onImagePicked($event)"
    (loaded)="onImageLoaded($event)">
</amplify-photo-picker>
```

The component will emit two events:

 - `(picked)` - Emitted when an image is selected. The event will contain the `File` object which can be used for upload.
 - `(loaded)` - Emitted when an image preview has been rendered and displayed.

**Uploading Image**

Use  `onImagePicked(event)` to upload your photo to S3 using AWS Amplify Storage category:

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
### S3 Album

S3 Album component display a list of images from the connected S3 bucket.

Before using this component, please be sure that you have activated [*user-files* with AWS Mobile CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html):

```bash
$ awsmobile user-files enable
```

To render the album, use *amplify-s3-album* component in your Angular view:

```html
<amplify-s3-album path="pics" (selected)="onAlbumImageSelected($event)">
</amplify-s3-album>
```

`(selected)` event can be used to retrieve the URL of the clicked image on the list:

```js
onAlbumImageSelected( event ) {
      window.open( event, '_blank' );
}
```

### Custom Styles

You can use custom styling for AWS Amplify components. Just import your custom *styles.css* that overrides the default styles which can be found in `/node_modules/aws-amplify-angular/theme.css`.
