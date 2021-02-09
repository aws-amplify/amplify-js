import { Component, h } from '@stencil/core';

@Component({
  tag: 'amplify-loading-spinner',
  styleUrl: 'amplify-loading-spinner.scss',
})
export class AmplifyLoadingSpinner {
  render() {
    return <amplify-icon class="loading-spinner" name="loading" />;
  }
}
