import Amplify from 'aws-amplify';

export function withAmplify(storyFn) {
	Amplify.configure({});

	return storyFn();
}
