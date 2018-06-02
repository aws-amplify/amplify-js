import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';

import {
  PhotoPickerComponent,
  S3ImageComponent,
  S3AlbumComponent
} from './components/storage';
import {
  SignInComponentCore,
  SignInComponentIonic,
  AuthenticatorComponentCore,
  RequireNewPasswordComponent,
  ConfirmSignInComponent,
  SignUpComponent,
  
  ConfirmSignUpComponent,
  ForgotPasswordComponent,
  GreetingsComponent,
  FormComponent,
  AuthenticatorComponent,
  AuthClass,
  AuthenticatorIonicComponent,

  SignUpComponentIonic

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
    SignInComponentCore,
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
    AuthenticatorIonicComponent,
    SignInComponentIonic,
    SignUpComponentIonic
  ],
  entryComponents: [
    AuthenticatorComponentCore,
    AuthenticatorIonicComponent,
    SignInComponentIonic,

    SignUpComponentIonic
  ],
  providers: [ AmplifyService ],
  exports: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponentCore,
    AuthenticatorComponentCore,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    AuthenticatorComponent,
    DynamicComponentDirective,
    AuthenticatorIonicComponent,
    SignInComponentIonic,

    SignUpComponentIonic
  ]
})
export class AmplifyAngularModule { }
