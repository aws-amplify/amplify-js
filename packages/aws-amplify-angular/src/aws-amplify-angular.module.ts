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
  AuthenticatorComponent,
  RequireNewPasswordComponent,
  ConfirmSignInComponent,
  SignUpComponent,
  ConfirmSignUpComponent,
  ForgotPasswordComponent,
  GreetingsComponent
} from './components';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponent,
    AuthenticatorComponent,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent
  ],
  providers: [ AmplifyService ],
  exports: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponent,
    AuthenticatorComponent,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent
  ]
})
export class AmplifyAngularModule { }
