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

### Access AWS Amplify Categories

You can access and work directly with Amplify Categories via the built-in service provider (or create your own):

```
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
  	 * this.amplifyService.auth();      	// AWS Amplify Auth
 	 * this.amplifyService.analytics(); 	// AWS Amplify Analytics
 	 * this.amplifyService.storage();   	// AWS Amplify Storage
	 * this.amplifyService.api();       	// AWS Amplify API
	 * this.amplifyService.cache();     	// AWS Amplify Cache
	 * this.amplifyService.pubsub();    	// AWS Amplify PubSub
	 **/
  }
  
}
```

You can access all [AWS Amplify Category APIs](https://aws.github.io/aws-amplify) from the provider.

### Subscribe to authentication state changes

Import the service into your component and listen for auth state changes:

```
  ...
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

## Authenticator Components

#### Add Authenticator to a template

```
  ...
  <amplify-authenticator></amplify-authenticator>
  ...
```

## Storage Components

#### Photo Picker

The `<amplify-photo-picker></amplify-photo-picker>` will display a file upload input that will allow choosing any image for upload to Amzon S3. Once an image is selected, a base64 encoded preview will also be displayed as part of the component. The component will emit two events:

 - `(picked)` - File has been chosen, the event will contain the `File` object which can be used for upload.
 - `(loaded)` - Preview has been loaded and displayed.

```
<amplify-photo-picker 
    (picked)="onImagePicked($event)"
    (loaded)="onImageLoaded($event)"></amplify-photo-picker>
```

`onImagePicked(event)` can then be used to upload your photo to S3 using Storage:

```
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

You can use the album component to list all your photos:

```
<amplify-s3-album 
	path="pics"
	(selected)="onAlbumImageSelected($event)"></amplify-s3-album>
```

`(selected)` can be used to retrieve the URL to the image on Amazon S3 when an image is clicked.

```
onAlbumImageSelected( event ) {
  	window.open( event, '_blank' );
}
```

### Styles

You can use and override a default theme. Within your app, add to your styles.css or components css:

```css
@import "~aws-amplify-angular/theme.css";
```