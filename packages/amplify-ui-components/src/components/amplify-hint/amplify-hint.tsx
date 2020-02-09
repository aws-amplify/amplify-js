import { Component, h, Prop } from '@stencil/core';
// import { hint } from './amplify-hint.style';
// import { styleNuker } from '../../common/helpers';
// import { AMPLIFY_UI_PREFIX } from '../../common/constants';

// const STATIC_HINT_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--hint`;

@Component({
  tag: 'amplify-hint',
  styleUrl: 'amplify-hint.scss',
  shadow: true,
})
export class AmplifyHint {
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <div class="hint">
        <slot />
      </div>
    );
  }
}
