import { Component, Element, Prop, h } from '@stencil/core';

@Component({
	tag: 'amplify-section',
	styleUrl: 'amplify-section.scss',
})
export class AmplifySection {
	@Element() el: HTMLAmplifySectionElement;
	/** Equivalent to html section role */
	@Prop() role: string = 'application';

	render() {
		return (
			<section class="section" role={this.role}>
				<slot />
			</section>
		);
	}
}
