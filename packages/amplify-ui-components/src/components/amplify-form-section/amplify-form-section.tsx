import { Component, Prop, h } from '@stencil/core';
import { formSection, formSectionFooter } from './amplify-form-section.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_FORM_SECTION_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-section`;
const STATIC_FORM_SECTION_FOOTER_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-section-footer`;

@Component({
  tag: 'amplify-form-section',
  shadow: false,
})
export class AmplifyFormSection {
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** Label for submit button */
  @Prop() buttonLabel: string = 'Submit';

  handleSubmit = (evt: Event) => {
    evt.preventDefault();

    console.log('Form submitted', evt);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} class={styleNuker(this.overrideStyle, STATIC_FORM_SECTION_CLASS_NAME, formSection)}>
        <div>
          <slot name="amplify-form-section-header" />
        </div>
        <div>
          <slot name="amplify-form-section-body" />
        </div>
        <div class={styleNuker(this.overrideStyle, STATIC_FORM_SECTION_FOOTER_CLASS_NAME, formSectionFooter)}>
          <slot name="amplify-form-section-footer" />
          <amplify-button type="submit">{this.buttonLabel}</amplify-button>
        </div>
      </form>
    );
  }
}