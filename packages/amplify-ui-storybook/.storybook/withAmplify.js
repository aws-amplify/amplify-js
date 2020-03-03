import Amplify from 'aws-amplify';

export const withAmplify = storyFn => {
	Amplify.configure({});

	return storyFn();
};
