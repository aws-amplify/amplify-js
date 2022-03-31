import { Hub } from '@aws-amplify/core';
const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

export const dispatchAuthEvent = (
	event: string,
	data: any,
	message: string
) => {
	Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};
