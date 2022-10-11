import { Component, Prop, Watch } from '@stencil/core';
import { icons, IconNameType } from './icons';

@Component({
	tag: 'amplify-icon',
	styleUrl: 'amplify-icon.scss',
	scoped: true,
})
export class AmplifyIcon {
	/** (Required) Name of icon used to determine the icon rendered */
	@Prop() name: IconNameType;

	@Watch('name')
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	validateName(newValue: string) {
		const isBlank = typeof newValue == null;
		if (isBlank) {
			throw new Error('name: required');
		}
	}

	// https://stenciljs.com/docs/templating-jsx#avoid-shared-jsx-nodes
	render() {
		return icons[this.name]();
	}
}
