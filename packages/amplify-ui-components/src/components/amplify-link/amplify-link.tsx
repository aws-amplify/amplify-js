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

	render() {
		return (
			<a class="link" role={this.role}>
				<slot />
			</a>
		);
	}
}
