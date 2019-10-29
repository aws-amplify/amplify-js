import { Component, h, Prop } from '@stencil/core';
import { css, cx } from 'emotion';

@Component({ tag: 'amplify-sign-in-button' })
export class AmplifySignInButton {
  @Prop() class?: string;

  render() {
    console.log(this.class);

    return (
      <button
        class={cx(
          // .signInButton
          css`
            position: relative;
            width: 100%;
            border-radius: 4px;
            margin-bottom: 10px;
            cursor: pointer;
            padding: 0;
            color: var(--deepSquidInk);
            font-size: 14px;
            box-sizing: content-box;
            &:hover {
              opacity: 0.8;
            }
          `,
          // #googleSignInButton
          css`
            background-color: #4285f4;
            font-family: Roboto;
            border: 1px solid #4285f4;
            color: var(--white);
          `,
        )}
      >
        <span
          class={cx(
            // .signInButtonIcon
            css`
              position: absolute;
              left: 0;
            `,
            // #googleSignInButton > .signInButtonIcon
            css`
              background-color: var(--white);
              border-radius: 4px 0 0 4px;
              height: 28px;
              width: 28px;
              padding: 12px;
            `,
          )}
        >
          <slot name="icon" />
        </span>

        <span
          class={cx(
            // .signInButtonContent
            css`
              text-align: center;
              display: block;
              padding: 18px 0;
              text-align: left;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              text-align: center;
            `,
          )}
        >
          <slot />
        </span>
      </button>
    );
  }
}
