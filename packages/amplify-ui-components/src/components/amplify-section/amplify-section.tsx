import { Component, Element, Prop, h } from '@stencil/core';

@Component({
	tag: 'amplify-section',
	styleUrl: 'amplify-section.scss',
})
export class AmplifySection {
	@Element() el: HTMLAmplifySectionElement;
	/** Equivalent to html section role */
	@Prop() role: string = 'application';

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<section class="section" role={this.role}>
				<slot />
			</section>
		);
	}
}
