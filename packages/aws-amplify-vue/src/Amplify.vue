<template>
  <div></div>
</template>

<script>
// TODO: FIX SPREAD OPERATOR ERROR IN CIRCLECI TO ELIMINATE EXPLICIT IMPORTS AND USE BARRELS
import { 
  Authenticator,
  SignIn,
  SignUp,
  SignOut,
  ConfirmSignUp,
  ConfirmSignIn,
  ForgotPassword,
  SetMfa,
  Chatbot,
  PhotoPicker,
  S3Album,
  S3Image
} from './components';
import { AmplifyPlugin } from './plugins/AmplifyPlugin';
import AmplifyEventBus from './events/AmplifyEventBus';

export default {
  name: 'amplify',
  components: {
    Authenticator,
    SignIn,
    SignUp,
    SignOut,
    ConfirmSignUp,
    ConfirmSignIn,
    ForgotPassword,
    SetMfa,
    Chatbot,
    PhotoPicker,
    S3Album,
    S3Image
  },
  AmplifyPlugin,
  AmplifyEventBus,
}
</script>

<style src='@aws-amplify/ui/dist/style.css'></style>
<style src='@aws-amplify/ui/src/Angular.css'></style>
<style>
  .invalid {
    border-color: red;
  }
</style>
