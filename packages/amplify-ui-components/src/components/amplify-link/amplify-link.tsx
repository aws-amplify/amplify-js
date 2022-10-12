import { Component, Element, Prop, h } from '@stencil/core';

@Component({
	tag: 'amplify-link',
	styleUrl: 'amplify-link.scss',
	shadow: true,
})
export class AmplifyLink {
	@Element() el: HTMLAmplifyLinkElement;
	/** The link role is used to identify an element that creates a hyperlink to a resource that is in the application or external */
	@Prop() role: string = 'navigation';

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<a class="link" role={this.role}>
				<slot />
			</a>
		);
	}
}
