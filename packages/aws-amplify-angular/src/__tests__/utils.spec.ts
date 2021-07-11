import { Hub, HubPayload } from '@aws-amplify/core';
import { fromHub } from '../utils';

describe('fromHub', () => {
	it('should emit a HubCapsule event when subscribed to the channel and eventName', done => {
		const payload: HubPayload = {
			event: 'customOAuthState',
			data: 'some state',
			message: 'some message state',
		};
		fromHub('auth', 'customOAuthState').subscribe(c => {
			expect(c.channel).toEqual('auth');
			expect(c.payload.data).toEqual('some state');
			expect(c.payload.event).toEqual('customOAuthState');
			done();
		});

		Hub.dispatch('auth', payload, 'Auth', Symbol.for('amplify_default'));
	});
});
