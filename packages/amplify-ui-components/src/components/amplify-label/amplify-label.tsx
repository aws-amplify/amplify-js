import { Component, Prop, h } from '@stencil/core';

/**
 * @slot (default) - Label content
 */
@Component({
	tag: 'amplify-label',
	styleUrl: 'amplify-label.scss',
})
export class AmplifyLabel {
	/** Reflects the value of the for content property of html element */
	@Prop() htmlFor: string;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<label class="label" htmlFor={this.htmlFor}>
				<slot />
			</label>
		);
	}
}
