import { Component, Prop, h } from '@stencil/core';

import { Logger } from '@aws-amplify/core';

const logger = new Logger('Toast');

@Component({
  tag: 'amplify-toast',
  shadow: false,
})
export class AmplifyToast {
  @Prop() message: string;

  componentDidLoad() {
    logger.info('Toast has completed loading.');
  }
  render() {
    return <div>Toast!</div>;
  }
}
