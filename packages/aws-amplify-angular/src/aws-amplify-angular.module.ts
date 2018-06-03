import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';

import {
  PhotoPickerComponent,
  S3ImageComponent,
  S3AlbumComponent
} from './components/storage';
import {
  AuthenticatorComponentCore,
  RequireNewPasswordComponent,
  GreetingsComponent,
  FormComponent,
  AuthenticatorComponent,
  AuthClass,
  AuthenticatorIonicComponent,

  ConfirmSignInComponent,
  ConfirmSignInComponentCore,
  ConfirmSignInComponentIonic,

  ConfirmSignUpComponent,
  ConfirmSignUpComponentCore,
  ConfirmSignUpComponentIonic,

  SignUpComponent,
  SignUpComponentCore,
  SignUpComponentIonic,

  SignInComponent,
  SignInComponentCore,
  SignInComponentIonic,

  ForgotPasswordComponent,
  ForgotPasswordComponentCore,
  ForgotPasswordComponentIonic

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
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    FormComponent,
    DynamicComponentDirective,
    AuthenticatorComponent,
    AuthenticatorIonicComponent,
    SignInComponentIonic,
    SignUpComponentIonic,
    SignUpComponentCore,
    ConfirmSignUpComponentCore,
    ConfirmSignUpComponentIonic,
    ForgotPasswordComponent,
    ForgotPasswordComponentCore,
    ForgotPasswordComponentIonic,
    ConfirmSignInComponent,
    ConfirmSignInComponentCore,
    ConfirmSignInComponentIonic,
  ],
  entryComponents: [
    AuthenticatorComponentCore,
    AuthenticatorIonicComponent,
    SignInComponentIonic,
    SignUpComponentIonic,
    SignUpComponentCore,
    ConfirmSignUpComponent,
    ConfirmSignUpComponentCore,
    ConfirmSignUpComponentIonic,
    SignUpComponent,
    ForgotPasswordComponent,
    ForgotPasswordComponentCore,
    ForgotPasswordComponentIonic,
    ConfirmSignInComponent,
    ConfirmSignInComponentCore,
    ConfirmSignInComponentIonic,
  ],
  providers: [ AmplifyService ],
  exports: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponentCore,
    AuthenticatorComponentCore,
    RequireNewPasswordComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    AuthenticatorComponent,
    DynamicComponentDirective,
    AuthenticatorIonicComponent,
    SignInComponentIonic,
    ConfirmSignUpComponent,
    ConfirmSignUpComponentCore,
    ConfirmSignUpComponentIonic,

    SignUpComponent,
    SignUpComponentIonic,

    ConfirmSignInComponent,
    ConfirmSignInComponentCore,
    ConfirmSignInComponentIonic,

    ForgotPasswordComponent,
    ForgotPasswordComponentCore,
    ForgotPasswordComponentIonic
  ]
})
export class AmplifyAngularModule { }
