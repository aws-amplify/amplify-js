import { Component, h } from '@stencil/core';

/**
 * @slot (default) - Content placed between the two horizontal rules
 */
@Component({
	tag: 'amplify-strike',
	styleUrl: 'amplify-strike.scss',
	scoped: true,
})
export class AmplifyStrike {
	render() {
		return (
			<span class="strike-content">
				<slot />
			</span>
		);
	}
}
