import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';
// tslint:disable:max-line-length
import { AuthenticatorIonicComponent } from './components/authenticator/authenticator/authenticator.component.ionic';
import { ConfirmSignInComponentIonic } from './components/authenticator/confirm-sign-in-component/confirm-sign-in-component.ionic';
import { ConfirmSignUpComponentIonic } from './components/authenticator/confirm-sign-up-component/confirm-sign-up.component.ionic';
import { ForgotPasswordComponentIonic } from './components/authenticator/forgot-password-component/forgot-password.component.ionic';
import { GreetingComponentIonic } from './components/authenticator/greeting-component/greeting.component.ionic';
import { SignInComponentIonic } from './components/authenticator/sign-in-component/sign-in.component.ionic';
import { SignUpComponentIonic } from './components/authenticator/sign-up-component/sign-up.component.ionic';
import { RequireNewPasswordComponentIonic } from './components/authenticator/require-new-password-component/require-new-password.component.ionic';
import { PhotoPickerIonicComponent } from './components/storage/photo-picker-component/photo-picker.component.ionic';
import { S3AlbumComponentIonic } from './components/storage/s3-album-component/s3-album.component.ionic';
import { S3ImageComponentIonic } from './components/storage/s3-image-component/s3-image.component.ionic';
import { ChatbotComponentIonic } from './components/interactions/chatbot/chatbot.component.ionic';
// tslint:enable:max-line-length

const components = [
  AuthenticatorIonicComponent,
  ConfirmSignInComponentIonic,
  ConfirmSignUpComponentIonic,
  ForgotPasswordComponentIonic,
  GreetingComponentIonic,
  SignInComponentIonic,
  SignUpComponentIonic,
  RequireNewPasswordComponentIonic,
  PhotoPickerIonicComponent,
  S3AlbumComponentIonic,
  S3ImageComponentIonic,
  ChatbotComponentIonic
];

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ...components,
  ],
  entryComponents: [
    ...components
  ],
  providers: [ AmplifyService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    ...components
  ]
})
export class AmplifyIonicModule { }
