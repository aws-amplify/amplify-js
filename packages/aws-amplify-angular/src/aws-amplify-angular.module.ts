import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';

import {
  PhotoPickerComponent,
  S3ImageComponent,
  S3AlbumComponent
} from './components/storage';
import {
  SignInComponent,
  AuthenticatorComponentCore,
  RequireNewPasswordComponent,
  ConfirmSignInComponent,
  SignUpComponent,
  ConfirmSignUpComponent,
  ForgotPasswordComponent,
  GreetingsComponent,
  FormComponent,
  AuthenticatorComponent,
  AuthInterface,
  AuthenticatorIonicComponent
} from './components';

import { DynamicComponentDirective }          from './directives/dynamic.component.directive';


import {IonicModule } from 'ionic-angular';



@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponent,
    AuthenticatorComponentCore,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    FormComponent,
    DynamicComponentDirective,
    AuthenticatorComponent,
    AuthenticatorIonicComponent
  ],
  entryComponents: [
    AuthenticatorComponentCore,
    AuthenticatorIonicComponent
  ],
  providers: [ AmplifyService ],
  exports: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponent,
    AuthenticatorComponentCore,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    AuthenticatorComponent,
    DynamicComponentDirective,
    AuthenticatorIonicComponent
  ]
})
export class AmplifyAngularModule { }
