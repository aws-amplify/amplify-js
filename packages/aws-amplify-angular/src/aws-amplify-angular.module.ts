import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';
import * as components from './components';
import { DynamicComponentDirective }          from './directives/dynamic.component.directive';


const exportables = [
  components.AuthenticatorComponent,
  components.AuthenticatorComponentCore,
  components.ConfirmSignInComponent,
  components.ConfirmSignInComponentCore,
  components.ConfirmSignUpComponent,
  components.ConfirmSignUpComponentCore,
  components.ForgotPasswordComponent,
  components.ForgotPasswordComponentCore,
  components.GreetingComponent,
  components.GreetingComponentCore,
  components.PhotoPickerComponent,
  components.PhotoPickerComponentCore,
  components.S3AlbumComponent,
  components.S3AlbumComponentCore,
  components.S3ImageComponent,
  components.S3ImageComponentCore,
  components.SignInComponent,
  components.SignInComponentCore,
  components.SignUpComponent,
  components.SignUpComponentCore
]


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DynamicComponentDirective,
    components.FormComponent,
    components.RequireNewPasswordComponent,
    ...exportables,
  ],
  entryComponents: [
    ...exportables
  ],
  providers: [ AmplifyService ],
  exports: [
    ...exportables,
    components.RequireNewPasswordComponent,
  ]
})
export class AmplifyAngularModule { }
