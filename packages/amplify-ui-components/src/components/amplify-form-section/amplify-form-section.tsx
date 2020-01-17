import { Component, Prop, h, FunctionalComponent } from '@stencil/core';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { formSectionHeader, formSectionFooter } from './amplify-form-section.style';
import { AmplifyFormSectionHeaderProps, AmplifyFormSectionFooterProps } from './amplify-form-section-interface';

const STATIC_SECTION_HEADER_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--section-header`;
const STATIC_FORM_SECTION_FOOTER_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--section-footer`;

const AmplifyFormSectionHeader: FunctionalComponent<AmplifyFormSectionHeaderProps> = ({
  headerText,
  overrideStyle = false,
  testDataPrefix,
}) => (
  <div>
    <slot name="amplify-form-section-header">
      <div class={styleNuker(overrideStyle, STATIC_SECTION_HEADER_CLASS_NAME, formSectionHeader)}>
        <h3 data-test={testDataPrefix + '-header-section'}>{headerText}</h3>
      </div>
    </slot>
  </div>
);

const AmplifyFormSectionFooter: FunctionalComponent<AmplifyFormSectionFooterProps> = ({
  primaryContent,
  secondaryContent,
  overrideStyle = false,
}) => (
  <div>
    <slot name="amplify-form-section-footer">
      <div class={styleNuker(overrideStyle, STATIC_FORM_SECTION_FOOTER_CLASS_NAME, formSectionFooter)}>
        {primaryContent}
        {secondaryContent}
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
  /** String prefix for the data-test attributes in this component primarily used for testing purposes */
  @Prop() testDataPrefix?: string = 'form-section';

  @Prop() primaryFooterContent: string | FunctionalComponent = (
    <amplify-button
      type="submit"
      overrideStyle={this.overrideStyle}
      data-test={this.testDataPrefix + '-' + this.testDataPrefix + '-button'}
    >
      {this.submitButtonText}
    </amplify-button>
  );
  @Prop() secondaryFooterContent: string | FunctionalComponent | null = null;

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <amplify-section overrideStyle={this.overrideStyle}>
          <AmplifyFormSectionHeader
            headerText={this.headerText}
            overrideStyle={this.overrideStyle}
            testDataPrefix={this.testDataPrefix}
          />
          <slot />
          <AmplifyFormSectionFooter
            primaryContent={this.primaryFooterContent}
            secondaryContent={this.secondaryFooterContent}
            overrideStyle={this.overrideStyle}
          />
        </amplify-section>
      </form>
    );
  }
}
