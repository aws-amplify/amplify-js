import { Component, FunctionalComponent as FC, Prop, h } from '@stencil/core';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { formSection, formSectionHeader, formSectionFooter } from './amplify-form-section.style';
import { AmplifyFormSectionHeaderProps, AmplifyFormSectionFooterProps } from './amplify-form-section-interface';

const STATIC_FORM_SECTION_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--form-section`;
const STATIC_SECTION_HEADER_CLASS_NAME =  `${AMPLIFY_UI_PREFIX}--section-header`;
const STATIC_FORM_SECTION_FOOTER_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--footer-section`;


const AmplifyFormSectionHeader: FC<AmplifyFormSectionHeaderProps> = ({ headerText, overrideStyle = false }) => (
  <div class={styleNuker(overrideStyle, STATIC_SECTION_HEADER_CLASS_NAME, formSectionHeader)}>
    <slot name="amplify-section-header">
      <h2>{headerText}</h2>
    </slot>
  </div>
);

const AmplifyFormSectionFooter: FC<AmplifyFormSectionFooterProps> = ({ submitButtonText, overrideStyle = false }) => (
  <div class={styleNuker(overrideStyle, STATIC_FORM_SECTION_FOOTER_CLASS_NAME, formSectionFooter)}>
    <slot name="amplify-section-footer">
      <amplify-button type="submit">{submitButtonText}</amplify-button>
    </slot>
  </div>
);

@Component({
  tag: 'amplify-form-section',
  shadow: false,
})
export class AmplifyFormSection {
  /** (Required) Function called upon submission of form */
  @Prop() handleSubmit: (inputEvent: Event) => void;
  /** (Optional) Used as a the default value within the default footer slot */
  @Prop() submitButtonText?: string = 'Submit';
  /** Used for form section header */
  @Prop() headerText: string = 'Amplify';
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle?: boolean = false;

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <amplify-section class={styleNuker(this.overrideStyle, STATIC_FORM_SECTION_CLASS_NAME, formSection)}>
          <div slot="amplify-section-header" >
            <AmplifyFormSectionHeader headerText={this.headerText} />
          </div>
          <div slot="amplify-section-body">
            <slot />
          </div>
          <div slot="amplify-section-footer">
            <AmplifyFormSectionFooter submitButtonText={this.submitButtonText} />
          </div>
        </amplify-section>
      </form>
    );
  }
}