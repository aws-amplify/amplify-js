import { Component, h } from '@stencil/core';

@Component({
	tag: 'amplify-nav',
	styleUrl: 'amplify-nav.scss',
	shadow: true,
})
export class AmplifyNav {
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}
	render() {
		return (
			<nav class="nav">
				<slot />
			</nav>
		);
	}
}
