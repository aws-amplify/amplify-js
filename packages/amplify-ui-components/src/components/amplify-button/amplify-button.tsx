import { Element, Component, Prop, h } from '@stencil/core';
import { ButtonTypes, ButtonVariant } from '../../common/types/ui-types';
import { hasShadowDom } from '../../common/helpers';

@Component({
  tag: 'amplify-button',
  styleUrl: 'amplify-button.scss',
  shadow: true,
})
export class AmplifyButton {
  @Element() el!: HTMLElement;
  /** Type of the button: 'button', 'submit' or 'reset' */
  @Prop() type: ButtonTypes = 'button';
  /** Variant of a button: 'button' | 'anchor' */
  @Prop() variant: ButtonVariant = 'button';
  /** (Optional) Callback called when a user clicks on the button */
  @Prop() handleButtonClick: (evt: Event) => void;
  /** Disabled state of the button */
  @Prop() disabled?: boolean = false;

  private handleClick = (ev: Event) => {
    if (this.handleButtonClick) {
      this.handleButtonClick(ev);
    } else if (hasShadowDom(this.el) && this.type == 'submit') {
      // this button wants to specifically submit a form
      // climb up the dom to see if we're in a <form>
      // and if so, then use JS to submit it
      let form = this.el.closest('form');

      if (!form) {
        // Check for form inside of form section's shadow dom
        const formSection = this.el.closest('amplify-form-section');
        form = formSection && formSection.shadowRoot.querySelector('form');
      }
      if (form) {
        ev.preventDefault();
        form.requestSubmit();
      }
    }
  };

  render() {
    return (
      <button
        class={{
          [this.variant]: true,
        }}
        type={this.type}
        disabled={this.disabled}
        onClick={this.handleClick}
      >
        <slot />
      </button>
    );
  }
}
