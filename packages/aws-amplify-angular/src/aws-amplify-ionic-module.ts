import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';
import * as components from './components';

import { DynamicComponentDirective } from './directives/dynamic.component.directive';


import { IonicModule } from '@ionic/angular';

const exportables = [
  components.AuthenticatorIonicComponent,
  components.ConfirmSignInComponentIonic,
  components.ConfirmSignUpComponentIonic,
  components.ForgotPasswordComponentIonic,
  components.GreetingComponentIonic,
  components.PhotoPickerIonicComponent,
  components.S3AlbumComponentIonic,
  components.S3ImageComponentIonic,
  components.SignInComponentIonic,
  components.SignUpComponentIonic,
  components.ChatbotComponentIonic,
  components.RequireNewPasswordComponentIonic
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
