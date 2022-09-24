import { Component, h, Prop } from '@stencil/core';
import { icons, IconNameType } from '../amplify-icon/icons';

/**
 * @slot (default) - Content placed inside the button
 */
@Component({
	tag: 'amplify-sign-in-button',
	styleUrl: 'amplify-sign-in-button.scss',
	scoped: true,
})
export class AmplifySignInButton {
	/** Specifies the federation provider.*/
	@Prop() provider: 'amazon' | 'auth0' | 'facebook' | 'google' | 'oauth';

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<div class={`sign-in-button ${this.provider}`}>
				<button>
					{this.provider in icons && (
						<span class="icon">
							<amplify-icon name={this.provider as IconNameType} />
						</span>
					)}

					<span class="content">
						<slot />
					</span>
				</button>
			</div>
		);
	}
}
