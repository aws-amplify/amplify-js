import { HubClass, InferHubTypes } from '../src';

function assertType<T>(_: T): void {}

type ChannelMap = {
	channel1: {
		event: {
			field1: boolean;
			field2: number;
		};
		event2: number | undefined;
		event3: undefined;
	};
	channel2: {
		event: {
			field1: boolean;
			field2: number;
		};
		event2: boolean | undefined;
	};
};

const hub = new HubClass<ChannelMap>('TypedHub');

describe('Hub type tests', () => {
	test('Typed listen', () => {
		hub.listen('channel1', test => {
			if (test.payload.event === 'event') {
				assertType<boolean>(test.payload.data.field1);
			} else if (test.payload.event === 'event2') {
				assertType<number | undefined>(test.payload.data);
			} else if (test.payload.event === 'event3') {
				assertType<undefined>(test.payload.data);
			}
		});

		hub.listen('unknownChannel', test => {
			assertType<any>(test.payload.data);
			assertType<string>(test.payload.event);
		});

		const regex = /test/;
		hub.listen(regex, test => {
			assertType<any>(test.payload.data);
			assertType<string>(test.payload.event);
		});
	});

	test('Typed dispatch', () => {
		hub.dispatch('channel1', {
			event: 'event',
			data: { field1: true, field2: 2 },
		});
		hub.dispatch('channel1', { event: 'event2', data: 42 });
		hub.dispatch('channel1', { event: 'event3' });

		// NOTE [Nikola Milovic] If typescript version gets updated to > 3.9.0 we can also use expect errors to further test the types
		// (@)ts-expect-error
		/* testHub.dispatch("channel1", { event: "event" }); */
	});

	test('Composite Hubs', () => {
		type CustomPayloadType = { channel1: { event: boolean } };
		type OtherPayloadType = { channel2: { event: number; event2: boolean } };
		const OtherHub = new HubClass<OtherPayloadType>('__default__');
		const CompositeHub = new HubClass<
			CustomPayloadType & InferHubTypes<typeof OtherHub>
		>('HubName');

		// Has access to channels from both Hubs
		CompositeHub.listen('channel1', _ => {});
		CompositeHub.listen('channel2', _ => {});
	});
});
