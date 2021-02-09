import { Component, h } from '@stencil/core';

/**
 * @slot (default) - Content for the hint
 */
@Component({
  tag: 'amplify-hint',
  styleUrl: 'amplify-hint.scss',
  scoped: true,
})
export class AmplifyHint {
  render() {
    return (
      <div class="hint">
        <slot />
      </div>
    );
  }
}
