---
---

# Angular & Ionic

AWS Amplify helps developers to create high-quality Ionic apps quickly by handling the heavy lifting of configuring and integrating cloud services behind the scenes. It also provides a powerful high-level API and ready-to-use security best practices.

## Installation

AWS Amplify provides Angular Components that you can use with Ionic in [aws-amplify-angular](https://www.npmjs.com/package/aws-amplify-angular) npm package.

Install `aws-amplify` and `aws-amplify-angular` npm packages into your Angular app.

```bash
$ npm install --save aws-amplify
$ npm install --save aws-amplify-angular
$ npm install --save ionic-angular
```

## Setup the AWS Backend

To configure your Ionic app for AWS Amplify, you need to create a backend configuration with Amplify CLI and import the auto-generated configuration file into your project. 

Following commands will enable Auth category and will create `aws-exports.js` configuration file under your projects `/src` folder. 

```bash
$ npm install -g @aws-amplify/cli
$ amplify init
$ amplify add auth
$ amplify add storage
$ amplify push # Updates your backend
```

Please visit [Authentication Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide)  and [Storage Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide) to learn more about enabling these categories.
{: .callout .callout--info}


A configuration file is placed inside your configured source directory. To import the configuration file to your Ionic app, you will need to rename `aws_exports.js` to `aws_exports.ts`. You can setup your `package.json` npm scripts to rename the file for you, so that any configuration changes which result in a new generated `aws_exports.js` file get changed over to the `.ts` extension.

```js	
"scripts": {	
    "start": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng serve; ng serve",	
    "build": "[ -f src/aws-exports.js ] && mv src/aws-exports.js src/aws-exports.ts || ng build --prod; ng build --prod"	
}	
```

## Import and Configure Amplify

Import the configuration file and configure Amplify in your `main.ts` file. 

```js
import Amplify from 'aws-amplify';
import amplify from './aws-exports';
Amplify.configure(amplify);
```

In your [home page component](https://angular.io/guide/bootstrapping) `src/app/app.module.ts`, you can import Amplify modules as following:

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

## Using the AWS Amplify API

AmplifyService is a provider in your Angular app, and it provides AWS Amplify core categories through dependency injection. To use *AmplifyService* with [dependency injection](https://angular.io/guide/dependency-injection-in-action), inject it into the constructor of any component or service, anywhere in your application.

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
       *
       * this.amplifyService.auth();          // AWS Amplify Auth
       * this.amplifyService.analytics();     // AWS Amplify Analytics
       * this.amplifyService.storage();       // AWS Amplify Storage
       * this.amplifyService.api();           // AWS Amplify API
       * this.amplifyService.cache();         // AWS Amplify Cache
       * this.amplifyService.pubsub();        // AWS Amplify PubSub
       * this.amplifyService.interactions();  // AWS Amplify Interactions
       *     
      **/
  }
  
}
```

You can access all [AWS Amplify Category APIs](https://aws-amplify.github.io/amplify-js/media/developer_guide) with *AmplifyService*. 

## Subscribe to Authentication State Changes

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

## Use View Components

AWS Amplifies provides components that you can use in your Angular view templates. 

### Authenticator

Authenticator component creates an out-of-the-box signing/sign-up experience for your Angular app. 

Before using this component, please be sure that you have activated [Authentication category](https://aws-amplify.github.io/amplify-js/media/authentication_guide):
```bash
$ amplify add auth
```


To use Authenticator, just add the `amplify-authenticator` directive in your .html view:
```html
  ...
  <amplify-authenticator framework="Ionic"></amplify-authenticator>
  ...
```

### Photo Picker

Photo Picker component will render a file upload control that will allow choosing a local image and uploading it to Amazon S3. Once an image is selected, a base64 encoded image preview will be displayed automatically.

Before using this component, please be sure that you have activated [*user-files* with Amplify CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html):

```bash
$ amplify add storage
```

To render photo picker in an Angular view, use *amplify-photo-picker* component:

```html
<amplify-photo-picker framework="Ionic"
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

Before using this component, please be sure that you have activated [*user-files* with Amplify CLI](https://docs.aws.amazon.com/aws-mobile/latest/developerguide/aws-mobile-cli-reference.html):

```bash
$ amplify add storage
```

To render the album, use *amplify-s3-album* component in your Angular view:

```html
<amplify-s3-album framework="Ionic" 
    path="pics" (selected)="onAlbumImageSelected($event)">
</amplify-s3-album>
```

`(selected)` event can be used to retrieve the URL of the clicked image on the list:

```js
onAlbumImageSelected( event ) {
      window.open( event, '_blank' );
}
```

### Interactions

The `amplify-interactions` component provides you with a Chatbot user interface. You can pass it three parameters:

1. `bot`:  The name of the Amazon Lex Chatbot

2. `clearComplete`:  A flag indicating whether or not the messages should be cleared at the
end of the conversation.

3. `complete`: A function that is executed when the conversation is completed.

```html
<amplify-interactions bot="yourBotName" clearComplete="true" (complete)="onBotComplete($event)"></amplify-interactions>
```

See the [Interactions documentation]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/interactions_guide) for information on creating an Amazon Lex Chatbot.

### Custom Styles

You can use custom styling for AWS Amplify components. Just import your custom *styles.css* that overrides the default styles which can be found in `/node_modules/aws-amplify-angular/theme.css`.

## Angular 6 Support

Currently, the newest version of Angular (6.x) does not provide the shim for the  `global` object, which was provided in previous versions. Specific AWS Amplify dependencies rely on this shim.  While we evaluate the best path forward to address this issue, you have a couple of options for re-creating the shim in your Angular 6 app to make it compatible with Amplify.

1.  Add the following to your polyfills.ts: `(window as any).global = window;`.

2.  Add the following script to your index.html `<head>` tag:
``` 
    <script>
        if (global === undefined) {
            var global = window;
        }
    </script>
  ```
