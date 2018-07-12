 # Serverless Ionic 4 apps with AWS Amplify
 
In this tutorial, you will learn how to create an Ionic 4 application that connects to a serverless backend via the AWS Amplify Library. The application that we will build is a ‘ToDo List’ app.  

By completing this tutorial, you will be able to; 
- create an Ionic 4 app and start working with the code
- implement AWS Amplify library and manage your app backend
- differentiate AWS services such as Amazon Cognito, Amazon DynamoDB, AWS AppSync and AWS Lambda

Here is the sequence of the tutorial:
- Part I: Create a New Ionic 4 Application
- Part II: Generate and Connect to AWS Services in Ionic 4
- Part III: Enable Authentication in Ionic 4 with Amazon Cognito
- Part IV: Persist Data in Ionic 4 with Amazon DynamoDB and AWS Lambda
- Part V: GraphQL Queries in Ionic 4 with AWS AppSync (coming soon)

## Prerequisites

You need to have a basic understanding of JavaScript/[TypeScript](http://www.typescriptlang.org/), [Node.js](https://nodejs.org/en/about/), and [NPM](https://www.npmjs.com/) to complete this tutorial.

## Source Code

If you would like to get right to the source code, it can be in [Github](https://github.com/aws-samples/aws-amplify-ionic-sample/tree/tutorial-part-1).  
 
# Part I: Create a New Ionic 4 Application

## What is Ionic?

Ionic is a web development framework that allows JavaScript developers to create browser-based applications that run on mobile platforms such as iOS and Android. Ionic applications have the ‘look-and-feel’ of native apps, and also offer the ability (via Apache Cordova plugins) to access mobile OS features such as cameras, contact lists, etc.

Apache Cordova is an open source mobile development platform that runs web code (HTML, CSS, and JavaScript) in a WebView wrapped in a mobile app shell.  Since it is native code, it can be distributed on the app stores just like any other mobile app and presented as an app on mobile platforms.
 
## Install the Ionic CLI and Create the Base Project

The easiest way to create an Ionic 4 application is with the Ionic Command Line Interface (CLI). To install the Ionic CLI, run the following command in your terminal:

```bash
$ npm install -g ionic@rc
```

After installation, navigate to a location where you wish to start your new project and execute:

```bash
$ ionic start fancy-todos tabs --type=angular 
```
Ionic CLI will prompt some questions for you:

```bash
? Integrate your new app with Cordova to target native iOS and Android?
? Install the free Ionic Pro SDK and connect your app?  
```
If you want your application to run as an IOS or Android application as well as a browser-based one, select ‘y’ when asked if you want to integrate with Cordova. You will then be asked if you want to install the Ionic Pro SDK; you can select ‘y’ is you wish, but it is not necessary for this tutorial.

To confirm that you're using the correct version of Ionic, navigate into the project directory and execute 'ionic info'. The Ionic Framework value should be greater than 4.
{: .callout}
 
## Install AWS Amplify

AWS Amplify will enable adding cloud features to our Ionic 4 app like authentication and user storage. 

```bash
$ npm install aws-amplify 
$ npm install aws-amplify-angular
```

## Angular Modules in Ionic

Previous versions of Ionic made use of the Angular framework, and Ionic 4 is no exception. Modern versions of Angular provide a component-based architecture in which the application is broken up into units called components, which are in turn executed in the context of a module. 

Each component typically consists of an HTML template, a module file, a component file, an SCSS (SASS stylesheet) file and a SPEC file used for testing. This form of architecture encourages developers to write code that is relatively easy to understand, extend and debug.

In the ‘tabs’ ionic starter that you've created, each of the three tabs is defined by its own module, which in turn consists of one component each.
 
![A sample view of module](TBD)

If your application grows much larger, you can refactor it into multiple components per page. For example, in this tutorial, you will be adding a component to one of the modules which define the behavior and appearance of a modal dialog for adding and editing items.
 
##  Create the ToDo model and UI

In this section, you will replace the ‘About’ component that comes with the Ionic starter project with a ‘List’ component that holds the ToDo items created by the user.   The component you will create allows users to create or edit individual ToDo items with a modal. The user will also be able to delete items and mark items as complete by interacting with an item in the list.

### Define the data model

First, create a new directory under *src/app* called `classes`.  Then copy the following code into a new file *src/app/classes/item.class.ts*, this will define the model for the ToDo list item. 

The base Ionic project uses TypeScript, which will later be compiled into JavaScript. 
{:  .callout .callout--info}

```js
import { v4 as uuid } from 'uuid';

export class ToDoList {
  userId: any;
  items: Array<ToDoItem>

  constructor(params){
    this.items = params.items || [];
    this.userId = params.userId;
  }
}

export class ToDoItem {
  id: string;
  title: string;
  description: string;
  status: any;
  
  constructor(params){
    this.id = uuid();
    this.title = params.title;
    this.description = params.description;
    this.status = 'new';
  }
}
```
This file defines the data model for *ToDoList* and *ToDoItem*.  The list is a list of items, and each item has an ID, title, and completed flag. 

### Create a list component

Create a new file as your list component under *src/app/pages/list/list.page.ts*. This file will define the functionality of the list component. 

```js
import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { AmplifyService } from 'aws-amplify-angular'
import { ToDoItem, ToDoList } from '../../classes/item.class';

@Component({
  selector: 'app-list-page',
  templateUrl: 'list.page.html'
})
export class ListPage implements OnInit {

  amplifyService: AmplifyService;
  modal: any;
  data: any;
  user: any;
  itemList: ToDoList|any;
  signedIn: boolean;

  constructor(
    public modalController: ModalController,
    amplify: AmplifyService,
    events: Events

  ) {
    this.amplifyService = amplify;
    // Listen for changes to the AuthState in order to change item list appropriately
    events.subscribe('data:AuthState', async (data) => {
      if (data.user){
        this.user = await this.amplifyService.auth().currentUserInfo();
        this.getItems();
      } else {
        this.itemList = [];
        this.user = null;
      }
    })
  }

  async ngOnInit(){
    // Use AWS Amplify to get user data when creating items
    this.user = await this.amplifyService.auth().currentUserInfo();
    this.getItems();
  }

  async modify(item, i) {
    let props = {
      itemList: this.itemList,
      /*
        We pass in an item parameter only when the user clicks on an existing item and therefore populate an editItem value so that our modal knows this is an edit operation.
      */
      editItem: item || undefined
    };

      // Define the modal
      this.modal = await this.modalController.create({
        component: ListItemModal,
        componentProps: props
      });

    // Listen for the modal to be closed...
    this.modal.onDidDismiss((result) => {
      if (result.data.newItem){
        // ...and add a new item if modal passes back newItem
        result.data.itemList.items.push(result.data.newItem)
      } else if (result.data.editItem){
        // ...or splice the items array if the modal passes back editItem
        result.data.itemList.items[i] = result.data.editItem
      }
      this.save(result.data.itemList);
    })
    return this.modal.present()
  }

  delete(i){
    this.itemList.items.splice(i, 1);
    this.save(this.itemList);
  }

  complete(i){
    this.itemList.items[i].status = "complete";
    this.save(this.itemList);
  }

  save(list){
    // Use AWS Amplify to save the list...
    this.amplifyService.api().post('ToDoItemsCRUD', '/ToDoItems', {body: list}).then((i) => {
      // ... and to get the list after we save it.
      this.getItems()
    })
    .catch((err) => {
      console.log(`Error saving list: ${err}`)
    })
  }

  getItems(){
    if (this.user){
      // Use AWS Amplify to get the list
      this.amplifyService.api().get('ToDoItemsCRUD', `/ToDoItems/${this.user.id}`, {}).then((res) => {
        if (res && res.length > 0){
          this.itemList = res[0];
        } else {
          this.itemList = new ToDoList({userId: this.user.id, items: []});
        }
      })
      .catch((err) => {
        console.log(`Error getting list: ${err}`)
      })
    } else {
      console.log('Cannot get items: no active user')
    }
  }
}
```

** List component view **

The list component will list the todo items, so we need the related UI for that. Create the file */src/app/pages/list/list.page.html* with the following HTML markup:

```html
<ion-header>
  <ion-toolbar>
    <ion-title *ngIf="user">
      {{user.username + '\'s list' }}
    </ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="modify(null, null)">Add Item</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content *ngIf="itemList">
    <ion-card *ngFor="let item of itemList.items; index as i">
      <ion-card-title class="hover card-title" (click)="modify(item, i)">{{item.title}}</ion-card-title>
      <ion-card-content>{{item.description}}</ion-card-content>
      <ion-card-subtitle>
          <ion-buttons slot="end">
              <ion-button (click)="delete(i)">
                  <ion-icon name="trash" size="small"></ion-icon>Delete</ion-button>
              <ion-button (click)="complete(i)">
                  <ion-icon name="checkmark-circle"  size="small" [ngClass]="{'complete': item.status=='complete'}"></ion-icon>Mark Complete
              </ion-button>
            </ion-buttons>
      </ion-card-subtitle>
    </ion-card>
</ion-content>
```

**  List Component styling **

A little bit of styling in src/app/pages/list/list.page.scss:

```css
.hover {
  cursor: pointer;
}
.complete {
  color: green;
}
.card-title {
  margin: 12px 0 0 12px !important;
}
```
### Create module definition

Make sure that the module you have created previously is aware of your new component by creating a module definition file in *src/app/pages/list/list.module.ts* location:

```js
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// Importing our components
import { ListPage } from './list.page';
import { ListItemModal } from './list.item.modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    FormsModule
  ],
  declarations: [
   // Importing our components
    ListPage
  ],
  entryComponents: [
    ListPage
  ],
  providers: []
})
export class ListModule {}
```
### Add your route

Add a path for your list module in by adding the ‘list’ route definition under *path > children*.  This allows your users to navigate to your list component.

**In *src/app/pages/tabs/tabs.router.module* file**

Import the components:
``js
import { ListPage } from '../list/list.page';
import { AuthGuardService } from '../../services/auth-route-guard'
``

Add the path configuration:
```js
//...
       {
         path: 'list',
         outlet: 'list',
         component: ListPage,
         canActivate: [AuthGuardService]
       }
//...
```

### Add a new tab

Modify the HTML page *src/app/pages/tabs/tabs.page.html* by adding a new 'List' tab under `<ion-tabs>` with the following code. This will create a new tab to display your list page.

```html
<ion-tab label="List" icon="information-circle" href="/tabs/(list:list)">
   <ion-router-outlet name="list"></ion-router-outlet>
 </ion-tab>
```

### Add an authorization service

The *List* tab will only be shown to signed in users, so we need a logic to control its behavior. This is where *services* comes in. Create a file under *src/app/services/auth-route-guard.ts* that will have the service code:

```js
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Events } from '@ionic/angular'

@Injectable()
export class AuthGuardService implements CanActivate {

  signedIn: boolean = false;

  constructor(public router: Router, public events: Events) {
    this.events.subscribe('data:AuthState', async (data) => {
      if (data.loggedIn){
        this.signedIn = true;
      } else {
        this.signedIn =false
      }
    })
  }
  
  canActivate() {
    return this.signedIn;
  }
}
```

You’ll note that your app doesn’t currently provide a way for users to login or signup. We will address later by integration authentication with AWS Amplify, but for now, let's simulate an authentication logic using Ionic’s ‘Events’ service:

Replace *src/app/pages/home/home.page.ts* with the following code to declare our temporary auth logic:

```js
import { Component, AfterContentInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { AuthGuardService } from '../../services/auth-route-guard'
import { AmplifyService }  from 'aws-amplify-angular';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterContentInit{

  authState: any;
  // including AuthGuardService here so that it's available to listen to auth events
  authService: AuthGuardService
  amplifyService: AmplifyService

  constructor(
    public events: Events,
    public guard: AuthGuardService,
    public amplify: AmplifyService
  ) {
    this.authState = {loggedIn: false};
    this.authService = guard;
    this.amplifyService = amplify;
    this.amplifyService.authStateChange$
    .subscribe(authState => {
      this.authState.loggedIn = authState.state === 'signedIn';
      this.events.publish('data:AuthState', this.authState)
    });
  }

  ngAfterContentInit(){
    this.events.publish('data:AuthState', this.authState)
  }
}
```

### Add buttons to the homepage

To trigger user authorization, we will need action buttons. Add the following code to *src/app/pages/home/home.page.html* to render buttons in the homepage:

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Login</ion-title>
  </ion-toolbar>
</ion-header>
<ion-content padding>
  <ion-button (click)="login()">Login!</ion-button>
  <ion-button (click)="logout()">Logout!</ion-button>
  Logged In? {{authState.loggedIn}}
</ion-content>
```

### Add auth service to tabs module

The tabs module will use our custom authorization module `AuthGuardService` to control the user interface. 

**In *src/app/pages/tabs/tabs.module.ts* file:**

import `AuthGuardService` :
```js
 import { AuthGuardService } from '../../services/auth-route-guard'
...

And add *AuthGuardService* as a provider in module definition:
```js

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    HomePageModule,
    AboutPageModule,
    ContactPageModule
  ],
declarations: [TabsPage],
providers: [AuthGuardService]
})
```

## Run and test your app

Now we are ready to test our app. Execute one of the following commands from your project root and you should see our app, with the ‘List’ tab visible in the footer.

To run your app in web browser :
```bash
$ ionic serve
```

To run your app in iOS simulator:
```bash
$ ionic cordova run ios -l
```

## Implementing CRUD functionality

Our app at this stage is stale, so let's add some functionality! To add and edit to do items, we will utilize a modal control.  
 
### Create a modal

To create a modal, we need to implement a component  and a view for the component. 

First, create the file *src/app/pages/list/list.item.modal.ts* with the following code:

```js
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToDoItem, ToDoList } from '../../classes/item.class';

@Component({
  selector: 'item-modal',
  templateUrl: 'list.item.modal.html',
})
export class ListItemModal implements OnInit {

  itemList: ToDoList;
  editItem: ToDoItem;
  user: string;
  item: ToDoItem;
  
  constructor(private modalController: ModalController) {}

  ngOnInit(){
    /* 
      If we pass in an 'editItem' property, then we create a copy to store changes to the existing item
      so that the original is not modified unless the user saves.
    */
    this.item = this.editItem ? Object.assign({}, this.editItem) : new ToDoItem({})
  }

  save() {
    this.modalController.dismiss({
      itemList: this.itemList,
      /* 
        We pass back either a newItem or editItem value depending on whether an edit operation is taking place
        so that the list module can decide whether to insert into the items array or splice into it.
      */
      newItem: !this.editItem ? this.item : null,
      editItem: this.editItem ? this.item : null
    });
  };

  cancel(){
    this.modalController.dismiss({itemList: this.itemList})
  }
}
```
 
And then create the view file for the modal *src/app/pages/list/list.item.modal.html*:

```html
<ion-header>
    <ion-toolbar>
      <ion-title>{{editItem ? 'Edit' : 'Create'}} Item</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-list lines="true">
      <ion-item>
        <ion-label color="primary">ToDo Title </ion-label>
        <ion-input placeholder="title" [(ngModel)]="item.title"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label color="primary">ToDo Description </ion-label>
        <ion-input placeholder="description" [(ngModel)]="item.description"></ion-input>
      </ion-item>
    </ion-list>
  </ion-content>
  <ion-footer>
    <ion-button class="save-btn" (click)="save()">Save</ion-button>
    <ion-button class="dismiss-btn" (click)="cancel()">Cancel</ion-button>
  </ion-footer>
```

### Define modal in our list module

To define our modal controller, add following code to */src/app/pages/list/list.module.ts*:

Import ListItemModal:
```js
import { ListItemModal } from ‘./list.item.modal’;
```

Also, add `ListItemModal` in *declarations* and *entryComponents*;

```js
//...
 declarations: [
 	ListPage,
 	ListItemModal
 ],
 entryComponents: [
 	ListPage,
	ListItemModal
 ]
//...
```

### Import the modal in your list page 

To use your new modal in your list component, make the following changes in * src/app/pages/list/list.page.ts* file.

import the modal into your component: 
```js
import { ListItemModal } from './list.item.modal';
```

### Test CRUD functionality

Now, run the app and check out the List page (as a logged-in user). Users should now be able to:
1.    Create new items
2.    Edit existing items by clicking a title
3.    Mark items complete
4.    Delete items
 
You’ve just created an Ionic 4 and Angular 6 project using the Ionic CLI!

In the next step, you will be cloud-enabling your application using AWS.

# Part 2: Working with AWS Mobile CLI

The AWS Mobile CLI is a tool that allows you to generate AWS resources and connect them to your application quickly. 

## Install AWS Mobile CLI

To install the CLI, execute:
```bash
$ npm install -g awsmobile-cli
```

##  Configuring the CLI with IAM user 

The CLI can create and provision AWS resources for you. To enable this, you need to configure the CLI with an IAM user along with their *Access Key ID* and *Secret Access Key*.

** Creating a new IAM user in AWS Console **

Navigate to the AWS Console and select *Services → IAM → Users*, and then click the “Add User” button. Name the user ‘AWSAmplifyTutorial’ and select ‘Programmatic Access’ as the Access Type. On the next screen, use the ‘Attach existing policies directly’ option to select ‘AdministratorAccess’ permissions. Click ‘Create User’ on the next screen and save the *Access Key ID* and *Secret Access Key* that are displayed. You will not be able to view the Secret Access Key after this point!

Be sure that you save the Access Key ID and Secret Access Key in a secure place (and do NOT check it into Github or any public repository).

** Configure the CLI **

Finally, use your terminal to execute:
```bash
$ awsmobile configure
```
Follow the prompts to enter your Access Key ID, Secret Access Key, and Region.

Your AWS Mobile CLI is now ready for use!

## Creating AWS Resources with the CLI

Run the following command from your project folder:
```bash
$ awsmobile init
```
 
You should now see the *awsmobilejs* directory in your project root, as well as an aws-exports.js file in your */src* directory. The aws-exports file stores all of your project’s AWS related resource configuration. Again, do NOT check in the awsmobilejs directory or aws-exports file into source control.

AWS resources for your application can be generated using:
```bash
awsmobile <feature> enable
```
Alternatively, you can execute the following command to select from a list of available features:
```bash
awsmobile features
```

# Part 3: Adding Analytics to your Ionic App

In this part of the tutorial, you will be adding analytics to your application with Amazon Pinpoint.

To enable analytics, run the following command:
```bash
awsmobile analytics enable
```

Then, to create these resources in your AWS account, execute:
 ```bash
awsmobile push
```
Be patient while the CLI creates your backend resources. Once the creation of your resources is complete, you can view them via the [AWS Mobile Hub console](https://console.aws.amazon.com/mobilehub/home#/).

Your application has now an analytics backend ready! The next step is adding the AWS Amplify library into your Ionic app.
 
## Adding Amplify to your Ionic app

The AWS Amplify library provides a mechanism for your front-end application to interact with AWS cloud resources without you having to do the laborious work of configuring resources and coding for integration. 

AWS Amplify analytics category work with Amazon Pinpoint, a service that allows you to collect data about user actions in your app and create targeted campaigns.  

To add Pinpoint analytics to your application, first, you need to import AWS Amplify library and the configuration file into your app. 

Open *src/main.ts* and make the following changes, which will use the *aws-exports.js* config file that the AWS Mobile CLI created in your application directory.

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```

That’s it! No additional code is needed. Your application will now collect and send a default set of analytics data to Amazon Pinpoint, and you can add your custom tracking metrics as needed. If you look in your browser’s network traffic, you should see the application making requests to Amazon Pinpoint.

Since your application doesn’t have much functionality at the moment,  only application launch events are reported. Don't worry, as you add more functionality to your app like authorization and storage, AWS Amplify automatically reports related analytics events.

You’ve just given your application the ability to interact with an AWS resource. In the following section, you will add authentication to your application.

# Part 3: Enable user signin for your Ionic app

Now, you will create a signin/signup flow for your Ionic app. AWS Amplify makes this process very simple with Authentication category.

AWS Amplify's Authentication category works with Amazon Cognito. 
 
**What is Amazon Cognito?**

Amazon Cognito is a cloud-based authentication service that helps you manage user access to your applications. The AWS Mobile CLI and AWS-Amplify further help you in authentication by creating and connecting to these resources.

To enable authentication for your application, first execute the following command:
```bash
awsmobile user-signin enable
```
 
And then, run:
```bash
awsmobile push
```
 
## Enable auth in your home module

Now you need to make the AWS Amplify authentication components available to your application. 

To enable authentication in the homepage, modify *src/app/pages/home/home.module.ts* so that it looks like this:

```js
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { AmplifyAngularModule, AmplifyIonicModule, AmplifyService } from 'aws-amplify-angular'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AmplifyAngularModule,
    AmplifyIonicModule,
    RouterModule.forChild([{ path: '', component: HomePage }])
  ],
  declarations: [HomePage],
  providers: [AmplifyService]
})
export class HomePageModule {}
```

You application’s home component now has access to the AmplifyAngularModule, AmpifyService, and AmplifyIonicModule (more on that in a moment).

## Using auth UI components

Now you can use authentication UI components that AWS Amplify provides for Angular. UI components render a pre-built signin and signout UI for your app, saving you time when building an auth experience.

In Part 1, we have placed dummy authentication buttons in the home component. To replace these with the real thing, open *src/app/pages/home/home.page.html* and replace our login/logout buttons with the following code:

```html
<ion-content padding>
	<amplify-authenticator framework="ionic"></amplify-authenticator>
</ion-content>
```

This component will render a number of UI elements and related functionality for user signup, signin, recovering passwords and multi-factor authentication. 

## Customize UI components

In order to change the look and feel of your UI component, update *src/global.scss* file with the following to make sure that the authenticator component (and others) are styled appropriately:

@import “./node_modules/aws-amplify-angular/theme.scss”
Finally, open src/app/pages/home/home.page.ts and modify it so that it looks like this:
<<GIST>>
This replaces the faked login and logout functions with a subscription to the AWS Amplify auth state listener, which uses Ionic Events to notify the rest of the appy when a user signs in or out.
Now run either…
  — Serve the app in a web browser — 
or…
  — Serve the app in an iOS emulator — 
Once your application loads, click on the ‘Home’ tab, and you should see login/signup controls that use ionic-specific buttons and input fields.
 
To test whether or not the components are displaying correctly, go back to src/app/pages/home/home.page.html and change…
<amplify-authenticator framework="ionic">
to…
<amplify-authenticator></amplify-authenticator>
After the application reloads, the login controls should look like a more standard set of html elements.
 
What just happened?
The AmplifyAngular module uses a component resolver that checks for whether or not it is receiving a framework value that is equal to ionic. If so, it displays the ionic-version of the component. If not, it displays the standard Angular verision. Since Ionic 4 can use Angular, you can mix and match the Angular and Ionic components as you see fit.
If you don’t want to use the Ionic versions of the component, you do not need to import the AmplifyIonicModule.
Your users should now be able to sign-up for access to the application and subsequently sign-in. By default, the will be required to use multi-factor authentication in the form of an SMS message the provides them with a code. This can changed by configuring your Amazon Cognito Userpool. (Be sure to enter phone numbers in the format of +<country-code><area-code><phone-number>.)
Conclusion: Your app now authenticates users with Amazon Cognito, allowing you to control access to data and to access information about the user. In the next part of the tutorial you’ll learn how to persist data with Amazon DynamoDB and AWS Lambda.






