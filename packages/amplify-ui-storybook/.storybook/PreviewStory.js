import {
	DocsContext,
	getSourceProps,
	Preview,
	Story,
} from '@storybook/addon-docs/blocks';
import React, { useContext } from 'react';

export const PreviewStory = ({ id }) => {
	const context = useContext(DocsContext);
	const { code } = getSourceProps({ id }, context);
	console.log(context.storyStore.fromId(id));

	const frameworkCode = `
		import { ... } from '@aws-amplify/ui-react';

		export default function App() {
			return (
				${code
					.split('\n')
					.slice(1, -1)
					.join('\n')
					.trimLeft()}
			)
		}
	`
		.trim()
		.split('\t')
		.join('  ');

	console.log({ frameworkCode });
	return (
		<Preview mdxSource={frameworkCode}>
			<Story id={id} />
		</Preview>
	);
};
