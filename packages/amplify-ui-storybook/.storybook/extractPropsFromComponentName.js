import { components } from '@aws-amplify/ui-components/dist/docs.json';
import { extractProps } from '@storybook/addon-docs/dist/frameworks/react/extractProps';

// Borrowed from https://github.com/storybookjs/storybook/blob/aed5276e0bc05d1126b592b649499125508015be/addons/docs/src/frameworks/web-components/config.js
export function mapData(data) {
	return data.map(function mapItem(item) {
		return {
			name: item.name,
			type: { summary: item.type, detail: undefined },
			required: item.required,
			description: item.docs,
			defaultValue: {
				summary: item.default === undefined ? '-' : item.default,
				detail: undefined,
			},
		};
	});
}

export function extractPropsFromComponentName(tagName) {
	const component = components.find(function compareTag(component) {
		return component.tag === tagName;
	});

	// Default to Storybook's automatic type extraction
	if (!component) {
		return extractProps(tagName);
	}

	const sections = ['props', 'methods', 'events', 'styles', 'slots'].reduce(
		(acc, section) => {
			if (component[section].length) {
				acc[section] = mapData(component[section]);
			}

			return acc;
		},
		{}
	);

	return { sections };
}
