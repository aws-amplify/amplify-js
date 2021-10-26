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
