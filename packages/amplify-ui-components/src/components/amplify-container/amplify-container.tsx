import { Component, h, Host, } from '@stencil/core';

/**
 * @slot (default) - Content placed within the container
 */
@Component({
  tag: 'amplify-container',
  styleUrl: 'amplify-container.scss',
})
export class AmplifyContainer {
  render() {
    return (
      <Host>
        <form autoComplete="on" hidden >
          <input name="username"></input>
          <input name="password" type="password"></input>
          <input type="submit"></input>
        </form>
        <slot></slot>
      </Host>
    );
  }
}
