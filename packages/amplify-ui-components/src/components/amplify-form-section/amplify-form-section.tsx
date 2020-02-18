import { Component, Prop, h, FunctionalComponent } from '@stencil/core';

@Component({
  tag: 'amplify-form-section',
  styleUrl: 'amplify-form-section.scss',
})
export class AmplifyFormSection {
  /** (Required) Function called upon submission of form */
  @Prop() handleSubmit: (event: Event) => void;
  /** (Optional) Used as a the default value within the default footer slot */
  @Prop() submitButtonText?: string = 'Submit';
  /** Used for form section header */
  @Prop() headerText: string;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle?: boolean = false;
  /** String prefix for the data-test attributes in this component primarily used for testing purposes */
  @Prop() testDataPrefix?: string = 'form-section';
  /** Loading state for the form */
  @Prop() loading?: boolean = false;
  /** Secondary footer component or text */
  @Prop() secondaryFooterContent: string | FunctionalComponent | null = null;

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <amplify-section overrideStyle={this.overrideStyle}>
          <div>
            <slot name="amplify-form-section-header">
              <div class="form-section-header">
                <h3 data-test={this.testDataPrefix + '-header-section'}>{this.headerText}</h3>
              </div>
            </slot>
          </div>
          <slot />
          <div>
            <slot name="amplify-form-section-footer">
              <div class="form-section-footer">
                <amplify-button type="submit" data-test={this.testDataPrefix + '-' + this.testDataPrefix + '-button'}>
                  <amplify-loading-spinner style={{ display: this.loading ? 'initial' : 'none' }} />
                  <span style={{ display: this.loading ? 'none' : 'initial' }}>{this.submitButtonText}</span>
                </amplify-button>
                {this.secondaryFooterContent}
              </div>
            </slot>
          </div>
        </amplify-section>
      </form>
    );
  }
}
