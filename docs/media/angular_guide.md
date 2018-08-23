---
---

# Angular

AWS Amplify helps developers to create high-quality Angular apps quickly by handling the heavy lifting of configuring and integrating cloud services behind the scenes. It also provides a powerful high-level API and ready-to-use security best practices.

## Installation

UI Components and service provider available via the [aws-amplify-angular](https://www.npmjs.com/package/aws-amplify-angular) npm module.

Install `aws-amplify` and `aws-amplify-angular` npm packages into your Angular app.

```bash
$ npm install --save aws-amplify 
$ npm install --save aws-amplify-angular 
```

### Setup

Create a backend configuration with the Amplify CLI and import the generated configuration file. 

In this example we will enable Authentication with Amazon Cognito User Pools as well as Amazon S3 Storage. This will create an `aws-exports.js` configuration file under your projects `src` directory. 

Ensure you have <a href="https://github.com/aws-amplify/amplify-cli" target="_blank">installed and configured the Amplify CLI</a>.
{: .callout .callout--info}

```bash
$ amplify init
$ amplify add auth
$ amplify add storage
$ amplify push
```

Visit the [Authentication Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/authentication_guide) and [Storage Guide]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/storage_guide) to learn more about enabling and configuring these categories.
{: .callout .callout--info}

After creating your backend a configuration file will be generated in your configured source directory you identified in the `amplify init` command.

Import the configuration file and load it in `main.ts`: 

```js
import Amplify from 'aws-amplify';
import amplify from './aws-exports';
Amplify.configure(amplify);
```

Depending on your TypeScript version you may need to rename the `aws-exports.js` to `aws-exports.ts` prior to importing it into your app, or enable the `allowJs` <a href="https://www.typescriptlang.org/docs/handbook/compiler-options.html" target="_blank">compiler option</a> in your tsconfig. 
{: .callout .callout--info}

When working with underlying `aws-js-sdk`, the "node" package should be included in *types* compiler option. update your `src/tsconfig.app.json`:
```json
"compilerOptions": {
    "types" : ["node"]
}
```

## Importing the Angular Module

In your [app module](https://angular.io/guide/bootstrapping) `src/app/app.module.ts` import the Amplify Module and Service:

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

## Using Amplify Service

The `AmplifyService` provides AWS Amplify core categories and authentication state through dependency injection and observers.

### Using Dependency Injection

To use *AmplifyService* with [dependency injection](https://angular.io/guide/dependency-injection-in-action), inject it into the constructor of any component or service anywhere in your application.

```js
import { Component } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor( private amplifyService: AmplifyService ) {}

}
```

### Using Categories

You can access Categories via the built-in service provider:

```js
import { Component } from '@angular/core';
import { AmplifyService }  from 'aws-amplify-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  constructor( private amplifyService:AmplifyService ) {
      
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

### Subscribe to Authentication State Changes

Import `AmplifyService` into your component and listen for authentication state changes:

```js
import { Component } from '@angular/core';
import { AmplifyService }  from 'aws-amplify-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
constructor( private amplifyService: AmplifyService ) {
    
    signedIn: boolean;
    user: any;
    greeting: string;

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

## Components

AWS Amplifies provides UI components that you can use in your view templates. 

### Authenticator

The Authenticator component creates an drop-in user authentication experience. Add the `amplify-authenticator` component to your `app.component.html` view:

```html
  <amplify-authenticator></amplify-authenticator>
```

### Photo Picker

The Photo Picker component will render a file upload control that will allow choosing a local image and uploading it to Amazon S3. Once an image is selected, a base64 encoded image preview will be displayed automatically. To render photo picker in an Angular view, use *amplify-photo-picker* component:

```html
<amplify-photo-picker 
    path="pics"
    (picked)="onImagePicked($event)"
    (loaded)="onImageLoaded($event)">
</amplify-photo-picker>
```

 - `(picked)` - Emitted when an image is selected. The event will contain the `File` object which can be used for upload.
 - `(loaded)` - Emitted when an image preview has been rendered and displayed.
 - `path` - An optional S3 image path (prefix).

### Album

The Album component will display a list of images from the configured S3 Storage bucket. Use the *amplify-s3-album* component in your Angular view:

```html
<amplify-s3-album 
    path="pics" 
    (selected)="onAlbumImageSelected($event)">
</amplify-s3-album>
```

- `(selected)` - event used to retrieve the S3 signed URL of the clicked image:

```js
onAlbumImageSelected( event ) {
      window.open( event, '_blank' );
}
```

### Interactions

The `amplify-interactions` component provides you with a drop-in Chat component that supports three properties:

1. `bot`:  The name of the Amazon Lex Chatbot

2. `clearComplete`:  Indicates whether or not the messages should be cleared at the
end of the conversation.

3. `complete`: Dispatched when the conversation is completed.

```html
<amplify-interactions 
    bot="yourBotName" 
    clearComplete="true" 
    (complete)="onBotComplete($event)"></amplify-interactions>
```

See the [Interactions documentation]({%if jekyll.environment == 'production'%}{{site.amplify.docs_baseurl}}{%endif%}/media/interactions_guide) for information on creating a Lex Chatbot.

### Custom Styles

You can use custom styling for components by importing your custom *styles.css* that overrides the <a href="https://github.com/aws-amplify/amplify-js/blob/master/packages/aws-amplify-angular/src/theme.css" target="_blank">default styles</a>.

## Angular 6 Support

Currently, the newest version of Angular (6.x) does not provide the shim for the  `global` object which was provided in previous versions.

Add the following to the top of your `polyfills.ts` file: ```(window as any).global = window;```.

## Ionic 4 Components
The Angular components included in this library can optionally be presented with Ionic-specific styling.  To do so, simply include the ```AmplifyIonicModule``` alongside the ```AmplifyAngularModule```.  Then, pass in ```framework="Ionic"``` into the component.  

Example:

```html
  ...
  <amplify-authenticator framework="Ionic"></amplify-authenticator>
  ...
```

This will cause a ```ComponentFactoryResolver``` to display an Ionic version of the desired component.  You can also bypass the ```ComponentFactoryResolver``` by using the vanilla Angular or Ionic components directly using the ```-core``` or ```-ionic``` suffix.

Example:

```html
  ...
  <amplify-authenticator-ionic></amplify-authenticator-ionic>
  ...
```