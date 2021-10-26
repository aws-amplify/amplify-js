import { Component, Prop, h, FunctionalComponent, Listen } from '@stencil/core';

/**
 * @slot amplify-form-section-header - Content for the header section
 * @slot subtitle - Content for the subtitle. This is inside of `amplify-form-section-header`.
 * @slot amplify-form-section-footer - Content for the footer section.
 */
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
	/** String prefix for the data-test attributes in this component primarily used for testing purposes */
	@Prop() testDataPrefix?: string = 'form-section';
	/** Loading state for the form */
	@Prop() loading?: boolean = false;
	/** Secondary footer component or text */
	@Prop() secondaryFooterContent: string | FunctionalComponent | null = null;

	// eslint-disable-next-line
	@Listen('formSubmit')
	handleFormSubmit(ev) {
		this.handleSubmit(ev.detail);
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<amplify-section>
					<div>
						<slot name="amplify-form-section-header">
							<div class="form-section-header">
								<h3
									class="header"
									data-test={this.testDataPrefix + '-header-section'}
								>
									{this.headerText}
								</h3>
								<div class="subtitle">
									<slot name="subtitle"></slot>
								</div>
							</div>
						</slot>
					</div>

					<slot />
					<div>
						<slot name="amplify-form-section-footer">
							<div class="form-section-footer">
								<amplify-button
									type="submit"
									data-test={
										this.testDataPrefix + '-' + this.testDataPrefix + '-button'
									}
								>
									{this.loading ? (
										<amplify-loading-spinner />
									) : (
										<span>{this.submitButtonText}</span>
									)}
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
