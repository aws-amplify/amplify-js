import { createApp } from 'vue'
import App from './App.vue'



import Amplify, { Auth } from 'aws-amplify';

Amplify.configure({});
createApp(App).mount('#app')
