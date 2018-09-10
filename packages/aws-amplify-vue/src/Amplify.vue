<template>
  <div></div>
</template>

<script>
import * as components from './components';
import { AmplifyPlugin } from './plugins/AmplifyPlugin';
import AmplifyEventBus from './events/AmplifyEventBus';

export default {
  name: 'amplify',
  components: {
    ...components,
  },
  AmplifyPlugin,
  AmplifyEventBus,
}
</script>

<style src='@aws-amplify/ui/dist/style.css'></style>
<style src='@aws-amplify/ui/src/Angular.css'></style>
