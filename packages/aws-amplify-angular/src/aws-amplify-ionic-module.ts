import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';
import { AuthenticatorIonicComponent } from './ionic/authenticator.component.ionic';
import { ConfirmSignInComponentIonic } from './ionic/confirm-sign-in-component.ionic';
import { ConfirmSignUpComponentIonic } from './ionic/confirm-sign-up.component.ionic';
import { ForgotPasswordComponentIonic } from './ionic/forgot-password.component.ionic';
import { GreetingComponentIonic } from './ionic/greeting.component.ionic';
import { SignInComponentIonic } from './ionic/sign-in.component.ionic';
import { SignUpComponentIonic } from './ionic/sign-up.component.ionic';
import { RequireNewPasswordComponentIonic } from './ionic/require-new-password.component.ionic';
import { PhotoPickerIonicComponent } from './ionic/photo-picker.component.ionic';
import { S3AlbumComponentIonic } from './ionic/s3-album.component.ionic';
import { S3ImageComponentIonic } from './ionic/s3-image.component.ionic';
import { ChatbotComponentIonic } from './ionic/chatbot.component.ionic';


import { IonicModule } from '@ionic/angular';

const exportables = [
  AuthenticatorIonicComponent,
  ConfirmSignInComponentIonic,
  ConfirmSignUpComponentIonic,
  ForgotPasswordComponentIonic,
  GreetingComponentIonic,
  PhotoPickerIonicComponent,
  S3AlbumComponentIonic,
  S3ImageComponentIonic,
  SignInComponentIonic,
  SignUpComponentIonic,
  ChatbotComponentIonic,
  RequireNewPasswordComponentIonic
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    ...exportables,
  ],
  entryComponents: [
    ...exportables
  ],
  providers: [ AmplifyService ],
  exports: [
    ...exportables
  ]
})
export class AmplifyIonicModule { }
