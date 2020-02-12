import { Component, Prop, h, FunctionalComponent } from '@stencil/core';
import { AmplifyFormSectionHeaderProps, AmplifyFormSectionFooterProps } from './amplify-form-section-interface';

const AmplifyFormSectionHeader: FunctionalComponent<AmplifyFormSectionHeaderProps> = ({
  headerText,
  testDataPrefix,
}) => (
  <div>
    <slot name="amplify-form-section-header">
      <div class="form-section-header">
        <h3 data-test={testDataPrefix + '-header-section'}>{headerText}</h3>
      </div>
    </slot>
  </div>
);

const AmplifyFormSectionFooter: FunctionalComponent<AmplifyFormSectionFooterProps> = ({
  primaryContent,
  secondaryContent,
}) => (
  <div>
    <slot name="amplify-form-section-footer">
      <div class="form-section-footer">
        {primaryContent}
        {secondaryContent}
      </div>
    </slot>
  </div>
);

@Component({
  tag: 'amplify-form-section',
  styleUrl: 'amplify-form-section.scss',
})
export class AmplifyFormSection {
  /** (Required) Function called upon submission of form */
  @Prop() handleSubmit: (inputEvent: Event) => void;
  /** (Optional) Used as a the default value within the default footer slot */
  @Prop() submitButtonText?: string = 'Submit';
  /** Used for form section header */
  @Prop() headerText: string;
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
