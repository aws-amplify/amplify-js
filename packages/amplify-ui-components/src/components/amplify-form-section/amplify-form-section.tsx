import { Component, Prop, h } from '@stencil/core';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { formSectionFooter, formSection } from './amplify-form-section.style';

const STATIC_FORM_SECTION_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-section`;
const STATIC_FORM_SECTION_FOOTER_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--footer-section`;
@Component({
  tag: 'amplify-form-section',
  shadow: false,
})
export class AmplifyFormSection {
  /** (Required) Submit function used when form is submitted */
  @Prop() handleSubmit: (inputEvent: Event) => void;
  /** (Optional) Used as a the default value within the default footer slot */
  @Prop() buttonLabel?: string = 'Submit';
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle?: boolean = false;

  render() {
    return (
      <amplify-section class={styleNuker(this.overrideStyle, STATIC_FORM_SECTION_CLASS_NAME, formSection)}>
        <form onSubmit={this.handleSubmit}>
          <slot name="amplify-form-section-header">
            <amplify-section-header>Create a new account</amplify-section-header>
          </slot>
          <slot name="amplify-form-section-body">
            <amplify-form-field label="Email Address *" placeholder="email@example.com" type="email"></amplify-form-field>
            <amplify-form-field label="Phone Number *" placeholder="555-555-5555" type="tel"></amplify-form-field>
            <amplify-form-field label="Password *" placeholder="Create a password" type="password"></amplify-form-field>
          </slot>
          <slot name="amplify-form-section-footer">
            <amplify-button type="submit" class={styleNuker(this.overrideStyle, STATIC_FORM_SECTION_FOOTER_CLASS_NAME, formSectionFooter)}>{this.buttonLabel}</amplify-button>
          </slot>
        </form>
      </amplify-section>
    );
  }
}