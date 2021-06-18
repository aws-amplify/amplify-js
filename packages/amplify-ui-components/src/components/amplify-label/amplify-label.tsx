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

	render() {
		return (
			<label class="label" htmlFor={this.htmlFor}>
				<slot />
			</label>
		);
	}
}
