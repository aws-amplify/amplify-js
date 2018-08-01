import { Type } from '@angular/core';
// import { AuthenticatorIonicComponent } from '../components/authenticator/authenticator/authenticator.component.ionic';
import { AuthenticatorComponentCore } from '../components/authenticator/authenticator/authenticator.component.core';
// import { ConfirmSignInComponentIonic } from '../components/authenticator/confirm-sign-in-component/confirm-sign-in-component.ionic'
import { ConfirmSignInComponentCore } from '../components/authenticator/confirm-sign-in-component/confirm-sign-in-component.core';
// import { ConfirmSignUpComponentIonic } from '../components/authenticator/confirm-sign-up-component/confirm-sign-up.component.ionic'
import { ConfirmSignUpComponentCore } from '../components/authenticator/confirm-sign-up-component/confirm-sign-up.component.core';
// import { ForgotPasswordComponentIonic } from '../components/authenticator/forgot-password-component/forgot-password.component.ionic';
import { ForgotPasswordComponentCore } from '../components/authenticator/forgot-password-component/forgot-password.component.core';
// import { GreetingComponentIonic } from '../components/authenticator/greeting-component/greeting.component.ionic';
import { GreetingComponentCore } from '../components/authenticator/greeting-component/greeting.component.core';
// import { RequireNewPasswordComponentIonic } from '../components/authenticator/require-new-password-component/require-new-password.component.ionic';
import { RequireNewPasswordComponentCore } from '../components/authenticator/require-new-password-component/require-new-password.component.core';
// import { SignInComponentIonic } from '../components/authenticator/sign-in-component/sign-in.component.ionic';
import { SignInComponentCore } from '../components/authenticator/sign-in-component/sign-in.component.core';
// import { SignUpComponentIonic } from '../components/authenticator/sign-up-component/sign-up.component.ionic';
import { SignUpComponentCore } from '../components/authenticator/sign-up-component/sign-up.component.core';
// import { ChatbotComponentIonic } from '../components/interactions/chatbot/chatbot.component.ionic';
import { ChatbotComponentCore } from '../components/interactions/chatbot/chatbot.component.core';
// import { PhotoPickerIonicComponent } from '../components/storage/photo-picker-component/photo-picker.component.ionic';
import { PhotoPickerComponentCore } from '../components/storage/photo-picker-component/photo-picker.component.core';
// import { S3AlbumComponentIonic } from '../components/storage/s3-album-component/s3-album.component.ionic';
import { S3AlbumComponentCore } from '../components/storage/s3-album-component/s3-album.component.core';
// import { S3ImageComponentIonic } from '../components/storage/s3-image-component/s3-image.component.ionic'
import { S3ImageComponentCore } from '../components/storage/s3-image-component/s3-image.component.core';


class ComponentMount {
  constructor(public component: Type<any>, public data: any) {}
}


const ComponentMountFactory = function (componentType, data): ComponentMount {
  const mount = new ComponentMount(componentMap[componentType], data);
  return mount;
}

const componentMap = {
  authenticatorCore: AuthenticatorComponentCore,
  // authenticatorIonic: AuthenticatorIonicComponent,
  confirmSignInCore: ConfirmSignInComponentCore,
  // confirmSignInIonic: ConfirmSignInComponentIonic,
  confirmSignUpCore: ConfirmSignUpComponentCore,
  // confirmSignUpIonic: ConfirmSignUpComponentIonic,
  forgotPasswordCore: ForgotPasswordComponentCore,
  // forgotPasswordIonic: ForgotPasswordComponentIonic,
  greetingCore: GreetingComponentCore,
  // greetingIonic: GreetingComponentIonic,
  requireNewPasswordCore: RequireNewPasswordComponentCore,
  // requireNewPasswordIonic: RequireNewPasswordComponentIonic,
  signInCore: SignInComponentCore,
  // signInIonic: SignInComponentIonic,
  signUpCore: SignUpComponentCore,
  // signUpIonic: SignUpComponentIonic,
  chatbotCore: ChatbotComponentCore,
  // chatobotIonic: ChatbotComponentIonic,
  photoPickerCore: PhotoPickerComponentCore,
  // photoPickerIonic: PhotoPickerIonicComponent,
  s3AlbumCore: S3AlbumComponentCore,
  // s3AlbumIonic: S3AlbumComponentIonic,
  s3ImageCore: S3ImageComponentCore,
  // s3ImageIonic: S3ImageComponentIonic
}

export { ComponentMountFactory, ComponentMount } ;