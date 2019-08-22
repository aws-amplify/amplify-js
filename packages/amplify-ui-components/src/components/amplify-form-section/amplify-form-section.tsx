import { Component, FunctionalComponent as FC, Prop, h } from '@stencil/core';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { formSectionHeader, formSectionFooter } from './amplify-form-section.style';
import { AmplifyFormSectionHeaderProps, AmplifyFormSectionFooterProps } from './amplify-form-section-interface';

const STATIC_SECTION_HEADER_CLASS_NAME =  `${AMPLIFY_UI_PREFIX}--section-header`;
const STATIC_FORM_SECTION_FOOTER_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--section-footer`;


const AmplifyFormSectionHeader: FC<AmplifyFormSectionHeaderProps> = ({ headerText, overrideStyle = false }) => (
  <div>
    <slot name="amplify-form-section-header">
      <div class={styleNuker(overrideStyle, STATIC_SECTION_HEADER_CLASS_NAME, formSectionHeader)}>
        <h2>{headerText}</h2>
      </div>
    </slot>
  </div>
);

const AmplifyFormSectionFooter: FC<AmplifyFormSectionFooterProps> = ({ submitButtonText, overrideStyle = false }) => (
  <div>
    <slot name="amplify-form-section-footer">
      <div class={styleNuker(overrideStyle, STATIC_FORM_SECTION_FOOTER_CLASS_NAME, formSectionFooter)}>
        <amplify-button type="submit">{submitButtonText}</amplify-button>
      </div>
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
        <amplify-section override-style={this.overrideStyle}>
          <AmplifyFormSectionHeader headerText={this.headerText} overrideStyle={this.overrideStyle} />
          <slot />
          <AmplifyFormSectionFooter submitButtonText={this.submitButtonText} overrideStyle={this.overrideStyle} />
        </amplify-section>
      </form>
    );
  }
}